import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('actions_history')
export class ActionsHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.actionsHistory, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  actionType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  targetType: string;

  @Column({ type: 'int', nullable: true })
  targetId: number;

  @Column({ type: 'jsonb', nullable: true })
  actionDetails: any;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
