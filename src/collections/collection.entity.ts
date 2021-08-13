import { TimeRecord } from 'src/entities/time-record.entity';
import { MonImage } from 'src/mon-images/mon-image.entity';
import { Mon } from 'src/mons/mon.entity';
import { MonPotential } from 'src/types';
import { User } from 'src/users/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Collection extends TimeRecord {
  @PrimaryColumn()
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

  @ManyToOne(() => MonImage, { eager: true })
  @JoinColumn({ name: 'mon_image_id' })
  monImage: MonImage;

  @Column()
  monId: number;

  @ManyToOne(() => Mon, { eager: true })
  @JoinColumn({ name: 'mon_id' })
  mon: Mon;

  @Column()
  potential: MonPotential;

  @Column()
  level: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
