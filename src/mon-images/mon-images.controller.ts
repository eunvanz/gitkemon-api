import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMonImageDto } from './dto/create-mon-image.dto';
import { UpdateMonImageDto } from './dto/update-mon-image.dto';
import { MonImagesService } from './mon-images.service';

@Controller('mon-images')
export class MonImagesController {
  constructor(private readonly monImageService: MonImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async save(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMonImageDto: CreateMonImageDto,
  ) {
    return await this.monImageService.save(file, createMonImageDto);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMonImageDto: UpdateMonImageDto,
  ) {
    return await this.monImageService.update(id, file, updateMonImageDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.monImageService.delete(id);
  }
}