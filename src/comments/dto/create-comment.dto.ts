import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ContentType } from 'src/types';

export class CreateCommentDto {
  @IsString()
  body: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsString()
  contentType: ContentType;

  @IsNumber()
  contentId: number;
}
