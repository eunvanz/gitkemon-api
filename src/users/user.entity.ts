import { TimeRecord } from 'src/entities/time-record.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class GithubUser {
  @PrimaryColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  node_id: string;

  @Column()
  avatar_url: string;

  @Column()
  gravatar_id: string;

  @Column()
  url: string;

  @Column()
  html_url: string;

  @Column()
  followers_url: string;

  @Column()
  following_url: string;

  @Column()
  gists_url: string;

  @Column()
  starred_url: string;

  @Column()
  subscriptions_url: string;

  @Column()
  organizations_url: string;

  @Column()
  repos_url: string;

  @Column()
  events_url: string;

  @Column()
  received_events_url: string;

  @Column()
  type: string;

  @Column()
  site_admin: boolean;

  @Column()
  name: string;

  @Column()
  company: string;

  @Column()
  blog: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  hireable: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  twitter_username: string;

  @Column()
  public_repos: number;

  @Column()
  public_gists: number;

  @Column()
  followers: number;

  @Column()
  following: number;

  @Column()
  created_at: string;

  @Column()
  updated_at: string;
}

@Entity('member')
export class User extends TimeRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  nickname: string;

  @Column({ nullable: true, length: 200 })
  introduce: string;

  @Column()
  lastContributions: number;

  @Column()
  lastDonationDate: Date;

  @Column({ nullable: true })
  contributionBaseDate: Date;

  @Column()
  accessToken: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => GithubUser, { eager: true })
  @JoinColumn()
  githubUser: GithubUser;

  @OneToOne(() => PokeBall, { lazy: true })
  @JoinColumn({ name: 'poke_ball_id' })
  pokeBall: Promise<PokeBall>;

  @Column({ nullable: true })
  pokeBallId: number;
}
