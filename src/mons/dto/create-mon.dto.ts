import { OmitType } from '@nestjs/mapped-types';
import { Mon } from '../mon.entity';

export class CreateMonDto extends OmitType(Mon, ['id']) {}
