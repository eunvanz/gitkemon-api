import { Body, Controller, Post, Headers } from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { CollectionsService } from './collections.service';
import { HuntDto } from './dto/hunt.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionService: CollectionsService) {}

  @Post('hunt')
  async hunt(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() huntDto: HuntDto,
  ) {
    return await this.collectionService.hunt(
      accessToken,
      huntDto.pokeBallType,
      huntDto.amount,
    );
  }
}
