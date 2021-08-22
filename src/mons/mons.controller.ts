import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMonDto } from './dto/create-mon.dto';
import { UpdateMonDto } from './dto/update-mon.dto';
import { MonsService } from './mons.service';

@Controller('mons')
export class MonsController {
  constructor(private readonly monService: MonsService) {}

  // CAUTION: do not activate usually
  // @Post('initialize')
  // async initializeMons() {
  //   return await this.monService.initializeMons();
  // }

  @Get('inactive')
  async findInactiveMons() {
    return await this.monService.findInactiveMons();
  }

  @Get('active')
  async findActiveMons() {
    return await this.monService.findActiveMons();
  }

  @Get('with-images')
  async findAllWithImages() {
    return await this.monService.findAll({ isWithImages: true });
  }

  @Get()
  async findAll() {
    return await this.monService.findAll();
  }

  @Get(':id/next')
  async findNextMons(@Param('id') id: number) {
    return await this.monService.findNextMons(id);
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

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.monService.delete(id);
  }
}
