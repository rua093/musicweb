import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  private shutdownListener$ = new Subject<void>();

  subscribeToShutdown(shutdownFn: () => void): void {
    this.shutdownListener$.subscribe(() => shutdownFn());
  }

  shutdown() {
    this.shutdownListener$.next();
  }

  onApplicationShutdown() {
    console.log('Application is shutting down...');
    this.shutdown();
  }
} 