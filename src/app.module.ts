import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionModule } from './collections/collections.module';
import { CommentsModule } from './comments/comments.module';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { ContentsModule } from './contents/contents.module';
import { RolesGuard } from './guards/roles.guards';
import { LikesModule } from './likes/likes.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { RequireMiddleware } from './middlewares/require-user.middleware';
import { MonImagesModule } from './mon-images/mon-images.module';
import { MonsModule } from './mons/mons.module';
import { PaintingsModule } from './paintings/paintings.module';
import { PaybacksModule } from './paybacks/paybacks.module';
import { RareNewsModule } from './rare-news/rare-news.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    MonsModule,
    UsersModule,
    MonImagesModule,
    PaybacksModule,
    CollectionModule,
    PaintingsModule,
    CommentsModule,
    LikesModule,
    RareNewsModule,
    ContentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
    consumer
      .apply(RequireMiddleware)
      .forRoutes(
        'users/logout',
        'users/available-contributions',
        'users/referred-count',
        'collections/hunt',
        'collections/blend',
        'collections/evolve',
        'likes',
        { path: 'paintings', method: RequestMethod.POST },
        { path: 'paintings', method: RequestMethod.PATCH },
        { path: 'paintings', method: RequestMethod.DELETE },
        { path: 'mon-images', method: RequestMethod.POST },
        { path: 'mon-images', method: RequestMethod.PATCH },
        { path: 'mon-images', method: RequestMethod.DELETE },
        { path: 'paybacks', method: RequestMethod.POST },
        'paybacks/last',
        { path: 'contents', method: RequestMethod.POST },
        { path: 'contents', method: RequestMethod.PATCH },
        { path: 'contents', method: RequestMethod.DELETE },
        { path: 'comments', method: RequestMethod.POST },
        { path: 'comments', method: RequestMethod.PATCH },
        { path: 'comments', method: RequestMethod.DELETE },
      );
  }
}
