import { TimeRecord } from 'src/entities/time-record.entity';
import { Mon } from 'src/mons/mon.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Painting extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @Column()
  designerName: string;

  @Column({ nullable: true })
  designerId?: string;

  @Column()
  monId: number;

  @ManyToOne(() => Mon, { eager: true })
  @JoinColumn({ name: 'mon_id' })
  mon: Mon;

  @Column({ default: 0 })
  likesCnt: number;

  @Column({ default: false })
  isRegistered: boolean;

  @Column({ default: 0 })
  commentsCnt: number;
}
