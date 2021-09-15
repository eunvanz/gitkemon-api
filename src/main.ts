import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import * as cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gitkemon.appspot.com',
});

const isDev = process.env.NODE_ENV === 'development';

console.log('===== process.env.SERVICE_BASE_URL', process.env.SERVICE_BASE_URL);
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: isDev
        ? 'http://localhost:4000'
        : process.env.SERVICE_BASE_URL || 'https://www.gitkemon.com',
      credentials: true,
    },
    logger: ['error', 'warn', 'log'],
  });
  Sentry.init({
    dsn: 'https://5fd6718a87794f0fa9122311e376d9bd@o554586.ingest.sentry.io/5947413',

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
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
