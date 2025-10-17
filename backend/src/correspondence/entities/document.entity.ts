import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Ajusta la ruta si es necesario

export enum DocumentType {
  REPORT = 'report',
  INTERNAL_NOTE = 'internal_note',
  EXTERNAL_NOTE = 'external_note',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ nullable: true }) // Permite valores nulos temporalmente para solucionar el arranque
  subject: string;

  @Column({ unique: true })
  cite: string; // Se genera automáticamente

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  body: string; // Contenido del documento

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  recipientId: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'ccId' })
  cc: User;

  @Column({ nullable: true })
  ccId: string;
}