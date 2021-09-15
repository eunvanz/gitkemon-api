import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/roles.decorators';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { CreateMonImageDto } from './dto/create-mon-image.dto';
import { UpdateMonImageDto } from './dto/update-mon-image.dto';
import { MonImagesService } from './mon-images.service';

@UseInterceptors(SentryInterceptor)
@Controller('mon-images')
export class MonImagesController {
  constructor(private readonly monImageService: MonImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Roles('admin')
  async save(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMonImageDto: CreateMonImageDto,
  ) {
    return await this.monImageService.save(file, createMonImageDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.monImageService.findOne(id);
  }

  @Get()
  @Roles('admin')
  async findAll(
    @Query('condition') condition: 'monName' | 'designerName',
    @Query('value') value: string,
  ) {
    if (condition && value) {
      return await this.monImageService.findByQuery(condition, value);
    }
    return await this.monImageService.findAll();
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('admin')
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMonImageDto: UpdateMonImageDto,
  ) {
    return await this.monImageService.update(id, file, updateMonImageDto);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: number) {
    return await this.monImageService.delete(id);
  }
}
