import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerStorageConfig = diskStorage({
  destination: 'uploads',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/\s+/g, '_');
    const ext = extname(file.originalname);
    const name = originalName.slice(0, -ext.length);
    cb(null, name + '-' + uniqueSuffix + ext);
  },
});
