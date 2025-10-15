import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RouteService } from './route.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Get, Param, Delete, BadRequestException, Query } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { HistoryService } from './history.service';
import { GroupingService } from './grouping.service';
import { Route } from './entities/route.entity';
import * as PDFDocument from 'pdfkit';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(
    private routeService: RouteService,
    private pdfService: PdfService,
    private historyService: HistoryService,
    private groupingService: GroupingService,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('simpleAttachment', {
      storage: diskStorage({
        destination: './uploads/routes',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `route-attachment-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // RNF 2.1
    }),
  )
  async createRoute(
    @Request() req,
    @Body() body: any,
    @UploadedFile() simpleAttachment?: Express.Multer.File,
  ) {
    const routeData = {
      ...body,
      simpleAttachmentPath: simpleAttachment
        ? `/uploads/routes/${simpleAttachment.filename}`
        : undefined,
    };
    return this.routeService.createRoute(req.user, routeData);
  }
    // Generar PDF
    @Get(':id/pdf')
    async getRoutePdf(@Param('id') id: string, @Request() req, @Res() res) {
    const route = await this.routeService.getRouteById(id, req.user.id);
    const pdfBuffer = this.pdfService.generateRoutePdf(route);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="hoja_ruta_${route.routeNumber}.pdf"`);
    res.send(pdfBuffer);
    }

    // Cancelar
    @Delete(':id/cancel')
    async cancelRoute(@Param('id') id: string, @Request() req) {
    return this.routeService.cancelRoute(id, req.user.id);
    }

    // Enviar copia
    @Post(':id/copy')
    async sendCopy(@Param('id') id: string, @Body('recipientId') recipientId: string, @Request() req) {
    if (!recipientId) throw new BadRequestException('recipientId es requerido');
    return this.routeService.sendCopy(id, recipientId, req.user.id);
    }
    // Listar entrantes (no recibidas)
    @Get('incoming')
    async getIncomingRoutes(@Request() req) {
    return this.routeService.getIncomingRoutes(req.user.id);
    }

    // Recibir
    @Post(':id/receive')
    async receiveRoute(@Param('id') id: string, @Request() req) {
    return this.routeService.receiveRoute(id, req.user.id, req.user);
    }

    // Archivar
    @Post(':id/archive')
    async archiveRoute(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.routeService.archiveRoute(id, req.user.id, body);
    }

    // Derivar
    @Post(':id/forward')
    async forwardRoute(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.routeService.forwardRoute(id, req.user.id, body.recipientId, body.documentId);
    }

    // Listar archivados
    @Get('archived')
    async getArchivedRoutes(@Request() req) {
    return this.routeService.getArchivedRoutes(req.user.id);
    }

    // Desarchivar
    @Post(':id/unarchive')
    async unarchiveRoute(@Param('id') id: string, @Request() req) {
    return this.routeService.unarchiveRoute(id, req.user.id, req.user);
    }

    // Historial completo
    @Get(':id/history')
    async getRouteHistory(@Param('id') id: string, @Request() req) {
    // Validar que el usuario tenga acceso (remite o recibió)
    return this.historyService.getFullHistory(id);
    }

    @Post('group')
    async groupRoutes(@Body() body: { routeIds: string[]; mainRouteId: string }, @Request() req) {
    return this.groupingService.groupRoutes(req.user.id, body.routeIds, body.mainRouteId);
    }

    @Post('ungroup/:groupId')
    async ungroupRoutes(@Param('groupId') groupId: string, @Request() req) {
    return this.groupingService.ungroupRoutes(req.user.id, groupId);
    }

    @Get('group/:groupId/cover')
    async getGroupCover(@Param('groupId') groupId: string, @Res() res) {
    const routes = await this.groupingService.getGroupCover(groupId);
    
    // Generar PDF de carátula (usamos PdfService)
    const doc = new PDFDocument({ margin: 50 });
    let buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(18).text('CARÁTULA DE AGRUPACIÓN', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Grupo ID: ${groupId}`);
    doc.moveDown();

    routes.forEach((r, i) => {
        doc.text(`${i + 1}. Hoja: ${r.routeNumber}`);
        doc.text(`   Remitente: ${r.sender.fullName}`);
        doc.text(`   Asunto: ${r.instruction || 'N/A'}`);
        doc.moveDown();
    });

    doc.end();
    const pdf = Buffer.concat(buffers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="caratula_grupo_${groupId}.pdf"`);
    res.send(pdf);
    }

    @Get('search')
    async searchRoutes(@Query('q') query: string, @Request() req) {
    const qb = this.routeRepository.createQueryBuilder('route')
        .leftJoinAndSelect('route.sender', 'sender')
        .where('route.senderId = :userId OR route.recipientId = :userId', { userId: req.user.id });

    if (query) {
        qb.andWhere(`
        route.routeNumber ILIKE :term
        OR route.reference ILIKE :term
        OR sender.fullName ILIKE :term
        OR route.instruction ILIKE :term
        `).setParameter('term', `%${query}%`);
    }

    return qb.getMany();
    }
}