import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/schemas/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      sub: user.id?.toString() ?? '', // Sửa lại sub là userId
      iss: 'from server',
      _id: user.id?.toString() ?? '',
      email: user.email,
      address: user.address ?? '',
      isVerify: user.is_verify ?? false,
      name: user.name ?? '',
      type: user.type ?? 'SYSTEM',
      role: user.role ?? '',
      gender: user.gender ?? '',
      age: user.age ?? null,
    };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        is_verify: user.is_verify,
        gender: user.gender,
        age: user.age,
        type: user.type,
      },
    };
  }

  async register(createUserDto: CreateUserDto, returnRawUser = false) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException(`Email: ${createUserDto.email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`);
    }

    // Create user
    const user = await this.usersService.create(createUserDto);
    
    if (returnRawUser) {
      return user;
    }
    // Login after registration
    return this.login(user);
  }

  async updateUserToAdmin(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update user to ADMIN role
    const updatedUser = await this.usersService.update(user.id.toString(), { 
      role: 'ADMIN',
      is_verify: true 
    });

    return updatedUser;
  }

  async getAccount(user: any) {
    const userData = await this.usersService.findById(Number(user.userId));
    if (!userData) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar,
      address: userData.address,
      age: userData.age,
      gender: userData.gender,
      is_verify: userData.is_verify,
    };
  }

  async refresh(refresh_token: string) {
    try {
      const payload = this.jwtService.verify(refresh_token);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        sub: user.id?.toString() ?? '',
        iss: 'from server',
        _id: user.id?.toString() ?? '',
        email: user.email,
        address: user.address ?? '',
        isVerify: user.is_verify ?? false,
        name: user.name ?? '',
        type: user.type ?? 'SYSTEM',
        role: user.role ?? '',
        gender: user.gender ?? '',
        age: user.age ?? null,
      };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          username: user.username ?? '',
          name: user.name ?? '',
          email: user.email ?? '',
          role: user.role ?? '',
          avatar: user.avatar ?? '',
          address: user.address ?? '',
          is_verify: user.is_verify ?? false,
          gender: user.gender ?? '',
          age: user.age ?? null,
          type: user.type ?? 'SYSTEM',
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async socialMedia(type: string, username: string) {
    // Tìm user theo email
    let user = await this.usersService.findByEmail(username);
    
    if (!user) {
      // Create user if not exists (for demo purposes)
      const createUserDto: CreateUserDto = {
        name: username.split('@')[0],
        email: username,
        password: 'social_media_password', // In real app, this would be handled differently
        role: 'USER',
        type: type, // Set type đúng theo request
        is_verify: true, // Luôn true cho social
      };
      user = await this.usersService.create(createUserDto);
    } else {
      // Nếu user đã tồn tại nhưng type hoặc is_verify chưa đúng, cập nhật lại
      let needUpdate = false;
      if (user.type !== type) {
        user.type = type;
        needUpdate = true;
      }
      if (!user.is_verify) {
        user.is_verify = true;
        needUpdate = true;
      }
      if (needUpdate) {
        await this.usersService.update(user.id.toString(), { type, is_verify: true });
        user = await this.usersService.findById(user.id);
      }
    }

    return this.login(user!);
  }
} 