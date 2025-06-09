import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.companies, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  service: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  capital: number;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  @Column({
    type: 'point',
    nullable: true,
  })
  location: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
