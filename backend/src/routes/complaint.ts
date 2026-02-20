import { Router } from 'express';
import * as ComplaintController from '../controllers/complaint';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.get(
  '/complaints',
  requireAuth,
  validateRequest({ query: schemas.complaintQuery }),
  ComplaintController.getComplaints
);
router.post(
  '/complaints',
  requireAuth,
  validateRequest({ body: schemas.complaintCreate }),
  ComplaintController.createComplaint
);
router.patch(
  '/complaints/:id',
  requireAuth,
  validateRequest({ params: schemas.idParam, body: schemas.complaintUpdate }),
  ComplaintController.updateComplaint
);

export default router;
