import { TimeRecord } from 'src/entities/time-record.entity';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class PokeBall extends TimeRecord {
  @PrimaryColumn()
  @Generated()
  id: number;

  @Column()
  userId: string;

  @Column({ default: 0 })
  basicPokeBalls: number;

  @Column({ default: 0 })
  basicRarePokeBalls: number;

  @Column({ default: 0 })
  rarePokeBalls: number;

  @Column({ default: 0 })
  elitePokeBalls: number;

  @Column({ default: 0 })
  legendPokeBalls: number;
}
