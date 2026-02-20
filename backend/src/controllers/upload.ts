import { Request, Response } from 'express';
import * as UploadService from '../services/upload';

export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const file = await UploadService.uploadFile(req.file);
    return res.status(201).json(file);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
