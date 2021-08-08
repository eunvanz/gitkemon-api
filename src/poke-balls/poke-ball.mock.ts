import { PokeBall } from './poke-ball.entity';

const basePokeBall: PokeBall = {
  basicPokeBalls: 0,
  basicRarePokeBalls: 0,
  rarePokeBalls: 0,
  elitePokeBalls: 0,
  legendPokeBalls: 0,
  id: 1,
  userId: 'mockUserId',
  createdAt: new Date('2021-07-01'),
  updatedAt: new Date('2021-07-01'),
};

const mockPokeBall = {
  basePokeBall,
};

export default mockPokeBall;
