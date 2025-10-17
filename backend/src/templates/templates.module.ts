import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller'; // Ruta corregida
import { User } from '../users/entities/user.entity';
import { IsAdminGuard } from '../middleware/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Para que IsAdminGuard pueda usar el repositorio de User
  ],
  controllers: [TemplatesController],
  providers: [IsAdminGuard], // Proveer el guard para que pueda ser inyectado
})
export class TemplatesModule {}