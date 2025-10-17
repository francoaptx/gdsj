import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { DocumentType } from '../entities/document.entity';

export class CreateDocumentDto {
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsOptional()
  @IsString()
  ccId?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  body?: string;
}