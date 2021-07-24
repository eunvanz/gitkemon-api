import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mon } from 'src/mons/mon.entity';
import { MonImage } from './mon-image.entity';
import { MonImagesController } from './mon-images.controller';
import { MonImagesService } from './mon-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mon, MonImage])],
  controllers: [MonImagesController],
  providers: [MonImagesService],
})
export class MonImagesModule {}
