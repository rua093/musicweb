import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { UploadFileResponseDto } from './dto/upload-file.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {}

  /**
   * Upload file và lưu metadata vào database
   */
  async uploadFile(file: any, targetType: string, userId?: number): Promise<UploadFileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Xác định URL dựa trên loại file
    let fileUrl = '';
    if (targetType === 'tracks') {
      fileUrl = `/public/tracks/${file.filename}`;
    } else if (targetType === 'images') {
      fileUrl = `/public/images/${file.filename}`;
    } else {
      // Mặc định là tracks nếu không chỉ định
      fileUrl = `/public/tracks/${file.filename}`;
    }

    // Lưu metadata vào database nếu có userId
    if (userId) {
      const fileEntity = this.fileRepository.create({
        url: fileUrl,
        type: targetType || 'tracks',
        user: { id: userId },
      });
      await this.fileRepository.save(fileEntity);
    }

    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Lấy danh sách file theo user
   */
  async getFilesByUser(userId: number, type?: string): Promise<FileEntity[]> {
    const query = this.fileRepository.createQueryBuilder('file')
      .where('file.user.id = :userId', { userId });

    if (type) {
      query.andWhere('file.type = :type', { type });
    }

    return query.getMany();
  }

  /**
   * Xóa file và metadata
   */
  async deleteFile(fileId: number, userId?: number): Promise<void> {
    const query = this.fileRepository.createQueryBuilder('file')
      .where('file.id = :fileId', { fileId });

    if (userId) {
      query.andWhere('file.user.id = :userId', { userId });
    }

    const file = await query.getOne();
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Xóa file vật lý
    const filePath = path.join(process.cwd(), file.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Xóa metadata từ database
    await this.fileRepository.remove(file);
  }

  /**
   * Lấy thông tin file theo ID
   */
  async getFileById(fileId: number): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['user'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Kiểm tra file có tồn tại không
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    const filePath = path.join(process.cwd(), fileUrl);
    return fs.existsSync(filePath);
  }

  /**
   * Lấy thống kê file theo user
   */
  async getFileStats(userId: number): Promise<{
    total: number;
    tracks: number;
    images: number;
  }> {
    const stats = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('file.user.id = :userId', { userId })
      .groupBy('file.type')
      .getRawMany();

    const result = {
      total: 0,
      tracks: 0,
      images: 0,
    };

    stats.forEach(stat => {
      result[stat.type] = parseInt(stat.count);
      result.total += parseInt(stat.count);
    });

    return result;
  }
} 