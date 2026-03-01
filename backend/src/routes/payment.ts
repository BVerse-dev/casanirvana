import { Router } from 'express';
import * as PaymentController from '../controllers/payment';
import * as ExpressPayController from '../controllers/expresspay';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.get(
  '/payments/policy',
  requireAuth,
  PaymentController.getPaymentMethodPolicy
);

router.get(
  '/payments/obligations',
  requireAuth,
  PaymentController.getPaymentObligations
);

router.get(
  '/payments/history',
  requireAuth,
  PaymentController.getPaymentHistoryFeed
);

router.get(
  '/payments/statements',
  requireAuth,
  PaymentController.getPaymentStatementsFeed
);

router.post(
  '/payments/statements/generate',
  requireAuth,
  PaymentController.generatePaymentStatement
);

router.post(
  '/payments/transactions/initiate',
  requireAuth,
  validateRequest({ body: schemas.expressPayInitiate }),
  ExpressPayController.initiatePayment
);

router.get(
  '/payments/stats/:societyId',
  requireAuth,
  validateRequest({ params: schemas.paymentStatsParams, query: schemas.paymentStatsQuery }),
  PaymentController.getPaymentStats
);
router.get(
  '/payments/society/:societyId',
  requireAuth,
  validateRequest({ params: schemas.paymentSocietyParams, query: schemas.paymentQueryOptions }),
  PaymentController.getPaymentsBySociety
);
router.get(
  '/payments/single/:id',
  requireAuth,
  validateRequest({ params: schemas.paymentIdParams }),
  PaymentController.getPaymentById
);
router.get(
  '/payments/:unitId',
  requireAuth,
  validateRequest({ params: schemas.paymentUnitParams, query: schemas.paymentQueryOptions }),
  PaymentController.getPaymentsByUnit
);
router.post(
  '/payments',
  requireAuth,
  validateRequest({ body: schemas.paymentCreate }),
  PaymentController.createPayment
);
router.put(
  '/payments/:id',
  requireAuth,
  validateRequest({ params: schemas.paymentIdParams, body: schemas.paymentUpdate }),
  PaymentController.updatePayment
);
router.patch(
  '/payments/:id/status',
  requireAuth,
  validateRequest({ params: schemas.paymentIdParams, body: schemas.paymentStatusUpdate }),
  PaymentController.updatePaymentStatus
);
router.delete(
  '/payments/:id',
  requireAuth,
  validateRequest({ params: schemas.paymentIdParams }),
  PaymentController.deletePayment
);

export default router;
