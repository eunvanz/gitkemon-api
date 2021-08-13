import { IsNumber, IsString } from 'class-validator';
import { PokeBallType } from 'src/types';

export class HuntDto {
  @IsString()
  pokeBallType: PokeBallType;

  @IsNumber()
  amount: number;
}
