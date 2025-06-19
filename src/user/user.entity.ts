import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './role.enum';
import { Company } from 'src/companies/company.entity';
import { ActionsHistory } from 'src/actions-history/actions-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ nullable: true })
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Company, (company) => company.owner)
  companies: Company[];

  @OneToMany(() => ActionsHistory, (history) => history.user)
  actionsHistory: ActionsHistory[];
}
