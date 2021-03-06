import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorators';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { CreateMonDto } from './dto/create-mon.dto';
import { UpdateMonDto } from './dto/update-mon.dto';
import { MonsService } from './mons.service';

@UseInterceptors(SentryInterceptor)
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

  @Get('recent')
  async findRecentlyRegisteredMons() {
    return await this.monService.findRecentlyRegisteredMons();
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
  @Roles('admin')
  async update(@Param('id') id: number, @Body() updateMonDto: UpdateMonDto) {
    return await this.monService.update(id, updateMonDto);
  }

  @Post()
  @Roles('admin')
  async save(@Body() createMonDto: CreateMonDto) {
    return await this.monService.save(createMonDto);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: number) {
    return await this.monService.delete(id);
  }
}
