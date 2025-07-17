import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put, 
  Patch,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../decorator/customize';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new User' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    try {
      const currentUser = req.user;
      if (!currentUser || currentUser.role !== 'ADMIN') {
        return {
          message: `Bạn không có quyền thực hiện tác vụ này. Chỉ có role = ADMIN mới có thể thao tác. (Role tài khoản hiện tại = ${currentUser?.role ?? 'UNKNOWN'})`,
          error: 'Bad Request',
          statusCode: 400,
        };
      }
      const user = await this.usersService.create(createUserDto);
      return {
        statusCode: 201,
        message: 'Create a new User',
        data: {
          _id: user.id?.toString(),
          createdAt: user.created_at,
        },
      };
    } catch (error) {
      // Custom lại message cho lỗi email đã tồn tại
      let message = error.message;
      if (message && message.toLowerCase().includes('email')) {
        message = `Email: ${createUserDto.email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`;
      }
      return {
        message,
        error: 'Bad Request',
        statusCode: 400,
      };
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all user without paginate' })
  @ApiResponse({ status: 200, description: 'Get all users successfully' })
  async findAllNoPaginate() {
    try {
      const users = await this.usersService.findAllNoPaginate();
      // Map users to the required format, không có __v
      const result = users.map((user: any) => ({
        _id: user.id?.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
        age: user.age,
        gender: user.gender,
        isVerify: user.is_verify,
        type: user.type,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }));
      return {
        statusCode: 200,
        message: 'Fetch all user without paginate',
        data: { result },
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
        data: { result: [] },
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch user with paginate' })
  @ApiResponse({ status: 200, description: 'Get users with pagination successfully' })
  async findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('q') q: string
  ) {
    try {
      const { meta, result } = await this.usersService.findAll(+current, +pageSize, q);
      // Map lại user cho đúng format
      const mappedResult = result.map((user: any) => ({
        _id: user.id?.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
        age: user.age,
        gender: user.gender,
        isVerify: user.is_verify,
        type: user.type,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }));
      return {
        statusCode: 200,
        message: 'Fetch user with paginate',
        data: {
          meta: {
            current: meta.current,
            pageSize: meta.pageSize,
            pages: meta.totalPages,
            total: meta.total,
          },
          result: mappedResult,
        },
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
        data: { meta: {}, result: [] },
      };
    }
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Fetch user by id' })
  @ApiResponse({ status: 200, description: 'Get user by id successfully' })
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        return {
          statusCode: 404,
          message: 'User not found',
          error: 'NotFoundException',
        };
      }
      return {
        statusCode: 200,
        message: 'Fetch user by id',
        data: {
          _id: user.id?.toString(),
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          address: user.address,
          age: user.age,
          gender: user.gender,
          isVerify: user.is_verify,
          type: user.type,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message,
        error: 'Bad Request',
      };
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a User' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(
    @Body() updateUserDto: UpdateUserDto & { _id: string },
    @Request() req: any
  ) {
    try {
      const userId = updateUserDto._id;
      const user = await this.usersService.update(userId, updateUserDto);
      return {
        statusCode: 200,
        message: 'Update a User',
        data: {
          acknowledged: true,
          modifiedCount: user ? 1 : 0,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: user ? 1 : 0,
        },
      };
    } catch (error) {
      // Nếu là lỗi validate, trả về message dạng array
      let message = error.message;
      if (Array.isArray(error.message)) {
        message = error.message;
      }
      return {
        message,
        error: 'Bad Request',
        statusCode: 400,
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a User' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ) {
    try {
      await this.usersService.remove(id, req.user);
      return {
        statusCode: 200,
        message: 'Delete a User',
        data: {
          acknowledged: true,
          deletedCount: 1,
        },
      };
    } catch (error) {
      let message = error.message;
      if (Array.isArray(error.message)) {
        message = error.message;
      }
      return {
        message,
        error: 'Bad Request',
        statusCode: 400,
      };
    }
  }
} 