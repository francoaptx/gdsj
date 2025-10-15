import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createInitialData } from './database/seeds';
import { DataSource } from 'typeorm';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir solicitudes desde tu frontend
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  app.enableCors({
    origin: 'http://localhost:5173', // El origen de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);

  // Ejecutar seeds después de que la app esté lista
  const dataSource = app.get(DataSource);
  await createInitialData(dataSource);
}
bootstrap();