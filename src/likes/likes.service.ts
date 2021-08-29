import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODE } from 'src/constants/errors';
import { Painting } from 'src/paintings/painting.entity';
import { User } from 'src/users/user.entity';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { CreateLikeDto } from './dto/create-like.dto';
import { Like } from './like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Painting)
    private readonly paintingRepository: Repository<Painting>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Transaction()
  async save(
    accessToken: string,
    createLikeDto: CreateLikeDto,
    @TransactionRepository(Like) trxLikeRepository?: Repository<Like>,
    @TransactionRepository(Painting)
    trxPaintingRepository?: Repository<Painting>,
  ) {
    const user = await this.userRepository.findOne({ accessToken });

    const { contentId, contentType } = createLikeDto;
    switch (contentType) {
      case 'painting':
        await trxPaintingRepository
          .createQueryBuilder('painting')
          .update()
          .set({ likesCnt: () => 'painting.likesCnt + 1' })
          .where('painting.id = :id', { id: contentId })
          .execute();
        break;
    }

    await trxLikeRepository.save({
      userId: user.id,
      ...createLikeDto,
    });
  }

  @Transaction()
  async delete(
    accessToken: string,
    likeId: number,
    @TransactionRepository(Like) trxLikeRepository?: Repository<Like>,
    @TransactionRepository(Painting)
    trxPaintingRepository?: Repository<Painting>,
  ) {
    const user = await this.userRepository.findOne({ accessToken });

    const like = await trxLikeRepository.findOne(likeId);

    if (like.userId !== user.id) {
      throw new ForbiddenException();
    }

    const { contentType, contentId } = like;
    switch (contentType) {
      case 'painting':
        await trxPaintingRepository
          .createQueryBuilder('painting')
          .update()
          .set({ likesCnt: () => 'painting.likesCnt - 1' })
          .where('painting.id = :id', { id: contentId })
          .execute();
        break;
    }

    await trxLikeRepository.delete(likeId);
  }
}
