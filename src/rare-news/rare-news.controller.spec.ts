import { Test, TestingModule } from '@nestjs/testing';
import { RareNewsController } from './rare-news.controller';

describe('RareNewsController', () => {
  let controller: RareNewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RareNewsController],
    }).compile();

    controller = module.get<RareNewsController>(RareNewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
