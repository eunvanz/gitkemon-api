import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByContentId(contentId: number) {
    return await this.commentRepository.find({
      contentId,
      isVisible: true,
    });
  }

  async save(createCommentDto: CreateCommentDto, accessToken: string) {
    const user = await this.userRepository.findOneOrFail({ accessToken });
    await this.commentRepository.save({
      ...createCommentDto,
      userId: user.id,
    });
  }

  async update(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    accessToken: string,
  ) {
    const user = await this.userRepository.findOneOrFail({ accessToken });
    const comment = await this.commentRepository.findOne(commentId);
    if (comment.userId !== user.id) {
      throw new ForbiddenException();
    }
    await this.commentRepository.update(commentId, updateCommentDto);
  }
}
