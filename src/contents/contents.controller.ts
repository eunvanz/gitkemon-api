import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { uploadFile } from 'src/lib/file-uploader';
import { ContentType } from 'src/types';
import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentService: ContentsService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await uploadFile(file, { path: 'contents' });
  }

  @Post()
  async save(
    @Query('type') contentType: ContentType,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() createContentDto: CreateContentDto,
  ) {
    await this.contentService.save(accessToken, contentType, createContentDto);
  }

  @Put('view/:id')
  async incrementView(@Param('id') id: number) {
    await this.contentService.incrementView(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    await this.contentService.update(accessToken, id, updateContentDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
  ) {
    await this.contentService.delete(accessToken, id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken?: string,
  ) {
    return await this.contentService.findOne(id, accessToken);
  }

  @Get()
  async findByType(
    @Query('type') type: ContentType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken?: string,
  ) {
    return await this.contentService.findByType(
      type,
      { page, limit },
      accessToken,
    );
  }
}
