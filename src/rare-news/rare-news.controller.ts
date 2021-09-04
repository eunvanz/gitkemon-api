import { Controller, Get } from '@nestjs/common';
import { RareNewsService } from './rare-news.service';

@Controller('rare-news')
export class RareNewsController {
  constructor(private readonly rareNewsService: RareNewsService) {}

  @Get('recent')
  async findRecentRareNews() {
    return this.rareNewsService.findRecentRareNews();
  }
}
