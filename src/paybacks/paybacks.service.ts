import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { getMultiplesCountBetween } from 'src/lib/utils';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { Payback } from './payback.entity';

@Injectable()
export class PaybacksService {
  constructor(
    @InjectRepository(Payback)
    private readonly paybackRepository: Repository<Payback>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PokeBall)
    private readonly pokeBallRepository: Repository<PokeBall>,
    private readonly userService: UsersService,
  ) {}

  @Transaction()
  async save(
    accessToken: string,
    @TransactionRepository(User) trxUserRepository?: Repository<User>,
    @TransactionRepository(Payback)
    trxPaybackRepository?: Repository<Payback>,
    @TransactionRepository(PokeBall)
    trxPokeBallRepository?: Repository<PokeBall>,
  ) {
    const user = await trxUserRepository.findOne({ accessToken });

    const currentContributions = await this.userService.getUserContributions(
      user.githubUser.login,
      user.contributionBaseDate,
    );

    const contributions = currentContributions - user.lastContributions;

    if (!contributions) {
      throw new BadRequestException();
    }

    const totalContributions = user.lastContributions + contributions;

    const paybackDate = new Date();

    await trxUserRepository.update(user.id, {
      lastContributions: totalContributions,
      lastPaybackDate: paybackDate,
    });

    const yesterdayPayback = (
      await trxPaybackRepository.find({
        where: {
          userId: user.id,
          paybackDateString: dayjs(paybackDate)
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        },
        take: 1,
      })
    )[0];

    const todayPaybacks = await trxPaybackRepository.find({
      where: {
        userId: user.id,
        paybackDateString: dayjs(paybackDate).format('YYYY-MM-DD'),
      },
    });

    let daysInARow = 1;
    if (yesterdayPayback) {
      daysInARow = yesterdayPayback.daysInARow + 1;
    }

    const pokeBall = await user.pokeBall;

    const result = {
      basicPokeBalls: contributions,
      basicRarePokeBalls: 0,
      rarePokeBalls: 0,
      elitePokeBalls: 0,
      legendPokeBalls: 0,
      hasDaysInARowReward: false,
      hasContributionsCountReward: false,
    };

    const basicPokeBalls = pokeBall.basicPokeBalls + contributions;
    let basicRarePokeBalls = pokeBall.basicRarePokeBalls;
    let rarePokeBalls = pokeBall.rarePokeBalls;
    let elitePokeBalls = pokeBall.elitePokeBalls;
    let legendPokeBalls = pokeBall.legendPokeBalls;
    // 출석체크 보상 처리
    if (!todayPaybacks.length) {
      // 오늘 첫번째 출석 보상인 경우
      switch (daysInARow) {
        case 3:
          rarePokeBalls++;
          result.rarePokeBalls++;
          result.hasDaysInARowReward = true;
        case 15:
          elitePokeBalls++;
          result.elitePokeBalls++;
          result.hasDaysInARowReward = true;
        case 50:
          legendPokeBalls++;
          result.legendPokeBalls++;
          result.hasDaysInARowReward = true;
      }
    }

    // 컨트리뷰션횟수 보상 처리
    const basicRareAmount = getMultiplesCountBetween(
      3,
      user.lastContributions + 1,
      totalContributions,
    );
    basicRarePokeBalls += basicRareAmount;
    result.basicRarePokeBalls += basicRareAmount;

    const rareAmount = getMultiplesCountBetween(
      20,
      user.lastContributions + 1,
      totalContributions,
    );
    rarePokeBalls += rareAmount;
    result.rarePokeBalls += rareAmount;

    const eliteAmount = getMultiplesCountBetween(
      500,
      user.lastContributions + 1,
      totalContributions,
    );
    elitePokeBalls += eliteAmount;
    result.elitePokeBalls += eliteAmount;

    const legendAmount = getMultiplesCountBetween(
      1000,
      user.lastContributions + 1,
      totalContributions,
    );
    legendPokeBalls += legendAmount;
    result.legendPokeBalls += legendAmount;

    if (basicRareAmount + rareAmount + eliteAmount + legendAmount > 0) {
      result.hasContributionsCountReward = true;
    }

    await trxPokeBallRepository.update(pokeBall.id, {
      basicPokeBalls,
      basicRarePokeBalls,
      rarePokeBalls,
      elitePokeBalls,
      legendPokeBalls,
    });

    return await trxPaybackRepository.save({
      userId: user.id,
      contributions,
      totalContributions,
      daysInARow,
      paybackDateString: dayjs(paybackDate).format('YYYY-MM-DD'),
      ...result,
    });
  }

  async reset(userId: string) {
    const user = await this.userRepository.findOne(userId);
    await this.userRepository.update(user.id, {
      lastContributions: 0,
      lastPaybackDate: user.createdAt,
    });
    await this.pokeBallRepository.update(user.pokeBallId, {
      basicPokeBalls: 0,
      basicRarePokeBalls: 0,
      rarePokeBalls: 0,
      elitePokeBalls: 0,
      legendPokeBalls: 0,
    });
    await this.paybackRepository.delete({ userId: user.id });
  }
}
