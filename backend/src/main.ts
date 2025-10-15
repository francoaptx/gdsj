// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { createInitialData } from './database/seeds';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Obtener DataSource para ejecutar seeds
  const dataSource = app.get(DataSource);
  await createInitialData(dataSource);

  await app.listen(3000);
}
bootstrap();