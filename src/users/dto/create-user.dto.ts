import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123'
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User age',
    example: 25,
    required: false
  })
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'User gender',
    enum: ['MALE', 'FEMALE', 'OTHER'],
    example: 'MALE',
    required: false
  })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, City, Country',
    required: false
  })
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'User type (SYSTEM, SOCIAL, ...)',
    example: 'SYSTEM',
    required: false
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['USER', 'ADMIN'],
    example: 'USER',
    required: false
  })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';

  @ApiProperty({
    description: 'User is verified',
    example: true,
    required: false
  })
  @IsOptional()
  is_verify?: boolean;
} 