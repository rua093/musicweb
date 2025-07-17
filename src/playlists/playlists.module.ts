import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './schemas/playlist.entity';
import { PlaylistTrack } from './schemas/playlist-track.entity';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { Track } from '../tracks/schemas/track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, PlaylistTrack, Track])],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {} 