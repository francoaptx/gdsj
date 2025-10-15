// src/database/seeds.ts
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export const createInitialData = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  // Verificar si ya existe un admin
  const adminExists = await userRepository.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const admin = userRepository.create({
      fullName: 'Administrador del Sistema',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10), // 10 es el número de rondas de salting
      office: 'Dirección Informática',
      position: 'Administrador',
      isAdmin: true,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('✅ Usuario administrador creado: admin / admin123');
  }
};