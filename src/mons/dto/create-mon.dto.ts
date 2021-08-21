import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMonDto {
  @IsNumber()
  id: number;

  @IsNumber()
  order: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nameKo?: string;

  @IsOptional()
  @IsString()
  nameJa?: string;

  @IsOptional()
  @IsString()
  nameZh?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  descriptionKo?: string;

  @IsOptional()
  @IsString()
  descriptionJa?: string;

  @IsOptional()
  @IsString()
  descriptionZh?: string;

  @IsString()
  firstType: string;

  @IsOptional()
  @IsString()
  secondType?: string;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsString()
  tier: 'basic' | 'special' | 'rare' | 's.rare' | 'elite' | 'legend';

  @IsOptional()
  @IsNumber()
  evolutionLevel?: number;

  @IsNumber()
  hp: number;

  @IsNumber()
  attack: number;

  @IsNumber()
  defense: number;

  @IsNumber()
  specialAttack: number;

  @IsNumber()
  specialDefense: number;

  @IsNumber()
  speed: number;

  @IsOptional()
  @IsNumber()
  evolveFromId?: number;

  @IsOptional()
  @IsNumber()
  colPoint: number;

  @IsNumber()
  stars: number;
}
