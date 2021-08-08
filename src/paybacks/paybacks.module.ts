import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { User } from 'src/users/user.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { Payback } from './payback.entity';
import { PaybacksController } from './paybacks.controller';
import { PaybacksService } from './paybacks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payback, User, PokeBall]),
    HttpModule,
    UsersModule,
  ],
  controllers: [PaybacksController],
  providers: [PaybacksService, UsersService],
})
export class PaybacksModule {}
