import { Router } from 'express';
import * as NoticeController from '../controllers/notice';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.get(
  '/notices',
  requireAuth,
  validateRequest({ query: schemas.noticeQuery }),
  NoticeController.getNotices
);
// router.post('/notices', requireAdmin, NoticeController.createNotice);

export default router;
