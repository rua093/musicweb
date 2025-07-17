import { IsOptional, IsString } from 'class-validator';

export class UpdateTrackDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @IsOptional()
  @IsString()
  trackUrl?: string;

  @IsOptional()
  @IsString()
  category?: string;
} 