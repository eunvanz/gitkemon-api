import { IsString } from 'class-validator';
import { ContentType } from 'src/types';

export class CreateContentDto {
  @IsString()
  type: ContentType;

  @IsString()
  body: string;
}
