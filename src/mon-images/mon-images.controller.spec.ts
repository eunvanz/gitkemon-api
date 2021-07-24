import { Test, TestingModule } from '@nestjs/testing';
import { MonImagesController } from './mon-images.controller';

describe('MonImagesController', () => {
  let controller: MonImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonImagesController],
    }).compile();

    controller = module.get<MonImagesController>(MonImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
