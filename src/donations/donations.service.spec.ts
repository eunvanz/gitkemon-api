import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import mockPokeBall from 'src/poke-balls/poke-ball.mock';
import { User } from 'src/users/user.entity';
import mockUser from 'src/users/users.mock';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Donation } from './donation.entity';
import { DonationsService } from './donations.service';

describe('DonationsService', () => {
  let service: DonationsService;
  let userService: UsersService;
  // let userRepository: Repository<User>;
  // let donationRepository: Repository<Donation>;
  // let pokeBallRepository: Repository<PokeBall>;

  const mockUserRepository = new Repository<User>();

  const mockDonationRepository = new Repository<Donation>();

  const mockPokeBallRepository = new Repository<PokeBall>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Donation, User, PokeBall])],
      providers: [
        DonationsService,
        UsersService,
        {
          provide: getRepositoryToken(Donation),
          useValue: mockDonationRepository,
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

    service = module.get<DonationsService>(DonationsService);
    userService = module.get<UsersService>(UsersService);
    // userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    // donationRepository = module.get<Repository<Donation>>(
    //   getRepositoryToken(Donation),
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
        const yesterdayDonation = [
          {
            daysInARow: 1,
          },
        ];

        const todayDonations = { length: 1 };

        jest.spyOn(userService, 'getUserContributions').mockResolvedValue(2);

        jest
          .spyOn(mockUserRepository, 'findOne')
          .mockResolvedValueOnce(mockUser.baseUser);

        jest
          .spyOn(mockDonationRepository, 'find')
          .mockResolvedValueOnce(yesterdayDonation as Donation[])
          .mockResolvedValueOnce(todayDonations as Donation[]);

        jest.spyOn(mockPokeBallRepository, 'update');

        const mockPokeBallRepositoryUpdate = jest.spyOn(
          mockPokeBallRepository,
          'update',
        );
        const mockDonationRepositorySave = jest.spyOn(
          mockDonationRepository,
          'save',
        );

        await service.save(
          accessToken,
          mockUserRepository,
          mockDonationRepository,
          mockPokeBallRepository,
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

        expect(mockDonationRepositorySave).toBeCalledWith({
          userId: 'mockId',
          contributions: 2,
          totalContributions: 2,
          daysInARow: 2,
          donationDateString: dayjs(new Date()).format('YYYY-MM-DD'),
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
