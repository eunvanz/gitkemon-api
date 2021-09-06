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
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { Roles } from 'src/decorators/roles.decorators';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { CollectionsService } from './collections.service';
import { BlendDto } from './dto/blend.dto';
import { EvolveDto } from './dto/evolve.dto';
import { HuntDto } from './dto/hunt.dto';

@UseInterceptors(SentryInterceptor)
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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit,
  ) {
    return await this.collectionService.getRanking({
      page,
      limit,
    });
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

  @Post('sync-with-mon')
  @Roles('admin')
  async syncWithMon() {
    return await this.collectionService.syncWithMon();
  }

  @Get('profile/:userId')
  async getProfileMons(@Param('userId') userId: string) {
    return await this.collectionService.getProfileMons(userId);
  }

  @Delete(':collectionId')
  @Roles('admin')
  async deleteCollection(@Param('collectionId') collectionId: number) {
    return await this.collectionService.deleteCollection(collectionId);
  }
}
