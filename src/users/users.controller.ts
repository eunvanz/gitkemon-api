import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Response } from 'express';
import { ACCESS_TOKEN_COOKIE_NAME } from 'src/constants/cookies';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('contributions')
  async getUserContributions(
    @Query('github-username') githubUsername: string,
    @Query('from-date') fromDateString: string,
  ) {
    if (!githubUsername || !fromDateString) {
      throw new BadRequestException(
        '"github-username", "from-date" query is required.',
      );
    }
    let fromDate: Date;
    try {
      fromDate = new Date(fromDateString);
    } catch (error) {
      throw new BadRequestException('Date format is invalid.');
    }

    if (dayjs(fromDate).isAfter(new Date())) {
      throw new BadRequestException(
        'From date must be before or same to today.',
      );
    }

    return await this.userService.getUserContributions(
      githubUsername,
      fromDate,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  @Post('login')
  async getAccessToken(
    @Body() { code }: { code: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.getAccessToken(code);
    response.cookie(ACCESS_TOKEN_COOKIE_NAME, user.accessToken, {
      expires: dayjs().add(30, 'days').toDate(),
      httpOnly: true,
      signed: true,
    });
    response.send(user);
  }
}
