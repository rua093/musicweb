import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './schemas/comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Track } from '../tracks/schemas/track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Track])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {} 