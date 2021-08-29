import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Painting } from 'src/paintings/painting.entity';
import { User } from 'src/users/user.entity';
import { Like } from './like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Painting, User])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}