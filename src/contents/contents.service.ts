import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Like } from 'src/likes/like.entity';
import { ContentType } from 'src/types';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { Content } from './content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async save(
    accessToken: string,
    type: ContentType,
    createContentDto: CreateContentDto,
  ) {
    const user = await this.userRepository.findOne({ accessToken });
    if (!user) {
      throw new UnauthorizedException();
    }
    return await this.contentRepository.save({
      type,
      userId: user.id,
      ...createContentDto,
    });
  }

  async update(
    accessToken: string,
    id: number,
    updateContentDto: UpdateContentDto,
  ) {
    const user = await this.userRepository.findOne({ accessToken });
    if (!user) {
      throw new UnauthorizedException();
    }
    const content = await this.contentRepository.findOne(id);
    if (content.userId !== user.id) {
      throw new ForbiddenException();
    }
    await this.contentRepository.update(id, updateContentDto);
  }

  async delete(accessToken: string, id: number) {
    const user = await this.userRepository.findOne({ accessToken });
    if (!user) {
      throw new UnauthorizedException();
    }
    const content = await this.contentRepository.findOne(id);
    if (content.userId !== user.id) {
      throw new ForbiddenException();
    }
    await this.contentRepository.update(id, { isVisible: false });
  }

  async findByType(
    type: ContentType,
    options: IPaginationOptions,
    accessToken?: string,
  ) {
    const queryBuilder = this.contentRepository
      .createQueryBuilder('content')
      .where('content.type = :type', { type })
      .andWhere('content.isVisible = :isVisible', { isVisible: true })
      .select([
        'content.id',
        'content.title',
        'content.userId',
        'content.likesCnt',
        'content.commentsCnt',
        'content.viewsCnt',
        'content.createdAt',
        'content.updatedAt',
        'content.user',
        'content.type',
        'user.nickname',
        'user.githubLogin',
      ])
      .leftJoin('content.user', 'user')
      .orderBy('content.createdAt', 'DESC');
    const result = await paginate<Content>(queryBuilder, options);
    const itemIds = result.items.map((item) => item.id);
    let likes = [];
    if (accessToken) {
      const user = await this.userRepository.findOne({ accessToken });
      likes = await this.likeRepository.find({
        where: [
          {
            contentType: 'painting',
            contentId: In(itemIds),
            userId: user.id,
          },
        ],
      });
    }
    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        isLiked: likes.some((like) => like.contentId === item.id) || false,
      })),
    };
  }

  async findOne(id: number, accessToken?: string) {
    const content = await this.contentRepository.findOne(id);
    if (!content) {
      throw new NotFoundException();
    }
    let isLiked = false;
    if (accessToken) {
      const user = await this.userRepository.findOne({ accessToken });
      const likes = await this.likeRepository.find({
        where: [
          {
            contentType: content.type,
            contentId: content.id,
            userId: user.id,
          },
        ],
      });
      if (likes.length) {
        isLiked = true;
      }
    }
    await this.contentRepository.update(id, {
      viewsCnt: content.viewsCnt + 1,
    });
    return { ...content, isLiked, viewsCnt: content.viewsCnt + 1 };
  }
}
