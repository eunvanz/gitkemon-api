import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import {
  DAYS_IN_A_ROW_PAYBACK,
  EVERY_CONTRIBUTION_PAYBACK,
} from 'src/constants/rules';
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
      accessToken,
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
    // ???????????? ?????? ??????
    if (!todayPaybacks.length) {
      // ?????? ????????? ?????? ????????? ??????
      switch (daysInARow) {
        case DAYS_IN_A_ROW_PAYBACK.RARE:
          rarePokeBalls++;
          result.rarePokeBalls++;
          result.hasDaysInARowReward = true;
          break;
        case DAYS_IN_A_ROW_PAYBACK.ELITE:
          elitePokeBalls++;
          result.elitePokeBalls++;
          result.hasDaysInARowReward = true;
          break;
        case DAYS_IN_A_ROW_PAYBACK.LEGEND:
          legendPokeBalls++;
          result.legendPokeBalls++;
          result.hasDaysInARowReward = true;
          break;
      }
    }

    // ????????????????????? ?????? ??????
    const basicRareAmount = getMultiplesCountBetween(
      EVERY_CONTRIBUTION_PAYBACK.BASIC_RARE,
      user.lastContributions + 1,
      totalContributions,
    );
    basicRarePokeBalls += basicRareAmount;
    result.basicRarePokeBalls += basicRareAmount;

    const rareAmount = getMultiplesCountBetween(
      EVERY_CONTRIBUTION_PAYBACK.RARE,
      user.lastContributions + 1,
      totalContributions,
    );
    rarePokeBalls += rareAmount;
    result.rarePokeBalls += rareAmount;

    const eliteAmount = getMultiplesCountBetween(
      EVERY_CONTRIBUTION_PAYBACK.ELITE,
      user.lastContributions + 1,
      totalContributions,
    );
    elitePokeBalls += eliteAmount;
    result.elitePokeBalls += eliteAmount;

    const legendAmount = getMultiplesCountBetween(
      EVERY_CONTRIBUTION_PAYBACK.LEGEND,
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

  async getDailyHistory(userId: string) {
    const result = await this.paybackRepository.query(`
      SELECT payback_date_string as date, MAX(total_contributions) totalContributions
      FROM payback
      WHERE user_id = '${userId}'
      AND payback.created_at > '${dayjs().subtract(1, 'year').toISOString()}'
      GROUP BY payback_date_string
    `);
    return result;
  }

  async findLastPayback(accessToken: string) {
    const user = await this.userRepository.findOne({ accessToken });

    if (!user) {
      throw new NotFoundException();
    }

    return await this.paybackRepository.findOne({
      order: { createdAt: 'DESC' },
      where: { userId: user.id },
    });
  }
}
