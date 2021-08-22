import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { random } from 'lodash';
import {
  getCollectionFromMon,
  getLevelDownCollection,
  getLevelUpCollection,
} from 'src/lib/project-utils';
import { Mon } from 'src/mons/mon.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { MonTier, PokeBallType } from 'src/types';
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
  ) {}

  @Transaction()
  async hunt(
    accessToken: string,
    pokeBallType: PokeBallType,
    amount: number,
    @TransactionRepository(User) trxUserRepository?: Repository<User>,
    @TransactionRepository(PokeBall)
    trxPokeBallRepository?: Repository<PokeBall>,
    @TransactionRepository(Collection)
    trxCollectionRepository?: Repository<Collection>,
  ) {
    const user = await trxUserRepository.findOne({ accessToken });
    const pokeBall = await user.pokeBall;

    // user pokeBall 차감
    const key = `${pokeBallType}PokeBalls`;
    const updatedAmount = pokeBall[key] - amount;
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
      .where('mon.tier IN (:...tiers)', { tiers })
      .getMany();

    if (!candidateMons.length) {
      throw new InternalServerErrorException({
        errorMessage: 'No candidate Pokemons.',
      });
    }

    const result: {
      oldCollection: Collection | null;
      newCollection: Collection;
    }[] = [];

    await Array.from({ length: amount }).reduce(async (prev: Promise<void>) => {
      await prev;

      const adoptedMonIndex = random(0, candidateMons.length - 1);
      const adoptedMon = candidateMons[adoptedMonIndex];
      const monImages = await adoptedMon.monImages;

      // 콜렉션
      const existCollection = await trxCollectionRepository.findOne({
        where: [{ userId: user.id, monId: adoptedMon.id }],
      });

      if (existCollection) {
        // 콜렉션 레벨업
        const updatedCollection = getLevelUpCollection(
          existCollection,
          adoptedMon,
        );
        await trxCollectionRepository.update(
          existCollection.id,
          updatedCollection,
        );
        await existCollection.mon;
        await existCollection.monImage;
        const newCollection = {
          ...existCollection,
          ...updatedCollection,
        };
        result.push({ oldCollection: existCollection, newCollection });
      } else {
        // 콜렉션 생성
        const newCollection = getCollectionFromMon({
          mon: adoptedMon,
          monImages,
          userId: user.id,
        });
        await trxUserRepository.update(user.id, {
          colPoint: user.colPoint + adoptedMon.colPoint,
        });
        const savedCollection = await trxCollectionRepository.save(
          newCollection,
        );
        const foundCollection = await trxCollectionRepository.findOne(
          savedCollection.id,
        );
        await foundCollection.mon;
        await foundCollection.monImage;
        result.push({ oldCollection: null, newCollection: foundCollection });
      }
    }, Promise.resolve());

    return result;
  }

  async findOne(id: number) {
    const collection = await this.collectionRepository.findOne(id);
    await collection.mon;
    await collection.monImage;
    if (!collection) {
      throw new NotFoundException();
    }
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

    const result: {
      oldCollection: Collection | null;
      newCollection: Collection | null;
    } = {
      oldCollection: null,
      newCollection: null,
    };

    if (collectionEvolveTo) {
      // 레벨업
      const updatedCollection = getLevelUpCollection(
        collectionEvolveTo,
        monEvolveTo,
      );
      await trxCollectionRepository.update(
        collectionEvolveTo.id,
        updatedCollection,
      );
      await collectionEvolveTo.mon;
      await collectionEvolveTo.monImage;
      const newCollection = {
        ...collectionEvolveTo,
        ...updatedCollection,
      };
      result.oldCollection = collectionEvolveTo;
      result.newCollection = newCollection;
    } else {
      // 생성
      const monImages = await monEvolveTo.monImages;
      const newCollection = getCollectionFromMon({
        mon: monEvolveTo,
        monImages,
        userId: collection.userId,
      });
      updatedColPoint += monEvolveTo.colPoint;
      const savedCollection = await trxCollectionRepository.save(newCollection);
      const foundCollection = await trxCollectionRepository.findOne(
        savedCollection.id,
      );
      await foundCollection.mon;
      await foundCollection.monImage;
      result.oldCollection = null;
      result.newCollection = foundCollection;
    }
    await trxUserRepository.update(user.id, {
      colPoint: user.colPoint + updatedColPoint,
    });

    return result;
  }
}
