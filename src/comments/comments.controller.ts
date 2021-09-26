import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { ValidateTokenGuard } from 'src/guards/validate-token.guards';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Get('content/:contentId')
  async findByContentId(@Param('contentId') contentId: number) {
    return await this.commentService.findByContentId(contentId);
  }

  @Post()
  @UseGuards(ValidateTokenGuard)
  async save(
    @Body() createCommentDto: CreateCommentDto,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
  ) {
    await this.commentService.save(createCommentDto, accessToken);
  }

  @Patch(':contentId')
  @UseGuards(ValidateTokenGuard)
  async update(
    @Param('contentId') contentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
  ) {
    await this.commentService.update(contentId, updateCommentDto, accessToken);
  }

  @Delete(':contentId')
  @UseGuards(ValidateTokenGuard)
  async delete(
    @Param('contentId') contentId: number,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
  ) {
    const updateCommentDto = new UpdateCommentDto();
    updateCommentDto.isVisible = false;
    await this.commentService.update(contentId, updateCommentDto, accessToken);
  }
}
