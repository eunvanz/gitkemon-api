import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { uploadFile } from 'src/lib/file-uploader';
import { Like } from 'src/likes/like.entity';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { CreatePaintingDto } from './dto/create-painting.dto';
import { UpdatePaintingDto } from './dto/update-painting.dto';
import { Painting } from './painting.entity';

@Injectable()
export class PaintingsService {
  constructor(
    @InjectRepository(Painting)
    private readonly paintingRepository: Repository<Painting>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
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

  async findAll(options: IPaginationOptions) {
    const queryBuilder = this.paintingRepository
      .createQueryBuilder('painting')
      .orderBy('painting.createdAt', 'DESC');
    const result = await paginate<Painting>(queryBuilder, options);
    const itemIds = result.items.map((item) => item.id);
    const likes = await this.likeRepository.find({
      where: [
        {
          contentType: 'painting',
          contentId: In(itemIds),
        },
      ],
    });
    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        isLiked: likes.some((like) => like.contentId === item.id) || false,
      })),
    };
  }

  async update(
    accessToken: string,
    paintingId: number,
    updatePaintingDto: UpdatePaintingDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOne({ accessToken });
    const painting = await this.paintingRepository.findOne(paintingId);
    if (user.id !== painting.designerId) {
      throw new ForbiddenException();
    }
    const updatedPainting: Partial<Painting> = {
      ...updatePaintingDto,
    };
    if (file) {
      updatedPainting.imageUrl = await this.uploadImage(
        file,
        updatePaintingDto.monId || painting.monId,
        updatePaintingDto.designerName || painting.designerName,
      );
    }
    await this.paintingRepository.update(paintingId, updatedPainting);
  }

  async delete(accessToken: string, paintingId: number) {
    const user = await this.userRepository.findOne({ accessToken });
    const painting = await this.paintingRepository.findOne(paintingId);
    if (user.id !== painting.designerId) {
      throw new ForbiddenException();
    }
    await this.paintingRepository.delete(paintingId);
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
