import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  private validateUserId(req: any): number {
    const userId = req.user?.userId;
    if (!userId || isNaN(Number(userId))) {
      throw new BadRequestException('Invalid user ID');
    }
    return Number(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateCommentDto, @Request() req) {
    const userId = this.validateUserId(req);
    const comment = await this.commentsService.create(dto, userId);
    return {
      statusCode: 201,
      message: 'Create a new comment',
      data: {
        content: comment.content,
        moment: comment.moment,
        user: comment.user?.id ?? userId,
        track: comment.track?.id ?? dto.track,
        isDeleted: comment.is_deleted ?? false,
        _id: comment.id,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        __v: 0
      }
    };
  }

  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @Get()
  async findAll(@Query('current') current = 1, @Query('pageSize') pageSize = 10) {
    const data = await this.commentsService.findAll(Number(current), Number(pageSize));
    return {
      statusCode: 200,
      message: 'Get all comments with paginate',
      data: {
        meta: {
          current: data.current,
          pageSize: data.pageSize,
          pages: Math.ceil(data.total / data.pageSize),
          total: data.total,
        },
        result: data.items.map((c: any) => ({
          _id: c.id?.toString(),
          content: c.content,
          moment: c.moment,
          user: c.user ? {
            _id: c.user.id?.toString(),
            email: c.user.email,
            name: c.user.name,
            role: c.user.role,
            type: c.user.type,
          } : null,
          track: c.track ? {
            _id: c.track.id?.toString(),
            title: c.track.title,
            description: c.track.description,
            trackUrl: c.track.track_url,
          } : null,
          isDeleted: !!c.is_deleted,
          __v: 0,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
      },
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = this.validateUserId(req);
    const userRole = req.user?.role; // Get user role from JWT token
    const result = await this.commentsService.remove(Number(id), userId, userRole);
    return {
      statusCode: 200,
      message: '',
      data: result,
    };
  }
} 