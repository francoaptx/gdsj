import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Route } from './entities/route.entity';

@Injectable()
export class PdfService {
  generateRoutePdf(route: Route): Buffer {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    let buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      buffers = [];
    });

    // Título
    doc.fontSize(16).text('HOJA DE RUTA', { align: 'center' });
    doc.moveDown();

    // Datos principales
    doc.fontSize(12);
    doc.text(`N°: ${route.routeNumber}`);
    doc.text(`Fecha: ${new Date(route.createdAt).toLocaleDateString('es-ES')}`);
    doc.text(`Remitente: ${route.sender.fullName}`);
    doc.text(`Cargo: ${route.sender.position}`);
    doc.text(`Oficina: ${route.sender.office || 'N/A'}`);
    doc.moveDown();

    doc.text(`Destinatario: ${route.recipient.fullName}`);
    doc.text(`Proveído: ${route.instruction || 'N/A'}`);
    doc.text(`Prioridad: ${route.priority === 'urgent' ? 'URGENTE' : 'Normal'}`);
    doc.text(`Referencia: ${route.reference || 'N/A'}`);
    doc.text(`Hojas: ${route.totalPages} | Anexos: ${route.attachmentsCount}`);
    doc.moveDown();

    // Pie
    doc.fontSize(10).text('Documento generado por el Sistema COINSSJJ', { align: 'center' });

    doc.end();
    return Buffer.concat(buffers);
  }
}