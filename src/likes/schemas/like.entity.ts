import { Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';
import { User } from '../../users/schemas/user.entity';
import { Track } from '../../tracks/schemas/track.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Track, (track) => track.id)
  track: Track;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
} 