import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './schemas/playlist.entity';
import { PlaylistTrack } from './schemas/playlist-track.entity';
import { CreatePlaylistDto, CreateEmptyPlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

import { Track } from '../tracks/schemas/track.entity';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistsRepo: Repository<Playlist>,
    @InjectRepository(PlaylistTrack)
    private playlistTracksRepo: Repository<PlaylistTrack>,
    @InjectRepository(Track)
    private tracksRepo: Repository<Track>,
  ) {}

  async create(dto: CreatePlaylistDto | CreateEmptyPlaylistDto, userId: number) {
    const playlist = this.playlistsRepo.create({
      title: dto.title,
      is_public: (dto as any).isPublic ?? true,
      user: { id: userId },
    });
    // Nếu có tracks thì xử lý thêm track, nếu không thì chỉ tạo playlist rỗng
    // (Không cần xử lý tracks cho playlist rỗng)
    return this.playlistsRepo.save(playlist);
  }

  async update(id: number, dto: UpdatePlaylistDto, userId: number) {
    const playlist = await this.playlistsRepo.findOne({
      where: { id, is_deleted: false },
      relations: ['user'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.user.id !== userId) throw new ForbiddenException('No permission');

    // Update basic fields
    if (dto.title !== undefined) playlist.title = dto.title;
    if (dto.isPublic !== undefined) playlist.is_public = dto.isPublic;

    // Validate tracks nếu có truyền lên
    if (dto.tracks && Array.isArray(dto.tracks)) {
      // Kiểm tra tất cả track_id có tồn tại không
      const invalidTrackIds: number[] = [];
      for (const trackId of dto.tracks) {
        const track = await this.tracksRepo.findOne({ where: { id: Number(trackId) } });
        if (!track) {
          invalidTrackIds.push(Number(trackId));
        }
      }
      if (invalidTrackIds.length > 0) {
        throw new BadRequestException(`track_id không hợp lệ: ${invalidTrackIds.join(', ')}`);
      }
      // Nếu hợp lệ, xóa toàn bộ track cũ và thêm lại track mới
      await this.playlistTracksRepo.delete({ playlist_id: id });
      for (const trackId of dto.tracks) {
        const playlistTrack = this.playlistTracksRepo.create({
          playlist_id: id,
          track_id: Number(trackId),
        });
        await this.playlistTracksRepo.save(playlistTrack);
      }
    }

    return this.playlistsRepo.save(playlist);
  }

  async remove(id: number, userId: number) {
    const playlist = await this.playlistsRepo.findOne({
      where: { id, is_deleted: false },
      relations: ['user'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.user.id !== userId) throw new ForbiddenException('No permission');
    playlist.is_deleted = true;
    playlist.deleted_at = new Date();
    return this.playlistsRepo.save(playlist);
  }

  async findOne(id: number) {
    const playlist = await this.playlistsRepo.findOne({
      where: { id, is_deleted: false },
      relations: ['user'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    return playlist;
  }

  async findByUser(userId: number, current = 1, pageSize = 10) {
    const [items, total] = await this.playlistsRepo.findAndCount({
      where: { user: { id: userId }, is_deleted: false },
      skip: (current - 1) * pageSize,
      take: pageSize,
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
    return { items, total, current, pageSize };
  }

  async findAll(current = 1, pageSize = 10) {
    const [items, total] = await this.playlistsRepo.findAndCount({
      where: { is_deleted: false },
      skip: (current - 1) * pageSize,
      take: pageSize,
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
    return { items, total, current, pageSize };
  }



  async getTracks(playlistId: number) {
    const playlist = await this.playlistsRepo.findOne({
      where: { id: playlistId, is_deleted: false },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    const playlistTracks = await this.playlistTracksRepo.find({
      where: { playlist_id: playlistId },
    });
    const trackIds = playlistTracks.map((pt) => pt.track_id);
    if (!trackIds.length) return [];
    return this.tracksRepo.findByIds(trackIds);
  }
} 