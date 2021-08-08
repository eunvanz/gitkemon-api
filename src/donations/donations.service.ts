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

    const contributions = await this.userService.getUserContributions(
      user.githubUser.login,
      user.lastDonationDate,
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
        case 10:
          elitePokeBalls++;
        case 30:
          legendPokeBalls++;
      }
    }

    // 기부횟수 보상 처리
    switch (0) {
      case totalContributions % 3:
        basicRarePokeBalls += 1 + Math.floor((contributions - 0.1) / 3);
      case totalContributions % 10:
        rarePokeBalls += 1 + Math.floor((contributions - 0.1) / 10);
      case totalContributions % 200:
        elitePokeBalls += 1 + Math.floor((contributions - 0.1) / 200);
      case totalContributions % 500:
        elitePokeBalls += 1 + Math.floor((contributions - 0.1) / 500);
    }

    await trxPokeBallRepository.update(pokeBall.id, {
      basicPokeBalls,
      basicRarePokeBalls,
      rarePokeBalls,
      elitePokeBalls,
      legendPokeBalls,
    });

    await trxDonationRepository.save({
      userId: user.id,
      contributions,
      totalContributions,
      daysInARow,
      donationDateString: dayjs(donationDate).format('YYYY-MM-DD'),
      basicPokeBalls,
      basicRarePokeBalls,
      rarePokeBalls,
      elitePokeBalls,
      legendPokeBalls,
    });
  }
}
