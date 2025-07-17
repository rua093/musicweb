import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  message: string;
  dateTime: string;
  success: boolean;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // Nếu là lỗi (statusCode >= 400), trả về nguyên gốc
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          data.statusCode >= 400
        ) {
          return data;
        }
        // Nếu đã đúng format thành công, trả nguyên
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data &&
          'data' in data &&
          data.statusCode < 400
        ) {
          return data;
        }
        // Ngược lại, bọc lại như cũ
        return {
          data,
          statusCode: response.statusCode,
          message: 'Success',
          dateTime: new Date().toISOString(),
          success: true,
        };
      }),
    );
  }
} 