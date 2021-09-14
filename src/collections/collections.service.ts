import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { random } from 'lodash';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { MYTH_CHANCE } from 'src/constants/rules';
import {
  checkIsRareCaseCollection,
  getBlendResultTier,
  getCollectionFromMon,
  getLevelDownCollection,
  getLevelUpCollection,
  getSpecialBlendResult,
  getTrainerClass,
} from 'src/lib/project-utils';
import { Mon } from 'src/mons/mon.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { RareNews } from 'src/rare-news/rare-news.entity';
import { HuntMethod, MonTier, PokeBallType } from 'src/types';
import { User } from 'src/users/user.entity';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { Collection } from './collection.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Mon)
    private readonly monRepository: Repository<Mon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PokeBall)
    private readonly pokeBallRepository: Repository<PokeBall>,
    @InjectRepository(RareNews)
    private readonly rareNewsRepository: Repository<RareNews>,
  ) {}

  @Transaction()
  async hunt(
    accessToken: string,
    pokeBallType: PokeBallType,
    @TransactionRepository(User) trxUserRepository?: Repository<User>,
    @TransactionRepository(PokeBall)
    trxPokeBallRepository?: Repository<PokeBall>,
    @TransactionRepository(Collection)
    trxCollectionRepository?: Repository<Collection>,
  ) {
    const user = await trxUserRepository.findOne({ accessToken });

    if (!user) {
      throw new UnauthorizedException();
    }

    const pokeBall = await user.pokeBall;

    // user pokeBall 차감
    const key = `${pokeBallType}PokeBalls`;
    const updatedAmount = pokeBall[key] - 1;
    if (updatedAmount < 0) {
      throw new BadRequestException({
        errorMessage: 'Pokeball amount is not enough.',
      });
    }
    await trxPokeBallRepository.update(pokeBall.id, {
      [key]: updatedAmount,
    });

    // 포켓몬 선정
    const tiers: MonTier[] = [];
    switch (pokeBallType) {
      case 'basicRare':
        tiers.push('rare');
      case 'basic':
        tiers.push('basic');
        break;
      case 'rare':
        tiers.push('rare');
        break;
      case 'elite':
        tiers.push('elite');
        break;
      case 'legend':
        tiers.push('legend');
        break;
    }

    const candidateMons = await this.monRepository
      .createQueryBuilder('mon')
      .innerJoin('mon.monImages', 'monImage')
      .where('mon.tier IN (:...tiers)', { tiers: tiers })
      .getMany();

    if (!candidateMons.length) {
      throw new InternalServerErrorException({
        errorMessage: 'No candidate Pokemons.',
      });
    }

    let luckyCandidateMons = [];
    let isLucky = false;
    if (pokeBallType === 'basic') {
      const luckyNumber = random(0, MYTH_CHANCE);
      isLucky = luckyNumber === MYTH_CHANCE;
      if (isLucky) {
        luckyCandidateMons = await this.monRepository
          .createQueryBuilder('mon')
          .innerJoin('mon.monImages', 'monImage')
          .where('mon.tier IN (:...tiers)', { tiers: ['myth'] })
          .getMany();
      }
    }
    console.log('===== candidateMons', candidateMons);

    const adoptedMonIndex = random(
      0,
      (isLucky ? luckyCandidateMons : candidateMons).length - 1,
    );
    const adoptedMon = candidateMons[adoptedMonIndex];

    console.log('===== adoptedMonIndex', adoptedMonIndex);
    console.log('===== adoptedMon', adoptedMon);

    // 콜렉션
    const existCollection = await trxCollectionRepository.findOne({
      where: [{ userId: user.id, monId: adoptedMon.id }],
    });

    const result = await this.getHuntResultFromExistCollection({
      colPointToUpdate: 0,
      collectionRepository: trxCollectionRepository,
      userRepository: trxUserRepository,
      user,
      mon: adoptedMon,
      existCollection,
      method: 'hunt',
    });

    return result;
  }

  async findOne(id: number) {
    const collection = await this.collectionRepository.findOne(id);
    if (!collection) {
      throw new NotFoundException();
    }
    await collection.mon;
    await collection.monImage;
    return collection;
  }

  async findAllByUser(userId: string) {
    const collections = await this.collectionRepository.find({ userId });
    if (!collections) {
      throw new NotFoundException();
    }
    return collections;
  }

  @Transaction()
  async evolve(
    accessToken: string,
    collectionId: number,
    monId: number, // 진화할 포켓몬 아이디
    @TransactionRepository(Collection)
    trxCollectionRepository?: Repository<Collection>,
    @TransactionRepository(User)
    trxUserRepository?: Repository<User>,
  ) {
    const user = await trxUserRepository.findOne({ accessToken });
    const collection = await trxCollectionRepository.findOne(collectionId);

    let updatedColPoint = 0;
    if (collection.evolutionLevel > collection.level) {
      throw new BadRequestException(
        'Collection is not required level to evolve.',
      );
    }

    const mon = await collection.mon;
    const monsEvolveTo = await this.monRepository.find({
      evolveFromId: mon.id,
    });

    if (!monsEvolveTo.length) {
      throw new BadRequestException('Collection can not evolve.');
    }

    if (collection.level > collection.evolutionLevel) {
      // 기존 콜렉션의 레벨 하락
      const updatedCollection = getLevelDownCollection(
        collection,
        mon,
        mon.evolutionLevel,
      );
      await trxCollectionRepository.update(collection.id, updatedCollection);
    } else {
      // 기존 콜렉션 삭제
      trxCollectionRepository.delete(collection.id);
      const mon = await collection.mon;
      updatedColPoint -= mon.colPoint;
    }
    const monEvolveTo = monsEvolveTo.find((mon) => mon.id === monId);

    if (!monsEvolveTo) {
      throw new BadRequestException(
        'Collection can not evolve to the Pokemon.',
      );
    }

    const collectionEvolveTo = await trxCollectionRepository.findOne({
      monId: monEvolveTo.id,
    });

    const result = await this.getHuntResultFromExistCollection({
      colPointToUpdate: updatedColPoint,
      collectionRepository: trxCollectionRepository,
      userRepository: trxUserRepository,
      mon: monEvolveTo,
      existCollection: collectionEvolveTo,
      user,
      method: 'evolve',
    });

    if (monEvolveTo.id === 291) {
      // 아이스크로 진화하는 경우 껍질몬 추가
      const existCollection = await trxCollectionRepository.findOne({
        monId: 292,
      });
      const mon = await this.monRepository.findOne(292);
      await this.getHuntResultFromExistCollection({
        colPointToUpdate: result.updatedColPoint,
        collectionRepository: trxCollectionRepository,
        userRepository: trxUserRepository,
        mon,
        existCollection,
        user,
        method: 'evolve',
      });
    }

    return result;
  }

  async syncWithMon() {
    const allCollections = await this.collectionRepository.find();
    allCollections.forEach(async (collection) => {
      const mon = await this.monRepository.findOne(collection.monId);
      if (mon) {
        const updatedCollection = {
          ...collection,
          name: mon.name,
          nameKo: mon.nameKo,
          nameJa: mon.nameJa,
          nameZh: mon.nameZh,
          colPoint: mon.colPoint,
          stars: mon.stars,
          tier: mon.tier,
          firstType: mon.firstType,
          secondType: mon.secondType,
          evolutionLevel: mon.evolutionLevel,
        };
        await this.collectionRepository.update(
          collection.id,
          updatedCollection,
        );
      }
    });
  }

  @Transaction()
  async blend(
    accessToken: string,
    collectionIds: number[],
    @TransactionRepository(Collection)
    trxCollectionRepository?: Repository<Collection>,
    @TransactionRepository(User)
    trxUserRepository?: Repository<User>,
  ) {
    const user = await trxUserRepository.findOne({ accessToken });
    const collection1 = await trxCollectionRepository.findOne(collectionIds[0]);
    const collection2 = await trxCollectionRepository.findOne(collectionIds[1]);
    if (!user || !collection1 || !collection2) {
      throw new BadRequestException();
    }

    const collectionsToBlend = [collection1, collection2];

    let updatedColPoint = 0;

    const resultTier = getBlendResultTier(
      collectionsToBlend.map((collection) => collection.tier),
    );

    const specialBlendResult = getSpecialBlendResult(collectionsToBlend);

    let candidateMons: Mon[];
    if (specialBlendResult) {
      candidateMons = await this.monRepository.find({
        where: specialBlendResult.map((monId) => ({ id: monId })),
      });
    } else {
      candidateMons = await this.monRepository
        .createQueryBuilder('mon')
        .innerJoin('mon.monImages', 'monImage')
        .where('mon.tier = :tier', { tier: resultTier })
        .getMany();
    }

    if (!candidateMons.length) {
      throw new InternalServerErrorException({
        errorMessage: 'No candidate Pokemons.',
      });
    }

    collectionsToBlend.reduce(async (prev, collection) => {
      await prev;
      const mon = await this.monRepository.findOne(collection.monId);
      if (collection.level === 1) {
        updatedColPoint -= mon.colPoint;
        await trxCollectionRepository.delete(collection.id);
      } else {
        const levelDownCollection = getLevelDownCollection(collection, mon, 1);
        await trxCollectionRepository.update(
          collection.id,
          levelDownCollection,
        );
      }
    }, Promise.resolve());

    const adoptedMon = candidateMons[random(0, candidateMons.length - 1)];

    const existCollection = await trxCollectionRepository.findOne({
      monId: adoptedMon.id,
    });

    const result = await this.getHuntResultFromExistCollection({
      collectionRepository: trxCollectionRepository,
      userRepository: trxUserRepository,
      colPointToUpdate: updatedColPoint,
      mon: adoptedMon,
      existCollection,
      user,
      method: 'blend',
    });

    return result;
  }

  async getHuntResultFromExistCollection({
    collectionRepository,
    userRepository,
    colPointToUpdate,
    mon,
    user,
    existCollection,
    method,
  }: {
    collectionRepository: Repository<Collection>;
    userRepository: Repository<User>;
    colPointToUpdate: number;
    mon: Mon;
    user: User;
    existCollection?: Collection;
    method: HuntMethod;
  }) {
    const result: {
      oldCollection: Collection | null;
      newCollection: Collection | null;
      updatedColPoint: number;
      trainerClass: number;
    } = {
      oldCollection: null,
      newCollection: null,
      updatedColPoint: 0,
      trainerClass: 0,
    };

    const recentUser = await userRepository.findOne(user.id);
    if (existCollection) {
      // 레벨업
      const updatedCollection = getLevelUpCollection(
        existCollection,
        mon,
        user,
      );
      await collectionRepository.update(existCollection.id, updatedCollection);
      await existCollection.mon;
      await existCollection.monImage;
      const newCollection = {
        ...existCollection,
        ...updatedCollection,
      };
      result.oldCollection = existCollection;
      result.newCollection = newCollection;
    } else {
      // 생성
      const monImages = await mon.monImages;
      const newCollection = getCollectionFromMon({
        mon: mon,
        monImages,
        userId: user.id,
      });
      colPointToUpdate += mon.colPoint;
      const savedCollection = await collectionRepository.save(newCollection);
      console.log('===== savedCollection', savedCollection);

      if (checkIsRareCaseCollection(savedCollection)) {
        console.log('===== save rare news');
        await this.rareNewsRepository.save({
          userId: user.id,
          collectionId: savedCollection.id,
          method,
        });
      }

      const foundCollection = await collectionRepository.findOne(
        savedCollection.id,
      );
      await foundCollection.mon;
      await foundCollection.monImage;
      result.oldCollection = null;
      console.log('===== foundCollection', foundCollection);
      result.newCollection = foundCollection;
    }
    result.updatedColPoint = colPointToUpdate;

    const updatedTrainerClass =
      colPointToUpdate > 0
        ? getTrainerClass(recentUser.colPoint + colPointToUpdate)
        : 0;

    if (recentUser.trainerClass < updatedTrainerClass) {
      result.trainerClass = updatedTrainerClass;
    }

    const updatedUser = new User();

    updatedUser.colPoint = recentUser.colPoint + colPointToUpdate;
    if (result.trainerClass) {
      updatedUser.trainerClass = result.trainerClass;
    }

    await userRepository.update(user.id, updatedUser);
    console.log('===== updatedUser', updatedUser);
    return result;
  }

  async getRanking(options: IPaginationOptions) {
    const queryBuilder = this.collectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.user', 'member')
      .orderBy('collection.total', 'DESC');
    const result = await paginate(queryBuilder, options);
    return result;
  }

  async getProfileMons(userId: string) {
    const topMons = await this.collectionRepository.find({
      order: {
        total: 'DESC',
      },
      where: [
        {
          userId,
        },
      ],
      take: 3,
    });

    const topMonRanks = await this.collectionRepository.query(`
        SELECT *
        FROM (
          SELECT id, RANK() OVER(ORDER BY total DESC) AS ranking
          FROM collection
        ) AS collection
        WHERE id IN (${topMons.map((mon) => mon.id).join(',')});
      `);

    const recentMons = await this.collectionRepository.find({
      order: {
        createdAt: 'DESC',
      },
      where: [
        {
          userId,
        },
      ],
      take: 3,
    });

    return {
      topMons,
      topMonRanks: topMonRanks.map((item) => Number(item.ranking)),
      recentMons,
    };
  }

  @Transaction()
  async deleteCollection(
    collectionId: number,
    @TransactionRepository(User) trxUserRepository?: Repository<User>,
    @TransactionRepository(Collection)
    trxCollectionRepository?: Repository<Collection>,
  ) {
    const targetCollection = await trxCollectionRepository.findOne(
      collectionId,
    );
    const mon = await targetCollection.mon;
    await trxCollectionRepository.delete(collectionId);
    const user = await trxUserRepository.findOne(targetCollection.userId);
    await trxUserRepository.update(user.id, {
      colPoint: user.colPoint - mon.colPoint,
    });
  }
}
