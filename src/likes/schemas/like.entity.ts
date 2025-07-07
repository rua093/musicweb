import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/schemas/user.entity';
import { Track } from '../../tracks/schemas/track.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @ManyToOne(() => Track, track => track.id)
  track: Track;

  @Column('int')
  quantity: number; // 1 (like), -1 (dislike)

  @CreateDateColumn()
  created_at: Date;
} 