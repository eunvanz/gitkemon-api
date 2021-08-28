import { IsNumber, IsString } from 'class-validator';

export class CreatePaintingDto {
  @IsString()
  designerName: string;

  @IsNumber()
  monId: number;
}
