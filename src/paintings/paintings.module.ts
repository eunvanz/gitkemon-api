import { Module } from '@nestjs/common';
import { PaintingsController } from './paintings.controller';
import { PaintingsService } from './paintings.service';

@Module({
  controllers: [PaintingsController],
  providers: [PaintingsService],
})
export class PaintingsModule {}
