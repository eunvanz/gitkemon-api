import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionModule } from './collections/collections.module';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { RequireMiddleware } from './middlewares/require-user.middleware';
import { MonImagesModule } from './mon-images/mon-images.module';
import { MonsModule } from './mons/mons.module';
import { PaintingsModule } from './paintings/paintings.module';
import { PaybacksModule } from './paybacks/paybacks.module';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
    consumer
      .apply(RequireMiddleware)
      .forRoutes('users/available-contributions', 'collections/hunt');
  }
}
