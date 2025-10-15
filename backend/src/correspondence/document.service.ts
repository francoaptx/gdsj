// backend/src/correspondence/document.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from './entities/document.entity';
import { CiteService } from './cite.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private citeService: CiteService,
  ) {}

  async createDraft(
    author: User,
    data: {
      type: DocumentType;
      subject: string;
      recipientId: string;
      ccId?: string;
      reference?: string;
    },
  ): Promise<Document> {
    const cite = await this.citeService.generateUniqueCite(author.office || 'SIN_OFICINA');

    const document = this.documentRepository.create({
      ...data,
      cite,
      author,
      authorId: author.id,
      isDraft: true,
    });

    return this.documentRepository.save(document);
  }

  async getDocumentById(id: string): Promise<Document> {
    return this.documentRepository.findOne({ where: { id }, relations: ['author', 'recipient', 'cc'] });
  }
    // En document.service.ts
    async uploadFinalDocument(documentId: string, filename: string): Promise<Document> {
    const document = await this.documentRepository.findOneBy({ id: documentId });
    if (!document) throw new Error('Documento no encontrado');

    document.filePath = `/uploads/documents/${filename}`;
    document.isDraft = false;
    return this.documentRepository.save(document);
    }
}