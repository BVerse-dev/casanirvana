import express from 'express';
import { requirePaymentChargeCronApiKey } from '../middleware/apiKey';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';
import * as paymentController from '../controllers/payment';

const router = express.Router();

router.post(
  '/payment-charges/run-due',
  requirePaymentChargeCronApiKey,
  validateRequest({ body: schemas.adminPaymentChargeRunDueBody }),
  paymentController.runDueAdminPaymentCharges
);

export default router;
