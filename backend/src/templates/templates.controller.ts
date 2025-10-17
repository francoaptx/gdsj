import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { IsAdminGuard } from '../middleware/auth.middleware';

// Usar process.cwd() para obtener la raíz del proyecto y asegurar una ruta absoluta y consistente.
const templateDir = path.join(process.cwd(), 'uploads', 'templates');
fs.mkdirSync(templateDir, { recursive: true });

@Controller('templates')
export class TemplatesController {
  @Post('upload')
  @UseGuards(IsAdminGuard)
  @UseInterceptors(FileInterceptor('template', {
    storage: diskStorage({
      destination: templateDir,
      filename: (req, file, cb) => {
        cb(null, 'template.docx');
      },
    }),
  }))
  uploadTemplate(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return { message: 'Plantilla actualizada con éxito.' };
  }
}