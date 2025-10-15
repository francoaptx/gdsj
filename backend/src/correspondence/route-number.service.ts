import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Route } from './entities/route.entity';

@Injectable()
export class RouteNumberService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async generateUniqueRouteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');

    const count = await this.routeRepository.count({
      where: {
        routeNumber: Like(`HR-${year}${month}${day}-%`),
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `HR-${year}${month}${day}-${sequence}`; // Ej: HR-20251015-0001
  }
}