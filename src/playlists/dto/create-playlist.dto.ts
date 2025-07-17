import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmptyPlaylistDto {
  @ApiProperty({
    description: 'Playlist title',
    example: 'My Favorite Songs'
  })
  @IsString({ message: 'title không được để trống' })
  title: string;

  @ApiProperty({
    description: 'Whether the playlist is public',
    example: true
  })
  @Transform(({ value }) => Boolean(value))
  @IsBoolean({ message: 'isPublic có định dạng boolean' })
  isPublic: boolean;
}

export class CreatePlaylistDto {
  @ApiProperty({
    description: 'Playlist title',
    example: 'My Favorite Songs'
  })
  @IsString({ message: 'title không được để trống' })
  title: string;

  @ApiProperty({
    description: 'Whether the playlist is public',
    example: true
  })
  @Transform(({ value }) => Boolean(value))
  @IsBoolean({ message: 'isPublic có định dạng boolean' })
  isPublic: boolean;

  @ApiProperty({
    description: 'Array of track IDs to add to playlist',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true, message: 'track có định dạng là number' })
  @ArrayMinSize(1, { message: 'tracks không được để trống' })
  tracks: number[];
} 