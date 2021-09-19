import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  body: string;

  @IsOptional()
  @IsBoolean()
  isVisible: boolean;
}
