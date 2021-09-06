import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { RareNewsService } from './rare-news.service';

@UseInterceptors(SentryInterceptor)
@Controller('rare-news')
export class RareNewsController {
  constructor(private readonly rareNewsService: RareNewsService) {}

  @Get('recent')
  async findRecentRareNews() {
    return this.rareNewsService.findRecentRareNews();
  }
}
