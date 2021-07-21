import { Module } from '@nestjs/common';
import { MonsController } from './mons.controller';
import { MonsService } from './mons.service';

@Module({
  controllers: [MonsController],
  providers: [MonsService],
})
export class MonsModule {}
