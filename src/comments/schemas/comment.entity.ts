import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/schemas/user.entity';
import { Track } from '../../tracks/schemas/track.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column('int')
  moment: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @ManyToOne(() => Track, track => track.id)
  track: Track;

  @CreateDateColumn()
  created_at: Date;
} 