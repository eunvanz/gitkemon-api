import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from 'src/collections/collection.entity';
import { MonImage } from 'src/mon-images/mon-image.entity';
import { Mon } from './mon.entity';
import { MonsController } from './mons.controller';
import { MonsService } from './mons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mon, MonImage, Collection]), HttpModule],
  controllers: [MonsController],
  providers: [MonsService],
})
export class MonsModule {}
