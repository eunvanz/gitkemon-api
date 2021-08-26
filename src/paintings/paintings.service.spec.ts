import { Test, TestingModule } from '@nestjs/testing';
import { PaintingsService } from './paintings.service';

describe('PaintingsService', () => {
  let service: PaintingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaintingsService],
    }).compile();

    service = module.get<PaintingsService>(PaintingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
