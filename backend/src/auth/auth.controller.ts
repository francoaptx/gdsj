// src/auth/auth.controller.ts
import { Controller, Post, Request, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
// import { LocalAuthGuard } from './local-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(JwtAuthGuard)
  login(@Request() req) {
    return this.authService.login(req.user);
  }
}