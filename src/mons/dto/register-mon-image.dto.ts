import { IsOptional, IsString } from 'class-validator';
import { MonTier } from 'src/types';

export class RegisterMonImageDto {
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

  @IsOptional()
  @IsString()
  tier?: MonTier;
}
