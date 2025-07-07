import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './schemas/track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Track])],
})
export class TracksModule {} 