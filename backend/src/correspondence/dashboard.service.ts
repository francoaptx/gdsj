import { Injectable } from '@nestjs/common';
import { RouteService } from './route.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Route } from './entities/route.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    private routeService: RouteService,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async getDashboardData(userId: string) {
    // 1. Contadores
    const [incoming, pending, sent, archived] = await Promise.all([
      this.routeService.getIncomingRoutes(userId),
      this.routeService.getPendingRoutes(userId),
      this.routeRepository.count({ where: { senderId: userId } }), // Contador de enviados
      this.routeService.getArchivedRoutes(userId),
    ]);

    const counters = {
      inbox: incoming.length,
      pending: pending.length,
      sent: sent,
      archived: archived.length,
    };

    // 2. Datos para el gráfico: Porcentaje y cantidad de tipos de documentos enviados
    const documentTypesData = await this.routeRepository.createQueryBuilder("route")
      .innerJoin("route.document", "document")
      .select("document.type", "type")
      .addSelect("COUNT(document.id)", "count")
      .where("route.senderId = :userId", { userId })
      .groupBy("document.type")
      .getRawMany();

    const labels = documentTypesData.map(item => item.type);
    const data = documentTypesData.map(item => parseInt(item.count, 10));

    return { counters, chartData: { labels, data }, notifications: [] };
  }
}