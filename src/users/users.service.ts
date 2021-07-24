import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { lastValueFrom, map } from 'rxjs';
import Rules from 'src/config/rules.config';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService,
  ) {}

  async save(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new InternalServerErrorException('User is already exist.');
    }

    const contributionBaseDate = dayjs()
      .subtract(Rules.contributionBaseDays, 'day')
      .toDate();

    const lastContributions = await this.getUserContributions(
      createUserDto.githubUsername,
      contributionBaseDate,
    );

    return await this.userRepository.save({
      ...createUserDto,
      lastContributions,
      contributionBaseDate,
    });
  }

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

  async getAccessToken(code: string) {
    const observer$ = this.httpService
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

    const data = await lastValueFrom(observer$);
    return data;
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
}
