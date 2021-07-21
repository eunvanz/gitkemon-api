import { Controller, Get, Param, Post } from '@nestjs/common';
import { MonsService } from './mons.service';

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

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.monService.findOne(id);
  }
}
