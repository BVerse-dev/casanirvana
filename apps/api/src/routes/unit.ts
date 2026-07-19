import { Router } from 'express';
import * as UnitController from '../controllers/unit';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.get(
  '/:id/units',
  requireAuth,
  validateRequest({ params: schemas.unitBySocietyParams }),
  UnitController.getUnits
);
// router.post('/:id/units', requireAdmin, UnitController.createUnit);

export default router;
