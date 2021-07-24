import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMonDto } from './dto/create-mon.dto';
import { CreateMonImageDto } from './dto/create-mon-image.dto';
import { UpdateMonDto } from './dto/update-mon.dto';
import { MonsService } from './mons.service';
import { UpdateMonImageDto } from './dto/update-mon-image.dto';

@Controller('mons')
export class MonsController {
  constructor(private readonly monService: MonsService) {}

  // CAUTION: do not activate usually
  @Post('initialize')
  async initializeMons() {
    return await this.monService.initializeMons();
  }

  @Get('inactive')
  async findInactiveMons() {
    return await this.monService.findInactiveMons();
  }

  @Get('active')
  async findActiveMons() {
    return await this.monService.findActiveMons();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.monService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateMonDto: UpdateMonDto) {
    return await this.monService.update(id, updateMonDto);
  }

  @Post()
  async save(@Body() createMonDto: CreateMonDto) {
    return await this.monService.save(createMonDto);
  }

  @Post(':monId/images')
  @UseInterceptors(FileInterceptor('file'))
  async saveMonImage(
    @Param('monId') monId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() createMonImageDto: CreateMonImageDto,
  ) {
    return await this.monService.saveMonImage(monId, file, createMonImageDto);
  }

  @Patch(':monId/images/:monImageId')
  @UseInterceptors(FileInterceptor('file'))
  async updateMonImage(
    @Param('monId') monId: number,
    @Param('monImageId') monImageId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMonImageDto: UpdateMonImageDto,
  ) {
    return await this.monService.updateMonImage(
      monId,
      monImageId,
      file,
      updateMonImageDto,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.monService.delete(id);
  }
}
