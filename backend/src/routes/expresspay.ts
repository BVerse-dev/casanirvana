import { Router } from 'express';
import * as ExpressPayController from '../controllers/expresspay';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.post(
  '/payments/expresspay/initiate',
  requireAuth,
  validateRequest({ body: schemas.expressPayInitiate }),
  ExpressPayController.initiatePayment
);

router.post(
  '/payments/expresspay/verify',
  requireAuth,
  validateRequest({ body: schemas.expressPayVerify }),
  ExpressPayController.verifyPayment
);

router.get(
  '/payments/expresspay/status/:paymentId',
  requireAuth,
  validateRequest({ params: schemas.expressPayStatusParams }),
  ExpressPayController.getStatus
);

router.post('/payments/expresspay/callback', ExpressPayController.callback);
router.get('/payments/expresspay/callback', ExpressPayController.callback);
router.post('/xp/cb', ExpressPayController.callback);
router.get('/xp/cb', ExpressPayController.callback);

export default router;
