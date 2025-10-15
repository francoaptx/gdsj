import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route, RoutePriority, RouteStatus } from './entities/route.entity';
import { User } from '../users/entities/user.entity';
import { RouteNumberService } from './route-number.service';
import { DocumentService } from './document.service';
import { WorkdaysService } from './workdays.service';
import { HistoryService } from './history.service';
import { RouteAction } from './entities/route-history.entity';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    private routeNumberService: RouteNumberService,
    private documentService: DocumentService,
    private workdaysService: WorkdaysService,
    private historyService: HistoryService,
  ) {}

  async createRoute(sender: User, data: any): Promise<Route> {
    // Generar número único
    const routeNumber = await this.routeNumberService.generateUniqueRouteNumber();

    // Si se adjunta un documento con Cite, usar su cite como referencia
    let reference = data.reference;
    let document = null;
    if (data.documentId) {
      document = await this.documentService.getDocumentById(data.documentId);
      reference = document.cite; // ← RF 4.4
    }

    const route = this.routeRepository.create({
      routeNumber,
      reference,
      totalPages: data.totalPages || 1,
      attachmentsCount: data.attachmentsCount || 0,
      instruction: data.instruction,
      priority: data.priority || RoutePriority.NORMAL,
      status: RouteStatus.SENT,
      sender,
      senderId: sender.id,
      recipientId: data.recipientId,
      document,
      documentId: data.documentId,
      simpleAttachmentPath: data.simpleAttachmentPath, // si se sube archivo sin Cite
    });

    return this.routeRepository.save(route);
  }
    // Cancelar hoja de ruta
    async cancelRoute(routeId: string, userId: string): Promise<Route> {
    const route = await this.routeRepository.findOneBy({ id: routeId, senderId: userId });
    if (!route) throw new NotFoundException('Hoja de ruta no encontrada o no autorizada');
    if (route.status !== RouteStatus.SENT) throw new Error('Solo se pueden cancelar hojas enviadas');
    
    route.status = RouteStatus.CANCELLED;
    return this.routeRepository.save(route);
    }

    // Enviar copia (misma hoja de ruta, nuevo destinatario)
    async sendCopy(originalRouteId: string, newRecipientId: string, userId: string): Promise<Route> {
    const original = await this.routeRepository.findOne({
        where: { id: originalRouteId, senderId: userId },
        relations: ['sender', 'document'],
    });
    if (!original) throw new NotFoundException('Hoja de ruta original no encontrada');

    const copy = this.routeRepository.create({
        ...original,
        recipientId: newRecipientId,
        status: RouteStatus.SENT,
        createdAt: new Date(),
    });

    // Contar cuántas copias existen para este número de hoja de ruta
    const existingCopies = await this.routeRepository.count({
      where: { routeNumber: original.routeNumber },
    });

    // Asignar el número de copia y mantener el routeNumber original
    copy.routeNumber = original.routeNumber;
    copy.copyNumber = existingCopies; // El original es 1, la primera copia es 2, etc.

    // Asegurarse de que se genere un nuevo ID para la copia
    delete copy.id;

    return this.routeRepository.save(copy);
    }
        async getRouteById(id: string, userId: string): Promise<Route> {
    return this.routeRepository.findOne({
        where: { id, senderId: userId },
        relations: ['sender', 'recipient', 'document'],
    });
    }

    // Archivar
    async archiveRoute(routeId: string, userId: string, data: { folder: string; observation: string }) {
    const route = await this.routeRepository.findOneBy({ id: routeId, recipientId: userId });
    if (!route || route.status !== RouteStatus.PENDING) throw new Error('No se puede archivar');

    route.status = RouteStatus.ARCHIVED;
    route.archivedAt = new Date();
    route.archiveFolder = data.folder;
    route.archiveObservation = data.observation;
    return this.routeRepository.save(route);
    }

    // Derivar
    async forwardRoute(
    routeId: string,
    currentUserId: string,
    newRecipientId: string,
    attachedDocumentId?: string,
    ) {
    const original = await this.routeRepository.findOne({
        where: { id: routeId, recipientId: currentUserId },
        relations: ['sender', 'document'],
    });
    if (!original || original.status !== RouteStatus.PENDING) throw new Error('No se puede derivar una hoja de ruta que no esté en estado "pendiente"');

    // Crear nueva hoja de ruta (derivación)
    const forward = this.routeRepository.create({
        routeNumber: original.routeNumber, // mismo número (grupo)
        reference: original.reference,
        totalPages: original.totalPages,
        attachmentsCount: original.attachmentsCount,
        instruction: original.instruction,
        priority: original.priority,
        status: RouteStatus.SENT,
        senderId: currentUserId, // quien deriva
        recipientId: newRecipientId,
        documentId: attachedDocumentId, // RF 6.8
        createdAt: new Date(),
    });

    // Marcar original como derivada (opcional: estado "forwarded")
    original.status = RouteStatus.ARCHIVED; // o crear nuevo estado
    await this.routeRepository.save(original);

    return this.routeRepository.save(forward);
    }

    async getSentRoutes(senderId: string) {
    return this.routeRepository.find({
        where: { senderId },
        relations: ['recipient'],
        order: { createdAt: 'DESC' },
    });
    }

    async getIncomingRoutes(recipientId: string) {
    return this.routeRepository.find({
        where: { recipientId, status: RouteStatus.SENT },
        relations: ['sender'],
        order: { createdAt: 'DESC' },
    });
    }

    async getPendingRoutes(recipientId: string) {
    return this.routeRepository.find({
        where: { recipientId, status: RouteStatus.PENDING },
        relations: ['sender', 'document'],
        order: { receivedAt: 'DESC' },
    });
    }

    async receiveRoute(routeId: string, recipientId: string, user: User): Promise<Route> {
    const route = await this.routeRepository.findOneBy({ id: routeId, recipientId });
    if (!route) throw new NotFoundException('Hoja de ruta no encontrada');
    if (route.status !== RouteStatus.SENT) throw new Error('Ya fue procesada');

    const previousStatus = route.status;
    route.status = RouteStatus.PENDING;
    route.receivedAt = new Date();
    route.deadline = this.workdaysService.addWorkdays(route.receivedAt, 8);

    const savedRoute = await this.routeRepository.save(route);
    await this.historyService.logAction(
        savedRoute,
        user,
        RouteAction.RECEIVED,
        'Recepción digital',
        previousStatus,
        RouteStatus.PENDING,
    );
    return savedRoute;
    }
 
    async getArchivedRoutes(userId: string) {
    return this.routeRepository.find({
        where: [
        { senderId: userId, status: RouteStatus.ARCHIVED },
        { recipientId: userId, status: RouteStatus.ARCHIVED },
        ],
        relations: ['sender', 'recipient'],
        order: { archivedAt: 'DESC' },
    });
    }

    async unarchiveRoute(routeId: string, userId: string, user: User) {
    const route = await this.routeRepository.findOneBy({ id: routeId, recipientId: userId });
    if (!route) throw new NotFoundException('Hoja de ruta no encontrada o no pertenece al usuario.');
    if (route.status !== RouteStatus.ARCHIVED) throw new Error('Solo se pueden desarchivar hojas en estado "archivado".');

    const previousStatus = route.status;
    route.status = RouteStatus.PENDING;
    const saved = await this.routeRepository.save(route);
    await this.historyService.logAction(saved, user, RouteAction.UNARCHIVED, 'La hoja de ruta fue desarchivada.', previousStatus, saved.status);
    return saved;
    }
    
    
}