// coinssjj/backend/src/correspondence/dashboard.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Request() req) {
    // req.user contiene el payload del JWT (incluye sub = userId)
    return this.dashboardService.getDashboardData(req.user.sub);
  }
}