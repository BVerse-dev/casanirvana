import { Router } from 'express';
import * as MessageController from '../controllers/message';
// import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/messages', MessageController.getMessages);
router.post('/messages', MessageController.createMessage);

export default router;
