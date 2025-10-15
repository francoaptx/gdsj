import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class CiteService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async generateUniqueCite(office: string): Promise<string> {
    const year = new Date().getFullYear();
    const officeCode = office.replace(/\s+/g, '_').toUpperCase();

    // Contar cuántos documentos tiene esta oficina este año
    const count = await this.documentRepository.count({
      where: {
        cite: Like(`${officeCode}-${year}-%`),
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${officeCode}-${year}-${sequence}`;
  }
}