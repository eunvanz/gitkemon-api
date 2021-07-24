import { IsOptional, IsString } from 'class-validator';

export class CreateMonImageDto {
  @IsString()
  monId: number;

  @IsOptional()
  @IsString()
  designerId?: string;

  @IsString()
  designerName: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
