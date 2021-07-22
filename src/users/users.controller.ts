import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async save(@Body() createUserDto: CreateUserDto) {
    return await this.userService.save(createUserDto);
  }

  @Get('contributions')
  async getUserContributions(
    @Query('github-username') githubUsername: string,
    @Query('from-date') fromDateString: string,
  ) {
    let fromDate: Date;
    try {
      fromDate = new Date(fromDateString);
    } catch (error) {
      throw new BadRequestException('Date format is invalid.');
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
}
