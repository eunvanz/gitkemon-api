import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from 'src/collections/collection.entity';
import { uploadFile } from 'src/lib/file-uploader';
import { getCleanObject } from 'src/lib/utils';
import { Mon } from 'src/mons/mon.entity';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
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

    const mon = await this.monRepository.findOne(monId);

    if (!mon) {
      throw new BadRequestException('"monId" is not valid.');
    }

    const monImage = new MonImage();

    monImage.mon = Promise.resolve(mon);
    monImage.designerId = designerId;
    monImage.designerName = designerName;
    monImage.imageUrl = imageUrl || uploadedImageUrl;

    const existingMonImages = await mon.monImages;

    if (!existingMonImages.length) {
      await this.monRepository.update(mon.id, { registeredAt: new Date() });
    }

    return await this.monImageRepository.save(monImage);
  }

  async findAll() {
    const monImages = await this.monImageRepository.find();
    await Promise.all(monImages.map((monImage) => monImage.mon));
    return monImages;
  }

  async findOne(id: number) {
    const monImage = await this.monImageRepository.findOne(id);

    if (!monImage) {
      throw new NotFoundException();
    }

    await monImage.mon;
    return monImage;
  }

  async findByQuery(condition: 'monName' | 'designerName', value: string) {
    let monImages: MonImage[];
    if (condition === 'monName') {
      const mon = await this.monRepository.findOne({
        where: [
          {
            name: value,
          },
          {
            nameKo: value,
          },
          {
            nameJa: value,
          },
          {
            nameZh: value,
          },
        ],
      });
      monImages = await this.monImageRepository.find({
        where: {
          mon,
        },
      });
    } else {
      monImages = await this.monImageRepository.find({
        where: {
          designerName: value,
        },
      });
    }
    await Promise.all(monImages.map((monImage) => monImage.mon));

    return monImages;
  }

  @Transaction()
  async update(
    id: number,
    file: Express.Multer.File,
    updateMonImageDto: UpdateMonImageDto,
    @TransactionRepository(MonImage)
    trxMonImageRepository?: Repository<MonImage>,
    @TransactionRepository(Mon) trxMonRepository?: Repository<Mon>,
    @TransactionRepository(Collection)
    trxCollectionRepository?: Repository<Collection>,
  ) {
    const { monId, designerId, designerName, imageUrl } = updateMonImageDto;
    let uploadedImageUrl: string;
    if (!imageUrl && file) {
      uploadedImageUrl = await this.uploadMonImage(file, monId, designerName);
    }

    const mon = await trxMonRepository.findOne(monId);

    if (!mon) {
      throw new BadRequestException('"monId" is not valid.');
    }

    const oldMonImage = await trxMonImageRepository.findOne(id);

    if (!oldMonImage) {
      throw new NotFoundException();
    }

    await trxMonImageRepository.update(
      id,
      getCleanObject({
        mon,
        designerId,
        designerName,
        imageUrl: imageUrl || uploadedImageUrl,
      }),
    );

    await trxCollectionRepository.update(
      {
        monImageId: id,
      },
      getCleanObject({
        monImageUrl: imageUrl || uploadedImageUrl,
      }),
    );
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
