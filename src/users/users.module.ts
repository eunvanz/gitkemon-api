import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { GithubUser, User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, GithubUser, PokeBall]), HttpModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
