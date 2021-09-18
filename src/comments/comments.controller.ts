import { Controller, Get, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Get('content/:contentId')
  async findByContentId(@Param('contentId') contentId: number) {
    return await this.commentService.findByContentId(contentId);
  }
}
