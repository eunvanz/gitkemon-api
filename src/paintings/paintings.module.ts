import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from 'src/likes/like.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Painting } from './painting.entity';
import { PaintingsController } from './paintings.controller';
import { PaintingsService } from './paintings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Painting, User, Like, PokeBall]),
    HttpModule,
  ],
  controllers: [PaintingsController],
  providers: [PaintingsService, UsersService],
})
export class PaintingsModule {}
