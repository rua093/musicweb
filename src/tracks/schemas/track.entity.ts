import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/schemas/user.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  img_url: string;

  @Column({ length: 255 })
  track_url: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ type: 'int', default: 0 })
  count_play: number;

  @Column({ type: 'int', default: 0 })
  count_like: number;

  @ManyToOne(() => User, user => user.id)
  uploader: User;

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;
} 