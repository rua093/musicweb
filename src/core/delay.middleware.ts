import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DelayMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Add a small delay to simulate network latency
    setTimeout(() => {
      next();
    }, 100);
  }
}

export default DelayMiddleware; 