// document-upload.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';

export const documentUploadOptions = {
  storage: diskStorage({
    destination: './uploads/documents',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `document-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .docx'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB (RNF 2.1)
  },
};