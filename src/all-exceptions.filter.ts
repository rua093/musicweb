import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    console.error('DEBUG Exception:', {
      url: request.url,
      method: request.method,
      exception,
      message: exception?.message,
      stack: exception?.stack,
    });

    response.status(exception?.status || 500).json({
      statusCode: exception?.status || 500,
      message: exception?.message || 'Internal server error',
      error: exception?.name || 'Error',
    });
  }
} 