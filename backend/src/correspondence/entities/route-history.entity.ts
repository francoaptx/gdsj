import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from './route.entity';
import { User } from '../../users/entities/user.entity';

export enum RouteAction {
  SENT = 'sent',
  RECEIVED = 'received',
  FORWARDED = 'forwarded',
  ARCHIVED = 'archived',
  UNARCHIVED = 'unarchived',
  CANCELLED = 'cancelled',
}

@Entity('route_history')
export class RouteHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RouteAction })
  action: RouteAction;

  @Column({ type: 'text', nullable: true })
  details?: string; // ej. "Archivado en carpeta X"

  // Relación con hoja de ruta
  @ManyToOne(() => Route, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routeId' })
  route: Route;

  @Column()
  routeId: string;

  // Usuario que realizó la acción
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  previousStatus?: string;

  @Column({ nullable: true })
  newStatus?: string;

  @CreateDateColumn()
  timestamp: Date;
}