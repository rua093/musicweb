import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true, nullable: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ default: false })
  is_verify: boolean;

  @Column({ length: 255, nullable: true })
  refresh_token: string;

  @Column({ length: 100, nullable: true })
  code: string;

  @Column({ length: 20, nullable: true })
  role: string;

  @Column({ length: 20, nullable: true, default: 'SYSTEM' })
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
} 