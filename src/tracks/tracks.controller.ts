import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../decorator/customize';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tracks with paginate' })
  async findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string
  ) {
    const data = await this.tracksService.findAll(+current, +pageSize);
    return {
      statusCode: 200,
      message: 'Fetch tracks with pagination',
      data: {
        meta: {
          current: data.meta.current,
          pageSize: data.meta.pageSize,
          pages: data.meta.totalPages,
          total: data.meta.total,
        },
        result: data.result.map((track: any) => ({
          _id: track.id?.toString(),
          title: track.title,
          description: track.description,
          category: track.category,
          imgUrl: track.img_url,
          trackUrl: track.track_url,
          countLike: track.count_like,
          countPlay: track.count_play,
          uploader: track.uploader ? {
            _id: track.uploader.id?.toString(),
            email: track.uploader.email,
            name: track.uploader.name,
            role: track.uploader.role,
            type: track.uploader.type,
          } : null,
          isDeleted: !!track.is_deleted,
          __v: 0, // TypeORM không có version, để 0 cho giống format mẫu
          createdAt: track.created_at,
          updatedAt: track.updated_at,
        })),
      },
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new track' })
  async create(@Body() createTrackDto: CreateTrackDto, @Request() req: any) {
    try {
      const track = await this.tracksService.create(createTrackDto, req.user);
      return {
        statusCode: 201,
        message: 'Create a new track',
        data: {
          _id: track.id?.toString(),
          createdAt: track.created_at,
        },
      };
    } catch (error) {
      let message = error.message;
      // Custom message nếu track đã tồn tại hoặc upload trùng
      if (message && message.toLowerCase().includes('track')) {
        message = `Track đã được upload thành công, vui lòng upload track khác. current id = ${error?.id ?? ''}`;
      }
      return {
        message,
        error: 'Bad Request',
        statusCode: 400,
      };
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a track' })
  async update(
    @Param('id') id: string,
    @Body() updateTrackDto: UpdateTrackDto
  ) {
    const result = await this.tracksService.update(id, updateTrackDto);
    return {
      statusCode: 200,
      message: 'Update a track by id',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a track' })
  async remove(@Param('id') id: string) {
    const result = await this.tracksService.remove(id);
    return {
      statusCode: 200,
      message: 'Delete a track',
      data: result,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Fetch a track by id' })
  async findOne(@Param('id') id: string) {
    const track = await this.tracksService.findOne(id);
    return {
      statusCode: 200,
      message: 'Fetch track by id',
      data: track ? {
        _id: track.id?.toString(),
        title: track.title,
        description: track.description,
        category: track.category,
        imgUrl: track.img_url,
        trackUrl: track.track_url,
        countLike: track.count_like,
        countPlay: track.count_play,
        uploader: track.uploader ? {
          _id: track.uploader.id?.toString(),
          email: track.uploader.email,
          name: track.uploader.name,
          role: track.uploader.role,
          type: track.uploader.type,
        } : null,
        isDeleted: !!track.is_deleted,
        __v: 0,
        createdAt: track.created_at,
        updatedAt: track.updated_at,
      } : null,
    };
  }

  @Post('top')
  @Public()
  @ApiOperation({ summary: 'Get top tracks by category' })
  async getTopTracks(@Body() body: { category: string; limit: number }) {
    const tracks = await this.tracksService.getTopTracks(body.category, body.limit);
    const data = tracks.map((track: any) => ({
      _id: track.id?.toString(),
      title: track.title,
      description: track.description,
      category: track.category,
      imgUrl: track.img_url,
      trackUrl: track.track_url,
      countLike: track.count_like,
      countPlay: track.count_play,
      uploader: track.uploader ? {
        _id: track.uploader.id?.toString(),
        email: track.uploader.email,
        name: track.uploader.name,
        role: track.uploader.role,
        type: track.uploader.type,
      } : null,
      isDeleted: !!track.is_deleted,
      __v: 0,
      createdAt: track.created_at,
      updatedAt: track.updated_at,
    }));
    return {
      statusCode: 201,
      message: 'Get Top Track by  categories',
      data
    };
  }

  @Post('comments')
  @Public()
  @ApiOperation({ summary: 'Get comments by a track (with paginate)' })
  async getCommentsByTrack(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('trackId') trackId: string
  ) {
    const { meta, result } = await this.tracksService.getCommentsByTrack(trackId, +current, +pageSize);
    const mappedResult = result.map((comment: any) => ({
      _id: comment.id?.toString(),
      content: comment.content,
      moment: comment.moment,
      user: comment.user ? {
        _id: comment.user.id?.toString(),
        email: comment.user.email,
        name: comment.user.name,
        role: comment.user.role,
        type: comment.user.type,
      } : null,
      track: comment.track?.id?.toString() ?? null,
      isDeleted: !!comment.is_deleted,
      __v: 0,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    }));
    return {
      statusCode: 201,
      message: 'Get Comments of a track',
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
  }

  @Get('users')
  @Public()
  @ApiOperation({ summary: 'Get Track created by a user' })
  async getTracksByUser(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('id') userId: string
  ) {
    const data = await this.tracksService.findByUploader(+current, +pageSize, userId);
    return {
      statusCode: 201,
      message: 'Get Track created by a user',
      data: {
        meta: {
          current: data.meta.current,
          pageSize: data.meta.pageSize,
          pages: data.meta.totalPages,
          total: data.meta.total,
        },
        result: data.result.map((track: any) => ({
          _id: track.id?.toString(),
          title: track.title,
          description: track.description,
          category: track.category,
          imgUrl: track.img_url,
          trackUrl: track.track_url,
          countLike: track.count_like,
          countPlay: track.count_play,
          uploader: track.uploader ? {
            _id: track.uploader.id?.toString(),
            email: track.uploader.email,
            name: track.uploader.name,
            role: track.uploader.role,
            type: track.uploader.type,
          } : null,
          isDeleted: !!track.is_deleted,
          __v: 0,
          createdAt: track.created_at,
          updatedAt: track.updated_at,
        })),
      },
    };
  }

  @Post('users')
  @Public()
  @ApiOperation({ summary: 'Get Track created by a user (POST)' })
  async getTracksByUserPost(
    @Body('id') userId: string,
    @Body('current') current: number = 1,
    @Body('pageSize') pageSize: number = 10
  ) {
    const data = await this.tracksService.findByUploader(current, pageSize, userId);
    return {
      statusCode: 201,
      message: 'Get Track created by a user',
      data: {
        meta: {
          current: data.meta.current,
          pageSize: data.meta.pageSize,
          pages: data.meta.totalPages,
          total: data.meta.total,
        },
        result: data.result.map((track: any) => ({
          _id: track.id?.toString(),
          title: track.title,
          description: track.description,
          category: track.category,
          imgUrl: track.imgUrl,
          trackUrl: track.trackUrl,
          countLike: track.countLike,
          countPlay: track.countPlay,
          uploader: track.uploader ? {
            _id: track.uploader.id?.toString(),
            email: track.uploader.email,
            name: track.uploader.name,
            role: track.uploader.role,
            type: track.uploader.type,
          } : null,
          isDeleted: track.isDeleted,
          __v: track.__v,
          createdAt: track.createdAt,
          updatedAt: track.updatedAt,
        })),
      },
    };
  }

  @Post('increase-view')
  @Public()
  @ApiOperation({ summary: 'Increase view/play for track' })
  async increaseView(@Body('id') id: string, @Body('trackId') trackId: string) {
    const realId = id ?? trackId;
    await this.tracksService.increaseView(realId);
    return {
      statusCode: 201,
      message: 'Increase view/play for track',
      data: 'ok',
    };
  }

  @Post('search')
  @Public()
  @ApiOperation({ summary: 'Search tracks by title' })
  async searchTracks(
    @Body('title') title: string,
    @Body('current') current: number = 1,
    @Body('pageSize') pageSize: number = 10
  ) {
    const data = await this.tracksService.searchTracks(title, current, pageSize);
    return {
      statusCode: 201,
      message: 'Get Search of tracks',
      data: {
        meta: {
          current: data.meta.current,
          pageSize: data.meta.pageSize,
          pages: data.meta.totalPages,
          total: data.meta.total,
        },
        result: data.result.map((track: any) => ({
          _id: track.id?.toString(),
          title: track.title,
          description: track.description,
          category: track.category,
          imgUrl: track.img_url,
          trackUrl: track.track_url,
          countLike: track.count_like,
          countPlay: track.count_play,
          uploader: track.uploader ? {
            _id: track.uploader.id?.toString(),
            email: track.uploader.email,
            name: track.uploader.name,
            role: track.uploader.role,
            type: track.uploader.type,
          } : null,
          isDeleted: !!track.is_deleted,
          __v: 0,
          createdAt: track.created_at,
          updatedAt: track.updated_at,
        })),
      },
    };
  }
} 