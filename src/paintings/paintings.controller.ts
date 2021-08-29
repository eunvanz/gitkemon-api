import {
  Body,
  Controller,
  Post,
  Headers,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { CreatePaintingDto } from './dto/create-painting.dto';
import { UpdatePaintingDto } from './dto/update-painting.dto';
import { PaintingsService } from './paintings.service';

@Controller('paintings')
export class PaintingsController {
  constructor(private readonly paintingService: PaintingsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async save(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPaintingDto: CreatePaintingDto,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
  ) {
    return await this.paintingService.save(
      file,
      createPaintingDto,
      accessToken,
    );
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(32), ParseIntPipe) limit = 32,
  ) {
    return await this.paintingService.findAll({
      page,
      limit,
    });
  }

  @Patch('/:paintingId')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('paintingId') paintingId: number,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() updatePaintingDto: UpdatePaintingDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.paintingService.update(
      accessToken,
      paintingId,
      updatePaintingDto,
      file,
    );
  }

  @Delete('/:paintingId')
  async delete(
    @Param('paintingId') paintingId: number,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
  ) {
    return await this.paintingService.delete(accessToken, paintingId);
  }
}
