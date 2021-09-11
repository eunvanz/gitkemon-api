import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentType } from 'src/types';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
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
    return await this.contentRepository.save({ type, ...createContentDto });
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
    await this.contentRepository.delete(id);
  }
}
