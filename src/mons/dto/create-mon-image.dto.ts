import { IsOptional, IsString } from 'class-validator';

export class CreateMonImageDto {
  @IsOptional()
  @IsString()
  designerId?: string;

  @IsString()
  designerName: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
