import { Test, TestingModule } from '@nestjs/testing';
import { PaintingsController } from './paintings.controller';

describe('PaintingsController', () => {
  let controller: PaintingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaintingsController],
    }).compile();

    controller = module.get<PaintingsController>(PaintingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
