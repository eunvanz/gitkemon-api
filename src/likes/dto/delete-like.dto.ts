import { IsNumber, IsString } from 'class-validator';
import { ContentType } from 'src/types';

export class DeleteLikeDto {
  @IsString()
  contentType: ContentType;

  @IsNumber()
  contentId: number;
}
