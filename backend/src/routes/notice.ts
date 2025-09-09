import { Router } from 'express';
import * as NoticeController from '../controllers/notice';
// import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/notices', NoticeController.getNotices);
// router.post('/notices', requireAdmin, NoticeController.createNotice);

export default router;
