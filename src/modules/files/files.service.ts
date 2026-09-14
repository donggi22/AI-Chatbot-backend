import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File) {
    return {
      originalname: file.originalname,
      filename: file.filename,
      fileUrl: `images/${file.filename}`,
      mimetype: file.mimetype,
    };
  }
}
