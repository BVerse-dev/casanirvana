import { Router } from 'express';
import * as UploadController from '../controllers/upload';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/rateLimit';

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const maxBytes = Number(process.env.UPLOAD_MAX_BYTES || DEFAULT_MAX_BYTES);
const defaultAllowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];
const allowedTypes = (process.env.UPLOAD_ALLOWED_MIME_TYPES || '')
  .split(',')
  .map(t => t.trim())
  .filter(Boolean);

const upload = multer({
  limits: { fileSize: Number.isFinite(maxBytes) ? maxBytes : DEFAULT_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const effectiveAllowed = allowedTypes.length > 0 ? allowedTypes : defaultAllowedTypes;
    if (effectiveAllowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported file type'));
  },
});

const router = Router();

router.post('/uploads', requireAuth, uploadRateLimiter, upload.single('file'), UploadController.uploadFile);

export default router;
