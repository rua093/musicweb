import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/schemas/user.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  url: string;

  @Column({ length: 50 })
  type: string;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @CreateDateColumn()
  created_at: Date;
} 