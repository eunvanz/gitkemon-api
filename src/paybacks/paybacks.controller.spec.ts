import { Test, TestingModule } from '@nestjs/testing';
import { PaybacksController } from './paybacks.controller';

describe('PaybacksController', () => {
  let controller: PaybacksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaybacksController],
    }).compile();

    controller = module.get<PaybacksController>(PaybacksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
