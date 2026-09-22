import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/**
 * Arranque HTTP (infraestructura).
 *
 * FLUJO global:
 *   proceso Node → NestFactory → AppModule (enchufe) → listen :3000
 *   request      → Controller  → UseCase → Puertos → Adapters
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Gateway de IA (práctica) → http://localhost:${port}`);
  logger.log('POST /v1/completions | GET / | GET /v1/budget | GET /v1/audit');
  logger.log('Lee README.md para el algoritmo y ejemplos curl.');
}

await bootstrap();
