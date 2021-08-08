import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { User } from 'src/users/user.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { Donation } from './donation.entity';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, User, PokeBall]),
    HttpModule,
    UsersModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService, UsersService],
})
export class DonationsModule {}
