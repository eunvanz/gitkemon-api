import { User } from 'src/users/user.entity';
import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TimeRecord } from './time-record.entity';

export abstract class Comment extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  content: string;

  @Column({ nullable: true })
  parentId?: number;
}
