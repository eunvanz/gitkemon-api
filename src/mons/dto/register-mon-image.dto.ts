import { IsOptional, IsString } from 'class-validator';
import { MonTier } from 'src/types';

export class RegisterMonImageDto {
  @IsString()
  monId: number;

  @IsString()
  designerId?: string;

  @IsString()
  designerName: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  tier?: MonTier;
}
