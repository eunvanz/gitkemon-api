import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gitkemon.appspot.com',
});

const isDev = process.env.NODE_ENV === 'development';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: isDev ? 'http://localhost:4000' : 'http://gitkemon.com',
      credentials: true,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(isDev ? 3000 : 8080);
}
bootstrap();
