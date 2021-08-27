import { TimeRecord } from 'src/entities/time-record.entity';
import { Mon } from 'src/mons/mon.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaintingComment } from './painting-comment.entity';
import { PaintingLike } from './painting-like.entity';

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

  @ManyToOne(() => Mon, { lazy: true })
  @JoinColumn({ name: 'mon_id' })
  mon: Promise<Mon>;

  @Column()
  likesCnt: number;

  @OneToMany(() => PaintingLike, (paintingLike) => paintingLike.painting)
  likes: Promise<Painting[]>;

  @Column()
  isRegistered: boolean;

  @Column()
  commentsCnt: number;

  @OneToMany(
    () => PaintingComment,
    (paintingComment) => paintingComment.painting,
  )
  comments: Promise<PaintingComment[]>;
}
