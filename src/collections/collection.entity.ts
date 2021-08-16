import { TimeRecord } from 'src/entities/time-record.entity';
import { MonImage } from 'src/mon-images/mon-image.entity';
import { Mon } from 'src/mons/mon.entity';
import { MonPotential, MonTier } from 'src/types';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Collection extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  height: number;

  @Column()
  weight: number;

  @Column()
  hp: number;

  @Column()
  attack: number;

  @Column()
  defense: number;

  @Column()
  specialAttack: number;

  @Column()
  specialDefense: number;

  @Column()
  speed: number;

  @Column()
  total: number;

  @Column()
  baseHp: number;

  @Column()
  baseAttack: number;

  @Column()
  baseDefense: number;

  @Column()
  baseSpecialAttack: number;

  @Column()
  baseSpecialDefense: number;

  @Column()
  baseSpeed: number;

  @Column()
  baseTotal: number;

  @Column()
  monImageId: number;

  @Column()
  monImageUrl: string;

  @ManyToOne(() => MonImage, { lazy: true })
  @JoinColumn({ name: 'mon_image_id' })
  monImage: Promise<MonImage>;

  @Column()
  monId: number;

  @ManyToOne(() => Mon, { lazy: true })
  @JoinColumn({ name: 'mon_id' })
  mon: Promise<Mon>;

  @Column()
  potential: MonPotential;

  @Column()
  level: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Column()
  stars: number;

  @Column()
  tier: MonTier;

  @Column()
  firstType: string;

  @Column({ nullable: true })
  secondType?: string;

  @Column({ nullable: true })
  evolutionLevel?: number;
}
