import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route, RouteStatus } from './entities/route.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async getDashboardData(userId: string) {
    const [inbox, pending, sent, archived] = await Promise.all([
      this.routeRepository.count({ where: { recipientId: userId, status: RouteStatus.RECEIVED } }),
      this.routeRepository.count({ where: { recipientId: userId, status: RouteStatus.PENDING } }),
      this.routeRepository.count({ where: { senderId: userId, status: RouteStatus.SENT } }),
      this.routeRepository.count({ where: { senderId: userId, status: RouteStatus.ARCHIVED } }),
    ]);

    // === NUEVO: Obtener documentos generados en los últimos 30 días, agrupados por día ===
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const documentsByDay = await this.routeRepository
      .createQueryBuilder('route')
      .select("DATE(route.createdAt)", "date")
      .addSelect("COUNT(route.id)", "count")
      .where("route.senderId = :userId", { userId })
      .andWhere("route.createdAt >= :date", { date: thirtyDaysAgo })
      .groupBy("DATE(route.createdAt)")
      .orderBy("DATE(route.createdAt)", "ASC")
      .getRawMany();

    // Generar serie completa (incluyendo días sin documentos)
    const labels: string[] = [];
    const data: number[] = [];
    const today = new Date();
    const dateSet = new Map<string, number>();

    documentsByDay.forEach((item: any) => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      dateSet.set(dateStr, parseInt(item.count, 10));
    });

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(dateStr);
      data.push(dateSet.get(dateStr) || 0);
    }

    // Notificaciones (sin cambios)
    const notifications = await this.routeRepository.find({
      where: [
        { senderId: userId, status: RouteStatus.CANCELLED },
        { senderId: userId, status: RouteStatus.RETURNED },
      ],
      relations: ['recipient'],
      order: { updatedAt: 'DESC' },
    });

    return {
      counters: { inbox, pending, sent, archived },
      chartData: {
        labels,
        data,
      },
      notifications: notifications.map(n => ({
        id: n.id,
        routeNumber: n.routeNumber,
        status: n.status,
        recipient: n.recipient.fullName,
        updatedAt: n.updatedAt,
      })),
    };
  }
}