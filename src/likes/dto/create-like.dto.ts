import { IsNumber, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLikeDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  track: number;

  @IsNumber()
  @IsIn([1, -1])
  @Transform(({ value }) => Number(value))
  quantity: number;
} 