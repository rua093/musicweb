import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.entity';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const user = await this.usersService.create(createUserDto);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
} 