import { Comment } from 'src/entities/comment.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Painting } from './painting.entity';

@Entity()
export class PaintingComment extends Comment {
  @ManyToOne(() => Painting, (painting) => painting.comments)
  painting: Promise<Painting>;

  @OneToMany(() => PaintingComment, (comment) => comment.parent)
  replies?: Promise<PaintingComment[]>;

  @ManyToOne(() => PaintingComment, (comment) => comment.replies)
  @JoinColumn({ name: 'parent_id' })
  parent?: Promise<PaintingComment>;
}
