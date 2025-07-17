import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './schemas/like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { Track } from '../tracks/schemas/track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Track])],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {} 