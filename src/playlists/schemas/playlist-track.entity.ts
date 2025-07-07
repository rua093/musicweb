import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Playlist } from './playlist.entity';
import { Track } from '../../tracks/schemas/track.entity';

@Entity('playlist_tracks')
export class PlaylistTrack {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Playlist, playlist => playlist.id)
  playlist: Playlist;

  @ManyToOne(() => Track, track => track.id)
  track: Track;
} 