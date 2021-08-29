import { Body, Controller, Delete, Headers, Param, Post } from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { CreateLikeDto } from './dto/create-like.dto';
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

  @Delete('/:likeId')
  async delete(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Param('likeId') likeId: number,
  ) {
    await this.likeService.delete(accessToken, likeId);
  }
}
