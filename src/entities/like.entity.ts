import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimeRecord } from './time-record.entity';

@Entity()
export abstract class Like extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;
}
