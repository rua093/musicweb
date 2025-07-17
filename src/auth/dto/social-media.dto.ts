import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class SocialMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['GITHUB', 'GOOGLE'])
  type: string;

  @IsString()
  @IsNotEmpty()
  username: string;
} 