import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

// Định nghĩa các loại file được phép upload
const ALLOWED_AUDIO_TYPES = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'aiff', 'flac', 'opus', '3gp', 'mid', 'midi'];
const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Hàm tạo thư mục nếu chưa tồn tại
const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Hàm validate file type
const validateFileType = (file: any, allowedTypes: string[]) => {
  const fileExtension = extname(file.originalname).toLowerCase().substring(1);
  if (!allowedTypes.includes(fileExtension)) {
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}. Current type: ${fileExtension}`
    );
  }
};

// Hàm validate file size
const validateFileSize = (file: any) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException(
      `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }
};

const getTargetType = (req: Request): string => {
  // Ưu tiên lấy từ header, sau đó đến body, cuối cùng mặc định là 'tracks'
  return (req.headers['target_type'] as string) || req.body.target_type || 'tracks';
};

export const multerConfig = {
  storage: diskStorage({
    destination: (req: Request, file, cb) => {
      const targetType = getTargetType(req);
      let uploadPath = 'public/tracks'; // Default to tracks
      if (targetType === 'tracks') {
        uploadPath = 'public/tracks';
        validateFileType(file, ALLOWED_AUDIO_TYPES);
      } else if (targetType === 'images') {
        uploadPath = 'public/images';
        validateFileType(file, ALLOWED_IMAGE_TYPES);
      } else {
        // Nếu không chỉ định hoặc loại khác, mặc định là tracks
        uploadPath = 'public/tracks';
        validateFileType(file, ALLOWED_AUDIO_TYPES);
      }
      validateFileSize(file);
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = extname(file.originalname);
      const originalName = file.originalname.replace(fileExtension, '');
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${sanitizedName}-${uniqueSuffix}${fileExtension}`);
    },
  }),
  fileFilter: (req: Request, file: any, cb) => {
    const targetType = getTargetType(req);
    if (targetType === 'tracks') {
      validateFileType(file, ALLOWED_AUDIO_TYPES);
    } else if (targetType === 'images') {
      validateFileType(file, ALLOWED_IMAGE_TYPES);
    } else {
      validateFileType(file, ALLOWED_AUDIO_TYPES);
    }
    validateFileSize(file);
    cb(null, true);
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}; 