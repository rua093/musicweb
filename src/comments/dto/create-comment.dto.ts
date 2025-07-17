import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value !== undefined ? Number(value) : value)
  moment?: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  track: number;
} 