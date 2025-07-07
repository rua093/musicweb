import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './schemas/playlist.entity';
import { PlaylistTrack } from './schemas/playlist-track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, PlaylistTrack])],
})
export class PlaylistsModule {} 