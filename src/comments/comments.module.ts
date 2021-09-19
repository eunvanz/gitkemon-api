import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from 'src/contents/content.entity';
import { User } from 'src/users/user.entity';
import { Comment } from './comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Content])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
