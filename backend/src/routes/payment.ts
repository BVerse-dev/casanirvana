import { Router } from 'express';
import * as PaymentController from '../controllers/payment';
// import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/payments/:unitId', PaymentController.getPaymentsByUnit);
router.get('/payments/society/:societyId', PaymentController.getPaymentsBySociety);
router.get('/payments/single/:id', PaymentController.getPaymentById);
router.post('/payments', PaymentController.createPayment);
router.put('/payments/:id', PaymentController.updatePayment);
router.patch('/payments/:id/status', PaymentController.updatePaymentStatus);
router.delete('/payments/:id', PaymentController.deletePayment);
router.get('/payments/stats/:societyId', PaymentController.getPaymentStats);

export default router;
