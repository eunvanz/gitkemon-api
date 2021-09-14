import { Collection } from 'src/collections/collection.entity';
import { TimeRecord } from 'src/entities/time-record.entity';
import { HuntMethod } from 'src/types';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RareNews extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  collectionId: number;

  @ManyToOne(() => Collection, { eager: true })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @Column()
  method: HuntMethod;
}
