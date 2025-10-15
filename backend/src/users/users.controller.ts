import { Controller, Get, UseGuards, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UserService } from './users.service';
import { CreateUserDto } from '../create-user.dto';
import { UpdateUserDto } from '../update-user.dto'; // Asegúrate de que la ruta sea correcta

@Controller('users')
@UseGuards(JwtAuthGuard) // Proteger todas las rutas con autenticación JWT
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get('recipients')
  // No AdminGuard aquí, cualquier usuario autenticado puede ver la lista
  findRecipients() {
    return this.usersService.findRecipients();
  }

  @Get()
  @UseGuards(AdminGuard) // Y además, requerir rol de admin
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard) // Y además, requerir rol de admin
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard) // Y además, requerir rol de admin
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard) // Y además, requerir rol de admin
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}