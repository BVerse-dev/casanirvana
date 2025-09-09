import { Request, Response } from 'express';
import * as UploadService from '../services/upload';

export async function uploadFile(req: Request, res: Response) {
  try {
    // req.file is provided by multer middleware
    const file = await UploadService.uploadFile(req.file);
    res.status(201).json(file);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
