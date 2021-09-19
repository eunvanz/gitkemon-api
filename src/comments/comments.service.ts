import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from 'src/contents/content.entity';
import { User } from 'src/users/user.entity';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
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
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async findByContentId(contentId: number) {
    return await this.commentRepository.find({
      contentId,
      isVisible: true,
    });
  }

  @Transaction()
  async save(
    createCommentDto: CreateCommentDto,
    accessToken: string,
    @TransactionRepository(Comment) trxCommentRepository?: Repository<Comment>,
    @TransactionRepository(Content) trxContentRepository?: Repository<Content>,
  ) {
    const user = await this.userRepository.findOneOrFail({ accessToken });
    await trxCommentRepository.save({
      ...createCommentDto,
      userId: user.id,
    });
    await trxContentRepository
      .createQueryBuilder('content')
      .update()
      .set({ commentsCnt: () => 'content.comments_cnt + 1' })
      .where('content.id = :id', { id: createCommentDto.contentId })
      .execute();
  }

  @Transaction()
  async update(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    accessToken: string,
    @TransactionRepository(Comment) trxCommentRepository?: Repository<Comment>,
    @TransactionRepository(Content) trxContentRepository?: Repository<Content>,
  ) {
    const user = await this.userRepository.findOneOrFail({ accessToken });
    const comment = await this.commentRepository.findOne(commentId);
    if (comment.userId !== user.id) {
      throw new ForbiddenException();
    }
    await trxCommentRepository.update(commentId, updateCommentDto);
    if (updateCommentDto.isVisible === false) {
      await trxContentRepository
        .createQueryBuilder('content')
        .update()
        .set({ commentsCnt: () => 'content.comments_cnt - 1' })
        .where('content.id = :id', { id: comment.contentId })
        .execute();
    }
  }
}
