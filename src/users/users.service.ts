import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './schemas/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || 'USER',
    });
    
    return this.usersRepository.save(user);
  }

  async findAllNoPaginate(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'username',
        'name',
        'email',
        'avatar',
        'role',
        'address',
        'age',
        'gender',
        'is_verify',
        'type',
        'created_at',
        'updated_at',
      ]
    });
  }

  async findAll(current: number, pageSize: number, q: string): Promise<{ meta: any; result: User[] }> {
    const skip = (current - 1) * pageSize;
    
    let whereCondition = {};
    if (q) {
      whereCondition = [
        { name: Like(`%${q}%`) },
        { email: Like(`%${q}%`) }
      ];
    }

    const [result, total] = await this.usersRepository.findAndCount({
      where: whereCondition,
      select: [
        'id',
        'username',
        'name',
        'email',
        'avatar',
        'role',
        'address',
        'age',
        'gender',
        'is_verify',
        'type',
        'created_at',
        'updated_at',
      ],
      skip,
      take: pageSize,
      order: { created_at: 'DESC' }
    });

    return {
      meta: {
        current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      },
      result
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: +id },
      select: ['id', 'name', 'email', 'avatar', 'role', 'address', 'age', 'gender', 'created_at', 'updated_at']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: +id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Remove _id from updateUserDto to avoid updating the ID
    const { _id, ...updateData } = updateUserDto;

    // Update user
    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async remove(id: string, currentUser: any): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: +id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is trying to delete themselves
    if (currentUser.userId === +id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    // Only admin can delete users
    if (currentUser.role !== 'ADMIN') {
      throw new BadRequestException('Only admin can delete users');
    }

    await this.usersRepository.remove(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email }
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id }
    });
  }
} 