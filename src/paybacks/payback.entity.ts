import { TimeRecord } from 'src/entities/time-record.entity';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Payback extends TimeRecord {
  @PrimaryColumn()
  @Generated()
  id: number;

  @Column()
  userId: string;

  @Column()
  contributions: number;

  @Column()
  totalContributions: number;

  @Column()
  daysInARow: number;

  @Column()
  basicPokeBalls: number;

  @Column()
  basicRarePokeBalls: number;

  @Column()
  rarePokeBalls: number;

  @Column()
  elitePokeBalls: number;

  @Column()
  legendPokeBalls: number;

  @Column()
  paybackDateString: string; // yyyy-MM-dd
}
