// backend/src/users/users.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Obtiene la lista de todos los usuarios activos (para selección de destinatarios)
   * Solo accesible para usuarios autenticados
   */
  @Get()
  async findAll() {
    // Opcional: excluir al usuario actual o filtrar por oficina
    const users = await this.userService.findAllActive();
    return users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      position: user.position,
      office: user.office,
    }));
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.userService.findById(req.user.sub);
    if (!user) throw new Error('Usuario no encontrado');
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      position: user.position,
      office: user.office,
      isAdmin: user.isAdmin,
    };
  }
}