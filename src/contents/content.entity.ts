import { TimeRecord } from 'src/entities/time-record.entity';
import { ContentType } from 'src/types';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Content extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: ContentType;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'longtext' })
  body: string;

  @Column({ default: 0 })
  commentsCnt: number;

  @Column({ default: 0 })
  likesCnt: number;
}
