import { TimeRecord } from 'src/entities/time-record.entity';
import { MonImage } from 'src/mon-images/mon-image.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

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
  tier: 'basic' | 'special' | 'rare' | 's.rare' | 'elite' | 'legend';

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

  @Column({ nullable: true })
  evolveFromId?: number;

  @OneToMany(() => Mon, (mon) => mon.evolveFromId, { nullable: true })
  nextMon?: Promise<Mon[]>;

  @OneToMany(() => MonImage, (monImage) => monImage.mon)
  monImages?: Promise<MonImage[]>;
}
