import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Generated,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DocumentType {
  INTERNAL_NOTE = 'internal_note',
  EXTERNAL_NOTE = 'external_note',
  REPORT = 'report',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ length: 100 })
  subject: string; // Asunto

  @Column({ unique: true })
  cite: string; // Número de Cite único

  @Column({ nullable: true })
  reference?: string;

  @Column({ default: false })
  isDraft: boolean;

  // Relación con autor
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  // Destinatario principal
  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  recipientId: string;

  // Vía (copia opcional)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'ccId' })
  cc?: User;

  @Column({ nullable: true })
  ccId?: string;

  // Archivo subido (ruta en disco o URL)
  @Column({ nullable: true })
  filePath?: string;

  @CreateDateColumn()
  createdAt: Date;
}