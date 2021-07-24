import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { GOOGLE_FIREBASE_STORAGE_BUCKET } from './constants/environment';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: GOOGLE_FIREBASE_STORAGE_BUCKET,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
