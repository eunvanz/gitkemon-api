import { PartialType } from '@nestjs/mapped-types';
import { CreateMonDto } from './create-mon.dto';

export class UpdateMonDto extends PartialType(CreateMonDto) {}
