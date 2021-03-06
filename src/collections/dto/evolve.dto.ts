import { IsNumber } from 'class-validator';

export class EvolveDto {
  @IsNumber()
  collectionId: number;

  @IsNumber()
  monId: number;
}
