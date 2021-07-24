import { Test, TestingModule } from '@nestjs/testing';
import { MonImagesService } from './mon-images.service';

describe('MonImagesService', () => {
  let service: MonImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonImagesService],
    }).compile();

    service = module.get<MonImagesService>(MonImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
