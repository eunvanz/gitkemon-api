import { IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @IsString()
  githubUsername: string;

  @IsString()
  introduce: string;

  @IsString()
  email: string;

  @IsNumber()
  lastContributions: number;
}
