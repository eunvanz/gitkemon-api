import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { uploadFile } from 'src/lib/file-uploader';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreatePaintingDto } from './dto/create-painting.dto';
import { Painting } from './painting.entity';

@Injectable()
export class PaintingsService {
  constructor(
    @InjectRepository(Painting)
    private readonly paintingRepository: Repository<Painting>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async save(
    file: Express.Multer.File,
    { designerName, monId }: CreatePaintingDto,
    accessToken?: string,
  ) {
    const painting = new Painting();
    if (accessToken) {
      const user = await this.userRepository.findOne({ accessToken });
      painting.designerId = user.id;
    }
    const uploadedImageUrl = await this.uploadImage(file, monId, designerName);
    painting.designerName = designerName;
    painting.monId = monId;
    painting.imageUrl = uploadedImageUrl;
    await this.paintingRepository.save(painting);
  }

  async uploadImage(
    file: Express.Multer.File,
    monId: number,
    designerName: string,
  ) {
    return await uploadFile(file, {
      fileName: `painting_${monId}_${designerName}`,
      path: 'painting-images',
    });
  }
}
