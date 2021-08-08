import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gitkemon.appspot.com',
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:4000',
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
  await app.listen(3000);
}
bootstrap();
