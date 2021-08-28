import { TimeRecord } from 'src/entities/time-record.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Like extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  contentType: string;

  @Column()
  contentId: string;
}
