import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Patch,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto, CreateEmptyPlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  private validateUserId(req: any): number {
    const userId = req.user?.userId;
    if (!userId || isNaN(Number(userId))) {
      throw new BadRequestException('Invalid user ID');
    }
    return Number(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create empty playlist' })
  @ApiResponse({ status: 201, description: 'Playlist created successfully' })
  @UseGuards(JwtAuthGuard)
  @Post('empty')
  async createEmpty(@Body() dto: CreateEmptyPlaylistDto, @Request() req) {
    const userId = this.validateUserId(req);
    const playlist = await this.playlistsService.create(dto, userId);
    return {
      statusCode: 201,
      message: 'Create an empty playlist',
      data: {
        title: playlist.title,
        isPublic: playlist.is_public,
        user: playlist.user?.id ?? userId,
        tracks: [],
        isDeleted: playlist.is_deleted ?? false,
        _id: playlist.id,
        createdAt: playlist.created_at,
        updatedAt: playlist.updated_at,
        __v: 0
      }
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiResponse({ status: 201, description: 'Playlist created successfully' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreatePlaylistDto, @Request() req) {
    const userId = this.validateUserId(req);
    return this.playlistsService.create(dto, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a playlist' })
  @ApiResponse({ status: 200, description: 'Playlist updated successfully' })
  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@Body() dto: UpdatePlaylistDto, @Request() req) {
    const userId = this.validateUserId(req);
    // Gọi service update, nhưng chỉ trả về format mẫu
    await this.playlistsService.update(dto.id, dto, userId);
    return {
      statusCode: 200,
      message: 'Update a playlists',
      data: {
        acknowledged: true,
        modifiedCount: 0,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 0
      }
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a playlist' })
  @ApiResponse({ status: 200, description: 'Playlist deleted successfully' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = this.validateUserId(req);
    // Gọi service xóa, nhưng chỉ trả về format mẫu
    await this.playlistsService.remove(Number(id), userId);
    return {
      statusCode: 200,
      message: 'Delete a playlists by id',
      data: {
        acknowledged: true,
        deletedCount: 0
      }
    };
  }

  @ApiOperation({ summary: 'Get playlist by ID' })
  @ApiResponse({ status: 200, description: 'Playlist retrieved successfully' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const playlist = await this.playlistsService.findOne(Number(id));
      return {
        statusCode: 200,
        message: 'Fetch a playlists by id',
        data: playlist
      };
    } catch (err) {
      // Nếu không tìm thấy, trả về data: null, message đúng format mẫu
      return {
        statusCode: 200,
        message: 'Fetch a playlists by id',
        data: null
      };
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get playlists by user' })
  @ApiResponse({ status: 200, description: 'User playlists retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  @Post('by-user')
  async findByUser(@Query('current') current = 1, @Query('pageSize') pageSize = 10, @Request() req) {
    const userId = this.validateUserId(req);
    const { items, total } = await this.playlistsService.findByUser(userId, Number(current), Number(pageSize));
    const pages = Math.ceil(total / Number(pageSize));
    const result = items.map((playlist: any) => ({
      _id: playlist.id,
      title: playlist.title,
      isPublic: playlist.is_public,
      user: playlist.user?.id ?? userId,
      tracks: [],
      isDeleted: playlist.is_deleted ?? false,
      createdAt: playlist.created_at,
      updatedAt: playlist.updated_at,
      __v: 0
    }));
    return {
      statusCode: 201,
      message: 'Fetch playlists of a user',
      data: {
        meta: {
          current: Number(current),
          pageSize: Number(pageSize),
          pages,
          total
        },
        result
      }
    };
  }

  @ApiOperation({ summary: 'Get all playlists' })
  @ApiResponse({ status: 200, description: 'All playlists retrieved successfully' })
  @Get()
  async findAll(@Query('current') current = 1, @Query('pageSize') pageSize = 10) {
    const { items, total } = await this.playlistsService.findAll(Number(current), Number(pageSize));
    // Tính số trang
    const pages = Math.ceil(total / Number(pageSize));
    // Map lại từng playlist cho đúng format mẫu
    const result = items.map((playlist: any) => ({
      _id: playlist.id,
      title: playlist.title,
      isPublic: playlist.is_public,
      user: playlist.user ? {
        _id: playlist.user.id,
        email: playlist.user.email,
        name: playlist.user.name,
        role: playlist.user.role,
        type: playlist.user.type
      } : null,
      tracks: [], // Nếu muốn lấy tracks thực tế, cần join thêm
      isDeleted: playlist.is_deleted ?? false,
      createdAt: playlist.created_at,
      updatedAt: playlist.updated_at,
      __v: 0
    }));
    return {
      statusCode: 200,
      message: 'Fetch all playlists with pagination',
      data: {
        meta: {
          current: Number(current),
          pageSize: Number(pageSize),
          pages,
          total
        },
        result
      }
    };
  }

  @ApiOperation({ summary: 'Get tracks in playlist' })
  @ApiResponse({ status: 200, description: 'Playlist tracks retrieved successfully' })
  @Get(':id/tracks')
  async getTracks(@Param('id') id: string) {
    return this.playlistsService.getTracks(Number(id));
  }
} 