import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteHistory, RouteAction } from './entities/route-history.entity';
import { User } from '../users/entities/user.entity';
import { Route } from './entities/route.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(RouteHistory)
    private historyRepository: Repository<RouteHistory>,
  ) {}

  async logAction(
    route: Route,
    user: User,
    action: RouteAction,
    details?: string,
    previousStatus?: string,
    newStatus?: string,
  ) {
    const log = this.historyRepository.create({
      action,
      details,
      route,
      routeId: route.id,
      user,
      userId: user.id,
      previousStatus,
      newStatus,
    });
    return this.historyRepository.save(log);
  }

  async getFullHistory(routeId: string) {
    return this.historyRepository.find({
      where: { routeId },
      relations: ['user'],
      order: { timestamp: 'ASC' },
    });
  }
}