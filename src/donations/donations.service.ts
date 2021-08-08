import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { Donation } from './donation.entity';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
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
    @TransactionRepository(Donation)
    trxDonationRepository?: Repository<Donation>,
    @TransactionRepository(PokeBall)
    trxPokeBallRepository?: Repository<PokeBall>,
  ) {
    const user = await trxUserRepository.findOne({ accessToken });

    const contributions = await this.userService.getAvailableContributions(
      accessToken,
    );

    const totalContributions = user.lastContributions + contributions;

    const donationDate = new Date();

    await trxUserRepository.update(user.id, {
      lastContributions: totalContributions,
      lastDonationDate: donationDate,
    });

    const yesterdayDonation = (
      await trxDonationRepository.find({
        where: {
          userId: user.id,
          donationDateString: dayjs(donationDate)
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        },
        take: 1,
      })
    )[0];

    const todayDonations = await trxDonationRepository.find({
      where: {
        userId: user.id,
        donationDateString: dayjs(donationDate).format('YYYY-MM-DD'),
      },
    });

    let daysInARow = 1;
    if (yesterdayDonation) {
      daysInARow = yesterdayDonation.daysInARow + 1;
    }

    const pokeBall = await user.pokeBall;

    const result = {
      basicPokeBalls: contributions,
      basicRarePokeBalls: 0,
      rarePokeBalls: 0,
      elitePokeBalls: 0,
      legendPokeBalls: 0,
    };

    const basicPokeBalls = pokeBall.basicPokeBalls + contributions;
    let basicRarePokeBalls = pokeBall.basicRarePokeBalls;
    let rarePokeBalls = pokeBall.rarePokeBalls;
    let elitePokeBalls = pokeBall.elitePokeBalls;
    let legendPokeBalls = pokeBall.legendPokeBalls;
    // 연속기부 보상 처리
    if (!todayDonations.length) {
      // 첫번째 연속 기부인 경우
      switch (daysInARow) {
        case 3:
          rarePokeBalls++;
          result.rarePokeBalls++;
        case 10:
          elitePokeBalls++;
          result.elitePokeBalls++;
        case 30:
          legendPokeBalls++;
          result.legendPokeBalls++;
      }
    }

    // 기부횟수 보상 처리
    if (totalContributions % 3 === 0) {
      const amount = 1 + Math.floor((contributions - 0.1) / 3);
      basicRarePokeBalls += amount;
      result.basicPokeBalls += amount;
    }
    if (totalContributions % 10 === 0) {
      const amount = 1 + Math.floor((contributions - 0.1) / 10);
      rarePokeBalls += amount;
      result.rarePokeBalls += amount;
    }
    if (totalContributions % 200 === 0) {
      const amount = 1 + Math.floor((contributions - 0.1) / 200);
      elitePokeBalls += amount;
      result.elitePokeBalls += amount;
    }
    if (totalContributions % 500 === 0) {
      const amount = 1 + Math.floor((contributions - 0.1) / 500);
      legendPokeBalls += amount;
      result.legendPokeBalls += amount;
    }

    await trxPokeBallRepository.update(pokeBall.id, {
      basicPokeBalls,
      basicRarePokeBalls,
      rarePokeBalls,
      elitePokeBalls,
      legendPokeBalls,
    });

    return await trxDonationRepository.save({
      userId: user.id,
      contributions,
      totalContributions,
      daysInARow,
      donationDateString: dayjs(donationDate).format('YYYY-MM-DD'),
      ...result,
    });
  }
}
