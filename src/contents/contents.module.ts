import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Content } from './content.entity';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Content])],
  controllers: [ContentsController],
  providers: [ContentsService],
})
export class ContentsModule {}
