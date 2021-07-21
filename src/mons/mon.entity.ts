import { TimeRecord } from 'src/entities/time-record.entity';
import { MonImage } from 'src/mon-images/mon-image.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Mon extends TimeRecord {
  @PrimaryColumn()
  id: number;

  @Column()
  seq: number;

  @Column()
  name: string;

  @Column()
  nameKr?: string;

  @Column()
  description: string;

  @Column()
  descriptionKr?: string;

  @Column()
  firstType: string;

  @Column()
  secondType: string;

  @Column()
  height: number;

  @Column()
  weight: number;

  @Column()
  tier: 'basic' | 'special' | 'rare' | 's.rare' | 'elite' | 'legend';

  @Column()
  evolutionLevel: number;

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
  previousMonId?: number;

  @OneToMany(() => Mon, (mon) => mon.previousMonId, { nullable: true })
  nextMon?: Promise<Mon[]>;

  @OneToMany(() => MonImage, (monImage) => monImage.monId)
  monImages: MonImage[];
}
