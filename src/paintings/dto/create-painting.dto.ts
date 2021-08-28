import { IsString } from 'class-validator';

export class CreatePaintingDto {
  @IsString()
  designerName: string;

  @IsString()
  monId: number;
}
