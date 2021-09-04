import { TimeRecord } from 'src/entities/time-record.entity';
import { MonImage } from 'src/mon-images/mon-image.entity';
import { MonTier } from 'src/types';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Mon extends TimeRecord {
  @PrimaryColumn()
  id: number;

  @Column()
  order: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  nameKo?: string;

  @Column({ nullable: true })
  nameJa?: string;

  @Column({ nullable: true })
  nameZh?: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  descriptionKo?: string;

  @Column({ nullable: true })
  descriptionJa?: string;

  @Column({ nullable: true })
  descriptionZh?: string;

  @Column()
  firstType: string;

  @Column({ nullable: true })
  secondType?: string;

  @Column()
  height: number;

  @Column()
  weight: number;

  @Column()
  tier: MonTier;

  @Column({ nullable: true })
  evolutionLevel?: number;

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

  @Column({ nullable: true })
  colPoint: number;

  @Column()
  stars: number;

  @Column({ nullable: true })
  evolveFromId?: number;

  @ManyToOne(() => Mon, (mon) => mon.nextMons, { nullable: true })
  @JoinColumn({ name: 'evolve_from_id' })
  prevMon?: Promise<Mon>;

  @OneToMany(() => Mon, (mon) => mon.prevMon, { nullable: true })
  nextMons?: Promise<Mon[]>;

  @OneToMany(() => MonImage, (monImage) => monImage.mon)
  monImages?: Promise<MonImage[]>;

  @Column({ type: 'timestamp', nullable: true })
  registeredAt: Date;
}
