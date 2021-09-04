import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RareNewsController } from './rare-news.controller';
import { RareNews } from './rare-news.entity';
import { RareNewsService } from './rare-news.service';

@Module({
  imports: [TypeOrmModule.forFeature([RareNews])],
  controllers: [RareNewsController],
  providers: [RareNewsService],
})
export class RareNewsModule {}
