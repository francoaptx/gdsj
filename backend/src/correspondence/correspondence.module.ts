import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { Document } from './entities/document.entity'; // ← nuevo
import { DocumentService } from './document.service'; // ← nuevo
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DocumentController } from './document.controller'; // ← nuevo
import { CiteService } from './cite.service'; // ← nuevo
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { RouteNumberService } from './route-number.service';
import { PdfService } from './pdf.service';
import { WorkdaysService } from './workdays.service';
import { HistoryService } from './history.service';
import { RouteHistory } from './entities/route-history.entity';
import { GroupingService } from './grouping.service';

@Module({
  imports: [TypeOrmModule.forFeature([Route, Document, RouteHistory])],
  providers: [DashboardService,
              DocumentService, 
              CiteService, 
              RouteService, 
              RouteNumberService,
              PdfService, 
              WorkdaysService,
              HistoryService,
              GroupingService],
  controllers: [DashboardController,
                DocumentController,
                RouteController],
  exports: [TypeOrmModule, DocumentService, CiteService, GroupingService],
})
export class CorrespondenceModule {}