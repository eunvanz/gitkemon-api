import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from 'src/contents/content.entity';
import { Painting } from 'src/paintings/painting.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Like } from './like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, Painting, User, Content, PokeBall]),
    HttpModule,
  ],
  controllers: [LikesController],
  providers: [LikesService, UsersService],
})
export class LikesModule {}
