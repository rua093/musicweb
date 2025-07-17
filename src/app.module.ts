import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TracksModule } from './tracks/tracks.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { FilesModule } from './files/files.module';
// import { MailModule } from './mail/mail.module';
import { HealthModule } from './health/health.module';
import { ShutdownService } from './databases/shutdown.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST') || '',
        port: parseInt(config.get<string>('DB_PORT') || '3306', 10),
        username: config.get<string>('DB_USERNAME') || '',
        password: config.get<string>('DB_PASSWORD') || '',
        database: config.get<string>('DB_DATABASE') || '',
        autoLoadEntities: true,
        synchronize: true, // Chỉ dùng cho dev, production nên để false
      }),
    }),
    UsersModule,
    AuthModule,
    TracksModule,
    PlaylistsModule,
    CommentsModule,
    LikesModule,
    FilesModule,
    // MailModule, // Tạm thời tắt chức năng mail
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, ShutdownService],
})
export class AppModule {}
