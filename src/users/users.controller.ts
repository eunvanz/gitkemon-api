import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param, // Patch,
  Post,
  Query,
  Req,
  Res,
  Headers,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Request, Response } from 'express';
import { ACCESS_TOKEN_COOKIE_NAME } from 'src/constants/cookies';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
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

  @Get('available-contributions')
  async getAvailableContributions(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
  ) {
    return await this.userService.getAvailableContributions(accessToken);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return await this.userService.update(id, updateUserDto);
  // }

  @Post('login')
  async getAccessToken(
    @Body() { code }: { code: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.getAccessToken(code);
    const isProd = process.env.NODE_ENV === 'production';
    response.cookie(ACCESS_TOKEN_COOKIE_NAME, user.accessToken, {
      expires: dayjs().add(30, 'days').toDate(),
      httpOnly: true,
      secure: isProd,
      domain: isProd ? '.gitkemon.com' : 'localhost',
    });
    response.send(user);
  }

  @Post('refresh')
  async loginWithToken(@Req() req: Request, @Res() res: Response) {
    const accessToken =
      req.body.token || req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
    console.log('===== accessToken @refresh', accessToken);
    if (!accessToken) {
      return res.send(undefined);
    }
    try {
      const user = await this.userService.loginWithToken(accessToken);
      return res.send(user);
    } catch (error) {
      console.log('===== cleared cookie @refresh');
      res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
      return res.send(undefined);
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.send();
  }

  @Get('rank/collection')
  async getCollectionRanking(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return await this.userService.getCollectionRanking({ page, limit });
  }

  @Get('rank/contributions')
  async getContributionRanking(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return await this.userService.getContributionRanking({ page, limit });
  }

  @Get('profile/:userId')
  async getUserProfile(@Param('userId') userId: string) {
    return await this.userService.getUserProfile(userId);
  }

  @Patch('profile')
  async updateProfile(
    @Headers(ACCESS_TOKEN_HEADER_NAME) accessToken: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateProfile(accessToken, updateUserDto);
  }
}
