// backend/src/correspondence/entities/route.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Document } from './document.entity'; // ← nuevo

export enum RouteStatus {
  SENT = 'sent',
  RECEIVED = 'received',
  PENDING = 'pending',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum RoutePriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
}

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  routeNumber: string; // ← generado automáticamente

  @Column({ type: 'text', nullable: true })
  reference?: string; // ← puede venir de un Cite o ser manual

  @Column({ type: 'int', default: 1 })
  totalPages: number; // RF 4.2

  @Column({ type: 'int', default: 0 })
  attachmentsCount: number; // RF 4.2

  @Column({ type: 'text', nullable: true })
  instruction?: string; // "Proveído" (RF 4.5)

  @Column({ type: 'enum', enum: RouteStatus, default: RouteStatus.SENT })
  status: RouteStatus;

  @Column({ type: 'enum', enum: RoutePriority, default: RoutePriority.NORMAL })
  priority: RoutePriority;

  // Relación con remitente
  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  // Destinatario
  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  recipientId: string;

  // Documento con Cite (opcional)
  @OneToOne(() => Document, { nullable: true })
  @JoinColumn()
  document?: Document;

  @Column({ nullable: true })
  documentId?: string;

  // Archivo adjunto simple (sin Cite)
  @Column({ nullable: true })
  simpleAttachmentPath?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

    // Plazo
    @Column({ nullable: true })
    receivedAt?: Date; // Momento de recepción digital

    @Column({ nullable: true })
    deadline?: Date; // Plazo máximo (8 días hábiles después de receivedAt)

    // Archivado
    @Column({ nullable: true })
    archivedAt?: Date;

    @Column({ nullable: true })
    archiveObservation?: string;

    @Column({ nullable: true })
    archiveFolder?: string; // Nombre de carpeta (RNF 2.4: inmutable)

    // Agrupación
    @Column({ nullable: true })
    groupId?: string; // UUID que identifica al grupo

    @Column({ nullable: true })
    isMainRoute?: boolean; // La hoja principal del grupo
}