import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './schemas/track.entity';
import { Comment } from '../comments/schemas/comment.entity';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { User } from '../users/schemas/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Track, Comment, User])],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {} 