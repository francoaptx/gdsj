import { Controller, Get, UseGuards, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UserService } from './users.service';
import { CreateUserDto } from '../create-user.dto';
import { UpdateUserDto } from '../update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get('recipients')
  @UseGuards(JwtAuthGuard) // Cualquier usuario autenticado puede ver la lista de destinatarios
  findRecipients() {
    return this.usersService.findRecipients();
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard) // Solo los administradores pueden ver todos los usuarios
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // El guard se aplica a nivel de controlador, pero lo movemos a nivel de método
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // El guard se aplica a nivel de controlador, pero lo movemos a nivel de método
    return this.usersService.remove(id);
  }
}