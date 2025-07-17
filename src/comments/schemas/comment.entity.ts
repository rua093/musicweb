import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/schemas/user.entity';
import { Track } from '../../tracks/schemas/track.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: false })
  content: string;

  @Column({ type: 'int', default: 0 })
  moment: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Track, (track) => track.id)
  track: Track;

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;
} 