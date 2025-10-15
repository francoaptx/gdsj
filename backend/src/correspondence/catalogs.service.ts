import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from './office.entity';
import { Position } from './position.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Office) private officeRepository: Repository<Office>,
    @InjectRepository(Position) private positionRepository: Repository<Position>,
  ) {}

  private getRepository(catalog: 'offices' | 'positions'): Repository<any> {
    if (catalog === 'offices') return this.officeRepository;
    if (catalog === 'positions') return this.positionRepository;
    throw new BadRequestException('Catálogo no válido');
  }

  findAll(catalog: 'offices' | 'positions') {
    return this.getRepository(catalog).find({ order: { name: 'ASC' } });
  }

  create(catalog: 'offices' | 'positions', data: { name: string }) {
    const repo = this.getRepository(catalog);
    const newItem = repo.create(data);
    return repo.save(newItem);
  }
}