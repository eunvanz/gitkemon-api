import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from 'src/likes/like.entity';
import { User } from 'src/users/user.entity';
import { Painting } from './painting.entity';
import { PaintingsController } from './paintings.controller';
import { PaintingsService } from './paintings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Painting, User, Like])],
  controllers: [PaintingsController],
  providers: [PaintingsService],
})
export class PaintingsModule {}
