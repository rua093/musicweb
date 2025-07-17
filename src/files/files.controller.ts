import { 
  Controller, 
  Post, 
  Get,
  Delete,
  Param,
  Query,
  UploadedFile, 
  UseInterceptors, 
  Req, 
  HttpException, 
  HttpStatus,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { multerConfig } from './multer.config';
import { Request } from 'express';
import { Express } from 'express';
import { FilesService } from './files.service';
import { UploadFileResponseDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload file (track or image)',
    description: 'Upload audio files (mp3, wav, ogg, etc.) or images (jpg, png, gif, etc.)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'File uploaded successfully',
    type: UploadFileResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file type or size'
  })
  @UseInterceptors(FileInterceptor('fileUpload', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File, 
    @Req() req: Request
  ): Promise<any> { // Đổi kiểu trả về cho phù hợp
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const targetType = req.headers['target_type'] || req.body.target_type || 'tracks';
    const userId = (req.user as any)?.id;

    const result = await this.filesService.uploadFile(file, targetType, userId);
    return {
      statusCode: 201,
      message: 'Upload Single File',
      data: {
        fileName: result.filename
      }
    };
  }

  @Get('my-files')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user files' })
  @ApiResponse({ status: 200, description: 'User files retrieved successfully' })
  async getMyFiles(
    @Req() req: Request,
    @Query('type') type?: string
  ) {
    const userId = (req.user as any)?.id;
    return this.filesService.getFilesByUser(userId, type);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user file statistics' })
  @ApiResponse({ status: 200, description: 'File statistics retrieved successfully' })
  async getFileStats(@Req() req: Request) {
    const userId = (req.user as any)?.id;
    return this.filesService.getFileStats(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileById(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.getFileById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ) {
    const userId = (req.user as any)?.id;
    await this.filesService.deleteFile(id, userId);
    return { success: true, message: 'File deleted successfully' };
  }

  @Post('upload-track')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload track file specifically',
    description: 'Upload audio file for track creation'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Track file uploaded successfully',
    type: UploadFileResponseDto
  })
  @UseInterceptors(FileInterceptor('fileUpload', multerConfig))
  async uploadTrackFile(
    @UploadedFile() file: Express.Multer.File, 
    @Req() req: Request
  ): Promise<UploadFileResponseDto> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const userId = (req.user as any)?.id;
    return this.filesService.uploadFile(file, 'tracks', userId);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload image file specifically',
    description: 'Upload image file for track cover or profile picture'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Image file uploaded successfully',
    type: UploadFileResponseDto
  })
  @UseInterceptors(FileInterceptor('fileUpload', multerConfig))
  async uploadImageFile(
    @UploadedFile() file: Express.Multer.File, 
    @Req() req: Request
  ): Promise<UploadFileResponseDto> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const userId = (req.user as any)?.id;
    return this.filesService.uploadFile(file, 'images', userId);
  }
} 