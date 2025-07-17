import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FileType {
  TRACKS = 'tracks',
  IMAGES = 'images',
}

export class UploadFileDto {
  @ApiProperty({
    description: 'Type of file to upload',
    enum: FileType,
    example: FileType.TRACKS,
  })
  @IsNotEmpty()
  @IsEnum(FileType)
  target_type: FileType;

  @ApiProperty({
    description: 'File to upload',
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  fileUpload: any;
}

export class UploadFileResponseDto {
  @ApiProperty({
    description: 'Upload success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'File URL',
    example: '/public/tracks/song-1703123456789.mp3',
  })
  url: string;

  @ApiProperty({
    description: 'Generated filename',
    example: 'song-1703123456789.mp3',
  })
  filename: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'my-song.mp3',
  })
  originalname: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 5242880,
  })
  size: number;

  @ApiProperty({
    description: 'File mimetype',
    example: 'audio/mpeg',
  })
  mimetype: string;
} 