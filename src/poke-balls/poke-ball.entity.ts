import { TimeRecord } from 'src/entities/time-record.entity';
import { PokeBallType } from 'src/types';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class PokeBall extends TimeRecord {
  @PrimaryColumn()
  @Generated()
  id: number;

  @Column()
  userId: string;

  @Column()
  type: PokeBallType;

  @Column()
  count: number;
}
