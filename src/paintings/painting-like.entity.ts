import { Like } from 'src/entities/like.entity';
import { Entity, ManyToOne } from 'typeorm';
import { Painting } from './painting.entity';

@Entity()
export class PaintingLike extends Like {
  @ManyToOne(() => Painting, (painting) => painting.likes)
  painting: Promise<Painting>;
}
