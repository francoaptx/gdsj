import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CiteService } from './cite.service'; // Asumiendo que este servicio existe
import { User } from '../users/entities/user.entity'; // Ajusta la ruta si es necesario
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    @InjectRepository(User) // Inyecta el repositorio de User para obtener detalles del remitente/destinatario
    private usersRepository: Repository<User>,
    private citeService: CiteService, // Asumiendo que CiteService existe y genera CITEs
  ) {}

  async createDraft(createDocumentDto: CreateDocumentDto, currentUser: User): Promise<Document> {
    if (!currentUser.office) {
      throw new Error('El usuario actual no tiene una oficina asignada para generar el CITE.');
    }
    const cite = await this.citeService.generateUniqueCite(currentUser.office); // Genera el CITE
    
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      cite,
    });

    return this.documentsRepository.save(document);
  }

  async getDocumentById(id: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['recipient', 'cc'], // Carga los datos de usuario relacionados
    });
    if (!document) {
      throw new NotFoundException(`Documento con ID "${id}" no encontrado`);
    }
    return document;
  }

  async generateDocument(documentId: string, currentUser: User): Promise<Buffer> {
    const document = await this.getDocumentById(documentId);

    // Carga la plantilla
    const templatePath = path.resolve(process.cwd(), 'uploads/templates/template.docx');
    if (!fs.existsSync(templatePath)) {
      throw new NotFoundException('Archivo de plantilla no encontrado. Por favor, sube una plantilla primero.');
    }
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true, // Importante para manejar saltos de línea en el contenido
    });

    // Prepara los datos para los marcadores de posición
    const recipient = await this.usersRepository.findOneBy({ id: document.recipientId });
    const ccUser = document.ccId ? await this.usersRepository.findOneBy({ id: document.ccId }) : null;

    const data = {
      CITE: document.cite,
      TIPO_DOCUMENTO: document.type.replace('_', ' ').toUpperCase(),
      DESTINATARIO_NOMBRE: recipient?.fullName || '',
      DESTINATARIO_CARGO: recipient?.position || '',
      REMITENTE_NOMBRE: currentUser.fullName,
      REMITENTE_CARGO: currentUser.position,
      FECHA: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
      ASUNTO: document.subject,
      REFERENCIA: document.reference || '',
      CONTENIDO: document.body || '',
      CC_NOMBRE: ccUser?.fullName || '',
    };

    doc.setData(data);

    try {
      doc.render();
    } catch (error) {
      console.error('Error al renderizar el documento:', error);
      throw new Error('Error al generar el documento Word. Verifique la plantilla y los datos.');
    }

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return buf;
  }
}