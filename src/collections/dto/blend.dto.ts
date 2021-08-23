import { IsArray } from 'class-validator';

export class BlendDto {
  @IsArray()
  collectionIds: number[];
}
