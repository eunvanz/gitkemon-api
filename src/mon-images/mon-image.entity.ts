import { TimeRecord } from 'src/entities/time-record.entity';
import { Mon } from 'src/mons/mon.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MonImage extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  monId: number;

  @Column()
  designerId?: string;

  @Column()
  designerName: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Mon, (mon) => mon.monImages)
  mon: Promise<Mon>;
}
