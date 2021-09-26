import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from 'src/likes/like.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Content } from './content.entity';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Content, Like, PokeBall]),
    HttpModule,
  ],
  controllers: [ContentsController],
  providers: [ContentsService, UsersService],
})
export class ContentsModule {}
