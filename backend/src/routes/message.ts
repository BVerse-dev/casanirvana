import { Router } from 'express';
import * as MessageController from '../controllers/message';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.get(
  '/messages',
  requireAuth,
  validateRequest({ query: schemas.messageQuery }),
  MessageController.getMessages
);
router.post(
  '/messages',
  requireAuth,
  validateRequest({ body: schemas.messageCreate }),
  MessageController.createMessage
);

export default router;
