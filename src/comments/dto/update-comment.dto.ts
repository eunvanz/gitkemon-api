import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  body: string;

  @IsOptional()
  @IsBoolean()
  isVisible: boolean;
}
