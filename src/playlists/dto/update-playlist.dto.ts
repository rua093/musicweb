import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePlaylistDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString({ message: 'title không được để trống' })
  title?: string;

  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  @IsBoolean({ message: 'isPublic có định dạng boolean' })
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : value)
  @IsNumber({}, { each: true, message: 'track có định dạng là number' })
  tracks?: number[];
} 