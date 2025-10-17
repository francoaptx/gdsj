import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { Document } from './entities/document.entity';
import { DocumentService } from './document.service';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DocumentController } from './document.controller';
import { CiteService } from './cite.service';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { RouteNumberService } from './route-number.service';
import { PdfService } from './pdf.service';
import { WorkdaysService } from './workdays.service';
import { HistoryService } from './history.service';
import { RouteHistory } from './entities/route-history.entity';
import { GroupingService } from './grouping.service';
import { User } from '../users/entities/user.entity'; // Necesario para DocumentService

@Module({
  imports: [TypeOrmModule.forFeature([Route, Document, RouteHistory, User])], // Añadir la entidad User
  providers: [DashboardService,
              DocumentService, 
              CiteService, 
              RouteService, 
              RouteNumberService,
              PdfService, 
              WorkdaysService,
              HistoryService,
              GroupingService
              // Si tienes un CorrespondenceService, asegúrate de que esté definido e importado correctamente
              // Si no, elimínalo de aquí.
              ], 
  controllers: [DashboardController, DocumentController, RouteController],
  exports: [TypeOrmModule, DocumentService, CiteService, GroupingService],
})
export class CorrespondenceModule {}