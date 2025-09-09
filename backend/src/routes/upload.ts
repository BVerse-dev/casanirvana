import { Router } from 'express';
import * as UploadController from '../controllers/upload';
import multer from 'multer';
const upload = multer();

const router = Router();

router.post('/uploads', upload.single('file'), UploadController.uploadFile);

export default router;
