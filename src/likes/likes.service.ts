import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './schemas/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { Track } from '../tracks/schemas/track.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepo: Repository<Like>,
    @InjectRepository(Track)
    private tracksRepo: Repository<Track>,
  ) {}

  async create(dto: CreateLikeDto, userId: number) {
    const track = await this.tracksRepo.findOne({ where: { id: dto.track } });
    if (!track) throw new NotFoundException('Track not found');

    // Check if user already liked/disliked this track
    const existingLike = await this.likesRepo.findOne({
      where: { user: { id: userId }, track: { id: dto.track } },
    });

    let delta = dto.quantity;
    if (existingLike) {
      // Nếu user đổi từ like sang dislike hoặc ngược lại
      delta = dto.quantity - existingLike.quantity;
      existingLike.quantity = dto.quantity;
      await this.likesRepo.save(existingLike);
    } else {
      // Create new like
      const like = this.likesRepo.create({
        quantity: dto.quantity,
        user: { id: userId },
        track: { id: dto.track },
      });
      await this.likesRepo.save(like);
    }
    // Cập nhật count_like cho track
    track.count_like = Math.max(0, (track.count_like || 0) + delta);
    await this.tracksRepo.save(track);
    return true;
  }

  async findByUser(userId: number, current = 1, pageSize = 10) {
    const [items, total] = await this.likesRepo.findAndCount({
      where: { user: { id: userId } },
      skip: (current - 1) * pageSize,
      take: pageSize,
      relations: ['track', 'user'],
      order: { created_at: 'DESC' },
    });
    const result = items.map((like) => {
      const track = like.track;
      return {
        _id: track.id?.toString(),
        title: track.title,
        description: track.description,
        category: track.category,
        imgUrl: track.img_url,
        trackUrl: track.track_url,
        countLike: track.count_like,
        countPlay: track.count_play,
      };
    });
    return {
      statusCode: 200,
      message: 'Get Track liked by a user',
      data: {
        meta: {
          current,
          pageSize,
          pages: Math.ceil(total / pageSize),
          total,
        },
        result,
      },
    };
  }
} 