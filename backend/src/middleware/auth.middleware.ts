import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Acceso denegado. No se proporcionó token.');
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');

      const user = await this.usersRepository.findOneBy({ id: decoded.id });

      if (!user) {
        throw new UnauthorizedException('Token inválido. Usuario no encontrado.');
      }

      if (!user.isAdmin) {
        throw new ForbiddenException('Acceso denegado. Se requiere rol de administrador.');
      }

      request.user = user; // Adjuntar el usuario a la solicitud
      return true; // Permitir el acceso
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}
