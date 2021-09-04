import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RareNews } from './rare-news.entity';

@Injectable()
export class RareNewsService {
  constructor(
    @InjectRepository(RareNews)
    private readonly rareNewsRepository: Repository<RareNews>,
  ) {}

  async findRecentRareNews() {
    return await this.rareNewsRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }
}
