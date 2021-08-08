import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import mockPokeBall from 'src/poke-balls/poke-ball.mock';
import { User } from 'src/users/user.entity';
import mockUser from 'src/users/users.mock';
import { UsersService } from 'src/users/users.service';
import { Payback } from './payback.entity';
import { PaybacksService } from './paybacks.service';

describe('PaybacksService', () => {
  let service: PaybacksService;
  let userService: UsersService;
  // let userRepository: Repository<User>;
  // let paybackRepository: Repository<Payback>;
  // let pokeBallRepository: Repository<PokeBall>;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockPaybackRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockPokeBallRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Payback, User, PokeBall])],
      providers: [
        PaybacksService,
        UsersService,
        {
          provide: getRepositoryToken(Payback),
          useValue: mockPaybackRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(PokeBall),
          useValue: mockPokeBallRepository,
        },
      ],
    }).compile();

    service = module.get<PaybacksService>(PaybacksService);
    userService = module.get<UsersService>(UsersService);
    // userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    // paybackRepository = module.get<Repository<Payback>>(
    //   getRepositoryToken(Payback),
    // );
    // pokeBallRepository = module.get<Repository<PokeBall>>(
    //   getRepositoryToken(PokeBall),
    // );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save', () => {
    const accessToken = 'mockAccessToken';

    describe('일반적인 경우', () => {
      it('basic 포키볼을 contribution 수 만큼 보상한다.', async () => {
        const yesterdayPayback = [
          {
            daysInARow: 1,
          },
        ];

        const todayPaybacks = { length: 1 };

        jest.spyOn(userService, 'getUserContributions').mockResolvedValue(2);

        jest
          .spyOn(mockUserRepository, 'findOne')
          .mockResolvedValueOnce(mockUser.baseUser);

        jest
          .spyOn(mockPaybackRepository, 'find')
          .mockResolvedValueOnce(yesterdayPayback as Payback[])
          .mockResolvedValueOnce(todayPaybacks as Payback[]);

        jest.spyOn(mockPokeBallRepository, 'update');

        const mockPokeBallRepositoryUpdate = jest.spyOn(
          mockPokeBallRepository,
          'update',
        );
        const mockPaybackRepositorySave = jest.spyOn(
          mockPaybackRepository,
          'save',
        );

        await service.save(
          accessToken,
          // mockUserRepository,
          // mockPaybackRepository,
          // mockPokeBallRepository,
        );

        expect(mockPokeBallRepositoryUpdate).toBeCalledWith(
          mockPokeBall.basePokeBall.id,
          {
            basicPokeBalls: 2,
            basicRarePokeBalls: 0,
            rarePokeBalls: 0,
            elitePokeBalls: 0,
            legendPokeBalls: 0,
          },
        );

        expect(mockPaybackRepositorySave).toBeCalledWith({
          userId: 'mockId',
          contributions: 2,
          totalContributions: 2,
          daysInARow: 2,
          paybackDateString: dayjs(new Date()).format('YYYY-MM-DD'),
          basicPokeBalls: 2,
          basicRarePokeBalls: 0,
          rarePokeBalls: 0,
          elitePokeBalls: 0,
          legendPokeBalls: 0,
        });
      });
    });
  });
});
