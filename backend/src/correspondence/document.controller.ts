import { Controller, Post, Get, Param, Body, UseGuards, Res } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming this guard exists
import { GetUser } from './get-user.decorator'; // Asumiendo que este decorador existe
import { User } from '../users/entities/user.entity';
import { Response } from 'express';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('draft')
  async createDraft(
    @Body() createDocumentDto: CreateDocumentDto,
    @GetUser() user: User, // Obtener el usuario autenticado
  ) {
    return this.documentService.createDraft(createDocumentDto, user);
  }

  @Get(':id/download')
  async downloadGeneratedDocument(
    @Param('id') id: string,
    @GetUser() user: User, // Obtiene el usuario actual para la información del remitente
    @Res() res: Response,
  ) {
    try {
      const documentBuffer = await this.documentService.generateDocument(id, user);
      const document = await this.documentService.getDocumentById(id); // Para obtener el CITE para el nombre del archivo

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${document.cite}.docx"`);
      res.send(documentBuffer);
    } catch (error) {
      console.error('Error al descargar el documento generado:', error);
      res.status(500).send('Error al generar o descargar el documento.');
    }
  }
}