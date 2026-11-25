import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });

  const port = Number(process.env.BACKEND_PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid BACKEND_PORT');
  }

  await app.listen(port, '0.0.0.0');
  console.log(`Helpdesk NestJS API is listening on port ${port}`);
}

bootstrap().catch(error => {
  console.error('Helpdesk backend startup failed:', error);
  process.exitCode = 1;
});
