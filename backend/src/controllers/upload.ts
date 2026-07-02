import { Request, Response, NextFunction } from 'express';
import * as UploadService from '../services/upload';
import { createHttpError } from '../lib/httpError';

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return next(createHttpError(400, 'UPLOAD_FILE_MISSING', 'No file uploaded'));
    }
    const file = await UploadService.uploadFile(req.file);
    return res.status(201).json(file);
  } catch (error) {
    return next(error);
  }
}
