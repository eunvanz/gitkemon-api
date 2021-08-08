import { TimeRecord } from 'src/entities/time-record.entity';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Donation extends TimeRecord {
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
  donationDateString: string; // yyyy-MM-dd
}
