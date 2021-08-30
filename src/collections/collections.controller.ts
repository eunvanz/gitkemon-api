import {
  Body,
  Controller,
  Post,
  Headers,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { CollectionsService } from './collections.service';
import { BlendDto } from './dto/blend.dto';
import { EvolveDto } from './dto/evolve.dto';
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

  @Get('rank')
  async getRanking(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(1), ParseIntPipe) limit = 20,
  ) {
    return await this.collectionService.getRanking({ page, limit });
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    return await this.collectionService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.collectionService.findOne(id);
  }

  @Post('evolve')
  async evolve(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() evolveDto: EvolveDto,
  ) {
    return await this.collectionService.evolve(
      accessToken,
      evolveDto.collectionId,
      evolveDto.monId,
    );
  }

  @Post('blend')
  async blend(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() blendDto: BlendDto,
  ) {
    return await this.collectionService.blend(
      accessToken,
      blendDto.collectionIds,
    );
  }

  @Post('sync-name-with-mon')
  async syncNameWithMon() {
    return await this.collectionService.syncNameWithMon();
  }
}
