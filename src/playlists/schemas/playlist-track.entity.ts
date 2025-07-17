import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Playlist } from './playlist.entity';
import { Track } from '../../tracks/schemas/track.entity';

@Entity('playlist_tracks')
export class PlaylistTrack {
  @PrimaryColumn()
  playlist_id: number;

  @PrimaryColumn()
  track_id: number;

  @ManyToOne(() => Playlist, (playlist) => playlist.id)
  playlist: Playlist;

  @ManyToOne(() => Track, (track) => track.id)
  track: Track;
} 