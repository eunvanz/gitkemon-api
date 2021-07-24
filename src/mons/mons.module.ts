import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonImage } from 'src/mons/mon-image.entity';
import { Mon } from './mon.entity';
import { MonsController } from './mons.controller';
import { MonsService } from './mons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mon, MonImage]), HttpModule],
  controllers: [MonsController],
  providers: [MonsService],
})
export class MonsModule {}
