import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    if (err || !user) {
      // Custom lỗi trả về khi token sai hoặc thiếu
      throw {
        status: 401,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token không hợp lệ (hết hạn), hoặc không có Bearer Token ở  Request Header!'
      };
    }
    return user;
  }
} 