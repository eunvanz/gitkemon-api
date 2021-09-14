import {
  Body,
  Controller,
  Headers,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { CreateLikeDto } from './dto/create-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { LikesService } from './likes.service';

@UseInterceptors(SentryInterceptor)
@Controller('likes')
export class LikesController {
  constructor(private readonly likeService: LikesService) {}

  @Post('/unlike')
  async delete(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() deleteLikeDto: DeleteLikeDto,
  ) {
    await this.likeService.delete(accessToken, deleteLikeDto);
  }

  @Post()
  async save(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    await this.likeService.save(accessToken, createLikeDto);
  }
}
