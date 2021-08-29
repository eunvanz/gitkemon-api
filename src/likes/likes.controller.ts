import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { CreateLikeDto } from './dto/create-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { LikesService } from './likes.service';

@Controller('likes')
export class LikesController {
  constructor(private readonly likeService: LikesService) {}

  @Post()
  async save(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    await this.likeService.save(accessToken, createLikeDto);
  }

  @Post('/unlike')
  async delete(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() deleteLikeDto: DeleteLikeDto,
  ) {
    await this.likeService.delete(accessToken, deleteLikeDto);
  }
}
