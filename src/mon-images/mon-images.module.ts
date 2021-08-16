import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from 'src/collections/collection.entity';
import { Mon } from 'src/mons/mon.entity';
import { MonImage } from './mon-image.entity';
import { MonImagesController } from './mon-images.controller';
import { MonImagesService } from './mon-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mon, MonImage, Collection])],
  controllers: [MonImagesController],
  providers: [MonImagesService],
})
export class MonImagesModule {}
