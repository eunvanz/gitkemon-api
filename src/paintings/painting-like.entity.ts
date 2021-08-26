import { TimeRecord } from 'src/entities/time-record.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Painting } from './painting.entity';

@Entity()
export class PaintingLike extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @ManyToOne(() => Painting, (painting) => painting.likes)
  painting: Promise<Painting>;
}
