/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow('PORT'));
}
bootstrap();
