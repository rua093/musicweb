import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackDto {
  @ApiProperty({
    description: 'Track title',
    example: 'My Awesome Track'
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Track description',
    example: 'A great track description',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Track image URL',
    example: 'https://example.com/image.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  imgUrl?: string;

  @ApiProperty({
    description: 'Track audio file URL',
    example: 'https://example.com/track.mp3'
  })
  @IsNotEmpty()
  @IsString()
  trackUrl: string;

  @ApiProperty({
    description: 'Track category',
    example: 'pop',
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string;
} 