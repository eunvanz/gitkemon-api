import { TimeRecord } from 'src/entities/time-record.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('member')
export class User extends TimeRecord {
  @PrimaryColumn()
  id: string;

  @Column({ length: 20 })
  nickname: string;

  @Column()
  githubUsername: string;

  @Column({ nullable: true, length: 200 })
  introduce: string;

  @Column()
  email: string;

  @Column()
  lastContributions: number;

  @Column()
  contributionBaseDate: Date;
}
