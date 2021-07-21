import { Test, TestingModule } from '@nestjs/testing';
import { MonsController } from './mons.controller';

describe('MonsController', () => {
  let controller: MonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonsController],
    }).compile();

    controller = module.get<MonsController>(MonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
