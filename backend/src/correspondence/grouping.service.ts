import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GroupingService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async groupRoutes(userId: string, routeIds: string[], mainRouteId: string) {
    // Validar que todas las rutas pertenecen al usuario y están en estado PENDING
    const routes = await this.routeRepository.findByIds(routeIds);
    if (routes.length !== routeIds.length) throw new Error('Alguna hoja no encontrada');
    if (!routes.every(r => r.recipientId === userId && r.status === 'pending')) {
      throw new Error('Solo se pueden agrupar hojas pendientes propias');
    }
    if (!routeIds.includes(mainRouteId)) throw new Error('Hoja principal no en la selección');

    const groupId = uuidv4();
    for (const route of routes) {
      route.groupId = groupId;
      route.isMainRoute = route.id === mainRouteId;
    }
    return this.routeRepository.save(routes);
  }

  async ungroupRoutes(userId: string, groupId: string) {
    const routes = await this.routeRepository.find({ where: { groupId, recipientId: userId } });
    for (const route of routes) {
      route.groupId = null;
      route.isMainRoute = null;
    }
    return this.routeRepository.save(routes);
  }

  async getGroupCover(groupId: string) {
    const routes = await this.routeRepository.find({
      where: { groupId },
      relations: ['sender', 'recipient'],
      order: { createdAt: 'ASC' },
    });
    return routes;
  }
}