import { IsNumber, IsString } from 'class-validator';
import { ContentType } from 'src/types';

export class CreateLikeDto {
  @IsString()
  contentType: ContentType;

  @IsNumber()
  contentId: number;
}
