import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { lastValueFrom, map } from 'rxjs';
import Rules from 'src/config/rules.config';
import { ERROR_CODE } from 'src/constants/errors';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { GithubUser, User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PokeBall)
    private readonly pokeBallRepository: Repository<PokeBall>,
    private readonly httpService: HttpService,
  ) {}

  async update(id: string, updateUserDto: UpdateUserDto) {
    const oldUser = await this.userRepository.findOne(id);

    if (!oldUser) {
      throw new NotFoundException();
    }

    return await this.userRepository.update(id, {
      ...oldUser,
      ...updateUserDto,
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @Transaction()
  async getAccessToken(
    code: string,
    @TransactionRepository(User) trxUserRepository?: Repository<User>,
    @TransactionRepository(GithubUser)
    trxGithubUserRepository?: Repository<GithubUser>,
  ) {
    let accessToken: string;
    try {
      const tokenObserver$ = this.httpService
        .post(`${process.env.GITHUB_URL}/login/oauth/access_token`, null, {
          params: {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          },
          headers: {
            accept: 'application/json',
          },
        })
        .pipe(map((res) => res.data));

      accessToken = (await lastValueFrom(tokenObserver$)).access_token;
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERROR_CODE.FAILURE_TO_GET_GITHUB_ACCESS_TOKEN,
        errorMessage: 'Failed to get github access token.',
      });
    }

    const githubUser = await this.getGithubUserWithAccessToken(accessToken);

    let user: User = await this.userRepository.findOne({
      githubUser,
    });

    if (!user) {
      // generate user
      const contributionBaseDate = dayjs()
        .subtract(Rules.contributionBaseDays, 'day')
        .toDate();

      await trxGithubUserRepository.save(githubUser);

      trxUserRepository.save({
        nickname: githubUser.name.slice(0, 20),
        contributionBaseDate,
        lastRewardedDate: contributionBaseDate,
        lastContributions: 0,
        colPoint: 0,
        githubUser,
        accessToken,
        githubLogin: githubUser.login,
      });

      user = await this.userRepository.findOne({ githubUser });
    } else {
      // update user
      await trxGithubUserRepository.update(githubUser.id, githubUser);
      await trxUserRepository.update(user.id, {
        githubUser,
        accessToken,
      });
    }

    user.accessToken = accessToken;
    return user;
  }

  async loginWithToken(accessToken: string) {
    const githubUser = await this.getGithubUserWithAccessToken(accessToken);
    const user = await this.userRepository.findOne({ githubUser });

    const pokeBall = await user.pokeBall;

    if (!pokeBall) {
      const newPokeBall = new PokeBall();
      const { id } = await this.pokeBallRepository.save(newPokeBall);
      await this.userRepository.update(user.id, {
        pokeBallId: id,
      });
    }

    if (!user) {
      throw new InternalServerErrorException({
        errorCode: ERROR_CODE.INVALID_TOKEN,
        errorMessage: 'Token is invalid.',
      });
    }

    await this.userRepository.update(user.id, {
      githubUser,
      accessToken,
      githubLogin: githubUser.login,
    });

    await user.pokeBall;

    return {
      ...user,
      githubUser,
    };
  }

  async getGithubUserWithAccessToken(accessToken: string) {
    let githubUser: GithubUser;
    try {
      const userObserver$ = this.httpService.get<GithubUser>(
        `${process.env.GITHUB_API_BASE_URL}/user`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        },
      );

      githubUser = (await lastValueFrom(userObserver$)).data;
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: ERROR_CODE.FAILURE_TO_GET_GITHUB_USER,
        errorMessage: 'Failed to get github user from access token.',
      });
    }
    return githubUser;
  }

  /**
   * 현재 기부 가능한 컨트리뷰션을 리턴
   * @param accessToken user access token
   * @returns contributions
   */
  async getAvailableContributions(accessToken: string) {
    const user = await this.userRepository.findOne({ accessToken });
    const currentContributions = await this.getUserContributions(
      user.githubUser.login,
      user.contributionBaseDate,
    );
    return currentContributions - user.lastContributions;
  }

  /**
   * get githubUsername's contributions during fromDate to now
   * @param githubUsername github user name
   * @param fromDate from date
   * @returns contributions
   */
  async getUserContributions(githubUsername: string, fromDate: Date) {
    const now = new Date();

    const diff = dayjs().diff(fromDate, 'days');

    let iteration = 1;
    if (diff > 365) {
      iteration += Math.floor(diff / 365);
    }

    let result = 0;
    try {
      await Promise.all(
        Array.from({ length: iteration }).map(async (_, index) => {
          const isLastIteration = index === iteration - 1;

          const from = isLastIteration
            ? fromDate.toISOString()
            : dayjs(now)
                .subtract(365 * (index + 1), 'days')
                .toISOString();

          const to =
            index === 0
              ? now.toISOString()
              : dayjs(now)
                  .subtract(365 * index, 'days')
                  .toISOString();

          const observer$ = this.httpService
            .post(
              `${process.env.GITHUB_API_BASE_URL}/graphql`,
              {
                query: `
                query {
                  user(login: "${githubUsername}") {
                    name
                    contributionsCollection(from: "${from}", to: "${to}") {
                      contributionCalendar {
                        totalContributions
                      }
                    }
                  }
                }
                `,
              },
              {
                headers: {
                  Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
                },
              },
            )
            .pipe(map((res) => res.data.data));

          const { user } = await lastValueFrom(observer$);

          if (!user.name) {
            throw new Error();
          }

          result +=
            user.contributionsCollection.contributionCalendar
              .totalContributions;
        }),
      );
    } catch (error) {
      throw new NotFoundException('Github user is not found.');
    }

    return result;
  }

  async getCollectionRanking(options: IPaginationOptions) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.githubUser', 'githubUser')
      .orderBy('user.colPoint', 'DESC');
    const result = await paginate<User>(queryBuilder, options);
    return result;
  }

  async getContributionRanking(options: IPaginationOptions) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.githubUser', 'githubUser')
      .orderBy('user.lastContributions', 'DESC');
    const result = await paginate<User>(queryBuilder, options);
    return result;
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const collectionRank = await this.userRepository.query(`
      SELECT ranking
      FROM (
        SELECT id, RANK() OVER(ORDER BY col_point DESC) AS ranking
        FROM member
      ) AS user
      WHERE id = '${user.id}'
    `);

    const contributionsRank = await this.userRepository.query(`
      SELECT ranking
      FROM (
        SELECT id, RANK() OVER(ORDER BY last_contributions DESC) AS ranking
        FROM member
      ) AS user
      WHERE id = '${user.id}'
    `);

    return {
      id: user.id,
      nickname: user.nickname,
      introduce: user.introduce,
      githubLogin: user.githubLogin,
      colPoint: user.colPoint,
      lastContributions: user.lastContributions,
      lastPaybackDate: user.lastPaybackDate,
      avatarUrl: user.githubUser.avatar_url,
      githubUrl: user.githubUser.html_url,
      trainerClass: user.trainerClass,
      collectionRank: Number(collectionRank[0].ranking),
      contributionsRank: Number(contributionsRank[0].ranking),
    };
  }

  async updateProfile(accessToken: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ accessToken });
    await this.userRepository.update(user.id, updateUserDto);
  }
}
