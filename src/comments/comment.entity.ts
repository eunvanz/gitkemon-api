import { TimeRecord } from 'src/entities/time-record.entity';
import { ContentType } from 'src/types';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Column()
  body: string;

  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Promise<Comment>;

  @OneToMany(() => Comment, (comment) => comment.parent, { nullable: true })
  replies?: Promise<Comment[]>;

  @Column()
  contentType: ContentType;

  @Column()
  contentId: number;
}
