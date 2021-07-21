import { Test, TestingModule } from '@nestjs/testing';
import { MonsService } from './mons.service';

describe('MonsService', () => {
  let service: MonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonsService],
    }).compile();

    service = module.get<MonsService>(MonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
