import { PartialType } from '@nestjs/mapped-types';
import { CreateMonImageDto } from './create-mon-image.dto';

export class UpdateMonImageDto extends PartialType(CreateMonImageDto) {}
