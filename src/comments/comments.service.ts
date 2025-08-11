import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './schemas/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Track } from '../tracks/schemas/track.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepo: Repository<Comment>,
    @InjectRepository(Track)
    private tracksRepo: Repository<Track>,
  ) {}

  async create(dto: CreateCommentDto, userId: number) {
    const track = await this.tracksRepo.findOne({ where: { id: dto.track } });
    if (!track) throw new NotFoundException('Track not found');

    const comment = this.commentsRepo.create({
      content: dto.content,
      moment: dto.moment || 0,
      user: { id: userId },
      track: { id: dto.track },
    });
    return this.commentsRepo.save(comment);
  }

  async findAll(current = 1, pageSize = 10) {
    const [items, total] = await this.commentsRepo.findAndCount({
      where: { is_deleted: false },
      skip: (current - 1) * pageSize,
      take: pageSize,
      relations: ['user', 'track'],
      order: { created_at: 'DESC' },
    });
    return { items, total, current, pageSize };
  }

  async remove(id: number, userId: number, userRole?: string) {
    const comment = await this.commentsRepo.findOne({
      where: { id, is_deleted: false },
      relations: ['user'],
    });
    if (!comment) {
      return {
        acknowledged: true,
        deletedCount: 0,
      };
    }
    
    // Allow ADMIN to delete any comment, regular users can only delete their own
    if (userRole !== 'ADMIN' && comment.user.id !== userId) {
      throw new ForbiddenException('No permission');
    }
    
    comment.is_deleted = true;
    comment.deleted_at = new Date();
    await this.commentsRepo.save(comment);
    return {
      acknowledged: true,
      deletedCount: 1,
    };
  }

  async findByTrack(trackId: number, current = 1, pageSize = 10) {
    const track = await this.tracksRepo.findOne({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found');

    const [items, total] = await this.commentsRepo.findAndCount({
      where: { track: { id: trackId }, is_deleted: false },
      skip: (current - 1) * pageSize,
      take: pageSize,
      relations: ['user', 'track'],
      order: { created_at: 'DESC' },
    });
    return { items, total, current, pageSize };
  }
} 