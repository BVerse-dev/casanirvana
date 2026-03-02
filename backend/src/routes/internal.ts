import express from 'express';
import { requirePaymentChargeCronApiKey, requirePayoutAutomationApiKey } from '../middleware/apiKey';
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

router.post(
  '/payouts/recompute-balances',
  requirePayoutAutomationApiKey,
  validateRequest({ body: schemas.internalPayoutRecomputeBody }),
  paymentController.recomputeInternalPayoutBalancesHandler
);

router.post(
  '/payouts/release-stale-reservations',
  requirePayoutAutomationApiKey,
  validateRequest({ body: schemas.internalPayoutReleaseBody }),
  paymentController.releaseInternalStalePayoutReservationsHandler
);

export default router;
