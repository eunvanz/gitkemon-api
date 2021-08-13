import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { random } from 'lodash';
import {
  getCollectionFromMon,
  getLevelUpCollection,
} from 'src/lib/project-utils';
import { Mon } from 'src/mons/mon.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { MonTier, PokeBallType } from 'src/types';
import { User } from 'src/users/user.entity';
import { Repository, TransactionRepository } from 'typeorm';
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
    const tierOption: { tier: MonTier }[] = [];
    switch (pokeBallType) {
      case 'basicRare':
        tierOption.push({
          tier: 'rare',
        });
      case 'basic':
        tierOption.push({
          tier: 'basic',
        });
        break;
      case 'rare':
        tierOption.push({
          tier: 'rare',
        });
        break;
      case 'elite':
        tierOption.push({
          tier: 'elite',
        });
        break;
      case 'legend':
        tierOption.push({
          tier: 'legend',
        });
        break;
    }
    const candidateMons = await this.monRepository.find({
      where: tierOption,
    });

    if (!candidateMons.length) {
      throw new InternalServerErrorException({
        errorMessage: 'No candidate Pokemons.',
      });
    }

    const adoptedMonIndex = random(0, candidateMons.length - 1);
    const adoptedMon = candidateMons[adoptedMonIndex];
    const monImages = await adoptedMon.monImages;

    // 콜렉션
    const existCollection = await trxCollectionRepository.findOne({
      where: [{ userId: user.id }, { monId: adoptedMon.id }],
    });

    if (existCollection) {
      // 콜렉션 레벨업
      const updatedCollection = getLevelUpCollection(existCollection);
      await trxCollectionRepository.update(
        updatedCollection.id,
        updatedCollection,
      );
      return updatedCollection;
    } else {
      // 콜렉션 생성
      const newCollection = getCollectionFromMon({
        mon: adoptedMon,
        monImages,
        userId: user.id,
      });
      const result = await trxCollectionRepository.save(newCollection);
      return result;
    }
  }
}
