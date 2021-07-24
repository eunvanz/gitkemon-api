import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { uploadFile } from 'src/lib/file-uploader';
import { Mon } from 'src/mons/mon.entity';
import { Repository } from 'typeorm';
import { CreateMonImageDto } from './dto/create-mon-image.dto';
import { UpdateMonImageDto } from './dto/update-mon-image.dto';
import { MonImage } from './mon-image.entity';

@Injectable()
export class MonImagesService {
  constructor(
    @InjectRepository(MonImage)
    private readonly monImageRepository: Repository<MonImage>,
    @InjectRepository(Mon)
    private readonly monRepository: Repository<Mon>,
  ) {}

  async save(
    file: Express.Multer.File,
    { monId, designerId, designerName, imageUrl }: CreateMonImageDto,
  ) {
    let uploadedImageUrl: string;
    if (!imageUrl) {
      uploadedImageUrl = await this.uploadMonImage(file, monId, designerName);
    }

    const monToUpdatePromise = this.monRepository.findOne(monId);

    return await this.monImageRepository.save({
      mon: monToUpdatePromise,
      designerId,
      designerName,
      imageUrl: imageUrl || uploadedImageUrl,
    });
  }

  async update(
    id: number,
    file: Express.Multer.File,
    { monId, designerId, designerName, imageUrl }: UpdateMonImageDto,
  ) {
    let uploadedImageUrl: string;
    if (!imageUrl) {
      uploadedImageUrl = await this.uploadMonImage(file, monId, designerName);
    }

    const monPromise = this.monRepository.findOne(monId);

    const mon = await monPromise;

    if (!mon) {
      throw new NotFoundException('"monId" is not valid.');
    }

    const oldMonImage = await this.monImageRepository.findOne(id);

    if (!oldMonImage) {
      throw new NotFoundException();
    }

    return await this.monImageRepository.update(id, {
      mon: monPromise,
      designerId,
      designerName,
      imageUrl: imageUrl || uploadedImageUrl,
    });
  }

  async uploadMonImage(
    file: Express.Multer.File,
    monId: number,
    designerName: string,
  ) {
    return await uploadFile(file, {
      fileName: `mon_${monId}_${designerName}`,
      path: 'mon-images',
    });
  }

  async delete(id: number) {
    return await this.monImageRepository.delete(id);
  }
}
