import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  private validateUserId(req: any): number {
    const userId = req.user?.userId;
    if (!userId || isNaN(Number(userId))) {
      throw new BadRequestException('Invalid user ID');
    }
    return Number(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new like' })
  @ApiResponse({ status: 201, description: 'Like created successfully' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateLikeDto, @Request() req) {
    const userId = this.validateUserId(req);
    await this.likesService.create(dto, userId);
    return {
      statusCode: 201,
      message: 'Like/Dislike a track',
      data: { d: 'ok' }
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get likes by user' })
  @ApiResponse({ status: 200, description: 'User likes retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findByUser(@Query('current') current = 1, @Query('pageSize') pageSize = 10, @Request() req) {
    const userId = this.validateUserId(req);
    return this.likesService.findByUser(userId, Number(current), Number(pageSize));
  }
} 