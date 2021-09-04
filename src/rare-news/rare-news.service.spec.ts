import { Test, TestingModule } from '@nestjs/testing';
import { RareNewsService } from './rare-news.service';

describe('RareNewsService', () => {
  let service: RareNewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RareNewsService],
    }).compile();

    service = module.get<RareNewsService>(RareNewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
