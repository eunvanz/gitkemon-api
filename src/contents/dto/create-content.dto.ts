import { IsString } from 'class-validator';
import { ContentType } from 'src/types';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  type: ContentType;

  @IsString()
  body: string;
}
