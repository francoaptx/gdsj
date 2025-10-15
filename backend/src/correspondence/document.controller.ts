// backend/src/correspondence/document.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Res,
  Request,
} from '@nestjs/common';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { documentUploadOptions } from './document-upload.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { DocumentType } from './entities/document.entity';
import * as fs from 'fs';
import * as path from 'path';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post('draft')
  createDraft(@Request() req, @Body() body: any) {
    return this.documentService.createDraft(req.user, {
      type: body.type,
      subject: body.subject,
      recipientId: body.recipientId,
      ccId: body.ccId,
      reference: body.reference,
    });
  }

  @Get(':id/template')
  async downloadTemplate(@Param('id') id: string, @Res() res) {
    const doc = await this.documentService.getDocumentById(id);

    // Generar contenido básico de Word (simulado como texto plano por ahora)
    const content = `MEMBRETE OFICIAL\n\nCite: ${doc.cite}\nFecha: ${new Date().toLocaleDateString()}\nReferencia: ${doc.reference || 'N/A'}\n\nAsunto: ${doc.subject}\n\n[Cuerpo del documento]\n\nAtentamente,\n${doc.author.fullName}\n${doc.author.position}`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="plantilla_${doc.cite}.docx"`);
    res.send(Buffer.from(content, 'utf-8'));
  }

        // Nuevo endpoint
    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file', documentUploadOptions))
    async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    ) {
    if (!file) {
        throw new Error('Archivo no proporcionado o tipo inválido');
    }
    return this.documentService.uploadFinalDocument(id, file.filename);
    }
}