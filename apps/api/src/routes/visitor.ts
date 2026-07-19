import { Router } from 'express';
import * as VisitorController from '../controllers/visitor';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.post(
  '/visitor-passes',
  requireAuth,
  validateRequest({ body: schemas.visitorPassCreate }),
  VisitorController.createVisitorPass
);
router.get(
  '/visitor-passes',
  requireAuth,
  validateRequest({ query: schemas.visitorPassesQuery }),
  VisitorController.getVisitorPasses
);
router.get('/visitor-passes/pending', requireAuth, VisitorController.getPendingVisitorPasses);
router.patch(
  '/visitor-passes/:id/approve',
  requireAuth,
  validateRequest({ params: schemas.visitorPassStatusParams }),
  VisitorController.approveVisitorPass
);
router.patch(
  '/visitor-passes/:id/reject',
  requireAuth,
  validateRequest({ params: schemas.visitorPassStatusParams }),
  VisitorController.rejectVisitorPass
);
router.post(
  '/entry-logs',
  requireAuth,
  validateRequest({ body: schemas.entryLogCreate }),
  VisitorController.createEntryLog
);

export default router;
