import { TimeRecord } from 'src/entities/time-record.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { Role } from 'src/types';
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

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  gravatar_id: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  html_url: string;

  @Column({ nullable: true })
  followers_url: string;

  @Column({ nullable: true })
  following_url: string;

  @Column({ nullable: true })
  gists_url: string;

  @Column({ nullable: true })
  starred_url: string;

  @Column({ nullable: true })
  subscriptions_url: string;

  @Column({ nullable: true })
  organizations_url: string;

  @Column({ nullable: true })
  repos_url: string;

  @Column({ nullable: true })
  events_url: string;

  @Column({ nullable: true })
  received_events_url: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  site_admin: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  blog: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  hireable: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  twitter_username: string;

  @Column({ nullable: true })
  public_repos: number;

  @Column({ nullable: true })
  public_gists: number;

  @Column({ nullable: true })
  followers: number;

  @Column({ nullable: true })
  following: number;

  @Column()
  created_at: string;

  @Column()
  updated_at: string;

  @Column({ nullable: true })
  suspended_at: string;

  @Column({ nullable: true })
  ldap_dn: string;
}

@Entity('member')
export class User extends TimeRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  nickname: string;

  @Column({ nullable: true, length: 80 })
  introduce: string;

  @Column()
  lastContributions: number;

  @Column({ nullable: true })
  lastPaybackDate: Date;

  @Column({ nullable: true })
  contributionBaseDate: Date;

  @Column({ select: false })
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

  @Column({ default: 0 })
  colPoint: number;

  @Column()
  githubLogin: string;

  @Column({ default: 1 })
  trainerClass: number;

  @Column({ default: 'user' })
  role: Role;

  @Column()
  referrerCode: string;
}
