import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from './schemas/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { User } from '../users/schemas/user.entity';
import { Comment } from '../comments/schemas/comment.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async findAll(current = 1, pageSize = 10) {
    const skip = (current - 1) * pageSize;
    const [result, total] = await this.tracksRepository.findAndCount({
      where: { is_deleted: false },
      skip,
      take: pageSize,
      order: { created_at: 'DESC' },
      relations: ['uploader'],
    });
    return {
      meta: {
        current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      result,
    };
  }

  async create(createTrackDto: CreateTrackDto, user: any) {
    const uploader = await this.usersRepository.findOne({ where: { id: user.userId } });
    if (!uploader) throw new NotFoundException('Uploader not found');

    // 1. Kiểm tra file tồn tại trên server
    const tracksDir = path.join(process.cwd(), 'public', 'tracks');
    const filePath = path.join(tracksDir, createTrackDto.trackUrl);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(`File upload không tồn tại trên server, trackUrl = ${createTrackDto.trackUrl}`);
    }

    // 2. Kiểm tra trùng lặp trackUrl
    const existed = await this.tracksRepository.findOne({ where: { track_url: createTrackDto.trackUrl, is_deleted: false } });
    if (existed) {
      const error: any = new BadRequestException(`Track đã được upload thành công, vui lòng upload track khác. current id = ${existed.id}`);
      error.id = existed.id;
      throw error;
    }

    // 3. Tạo mới track
    const track = this.tracksRepository.create({
      title: createTrackDto.title,
      description: createTrackDto.description,
      img_url: createTrackDto.imgUrl,
      track_url: createTrackDto.trackUrl,
      category: createTrackDto.category,
      uploader,
    });
    return this.tracksRepository.save(track);
  }

  async update(id: string, updateTrackDto: UpdateTrackDto) {
    const track = await this.tracksRepository.findOne({ where: { id: +id, is_deleted: false } });
    if (!track) return {
      acknowledged: true,
      modifiedCount: 0,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 0,
    };
    Object.assign(track, {
      title: updateTrackDto.title ?? track.title,
      description: updateTrackDto.description ?? track.description,
      img_url: updateTrackDto.imgUrl ?? track.img_url,
      track_url: updateTrackDto.trackUrl ?? track.track_url,
      category: updateTrackDto.category ?? track.category,
    });
    await this.tracksRepository.save(track);
    return {
      acknowledged: true,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    };
  }

  async remove(id: string) {
    const track = await this.tracksRepository.findOne({ where: { id: +id, is_deleted: false } });
    if (!track) {
      return {
        acknowledged: true,
        deletedCount: 0,
      };
    }
    track.is_deleted = true;
    track.deleted_at = new Date();
    await this.tracksRepository.save(track);
    return {
      acknowledged: true,
      deletedCount: 1,
    };
  }

  async findOne(id: string) {
    const track = await this.tracksRepository.findOne({ where: { id: +id, is_deleted: false }, relations: ['uploader'] });
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  async getTopTracks(category: string, limit: number) {
    return this.tracksRepository.find({
      where: { is_deleted: false, category },
      order: { count_play: 'DESC' },
      take: limit,
      relations: ['uploader'], // Đảm bảo join thông tin uploader
    });
  }

  async getCommentsByTrack(trackId: string, current = 1, pageSize = 10) {
    const skip = (current - 1) * pageSize;
    const [result, total] = await this.commentsRepository.findAndCount({
      where: { track: { id: +trackId } },
      skip,
      take: pageSize,
      order: { created_at: 'DESC' },
      relations: ['user', 'track'],
    });
    return {
      meta: {
        current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      result,
    };
  }

  async findByUploader(current = 1, pageSize = 10, userId: string) {
    const skip = (current - 1) * pageSize;
    const [result, total] = await this.tracksRepository.findAndCount({
      where: { is_deleted: false, uploader: { id: +userId } },
      skip,
      take: pageSize,
      order: { created_at: 'DESC' },
      relations: ['uploader'],
    });
    return {
      meta: {
        current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      result,
    };
  }

  async increaseView(id: string) {
    const numId = Number(id);
    if (!numId || isNaN(numId)) throw new BadRequestException('Invalid track id');
    const track = await this.tracksRepository.findOne({ where: { id: numId, is_deleted: false } });
    if (!track) throw new NotFoundException('Track not found');
    track.count_play = (track.count_play || 0) + 1;
    await this.tracksRepository.save(track);
    return true;
  }

  async searchTracks(title: string, current = 1, pageSize = 10) {
    const skip = (current - 1) * pageSize;
    if (!title || title.trim() === '') {
      return {
        meta: { current, pageSize, total: 0, totalPages: 0 },
        result: [],
      };
    }
    const query = this.tracksRepository.createQueryBuilder('track')
      .leftJoinAndSelect('track.uploader', 'uploader')
      .where('track.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere(
        'LOWER(track.title) LIKE :kw',
        { kw: `%${title.toLowerCase()}%` }
      );

    const [result, total] = await query
      .orderBy('track.created_at', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      meta: {
        current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      result,
    };
  }
} 