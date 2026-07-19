import { Router } from 'express';
import * as MaintenanceController from '../controllers/maintenance';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.get(
  '/maintenance',
  requireAuth,
  validateRequest({ query: schemas.maintenanceQuery }),
  MaintenanceController.getMaintenance
);
router.post(
  '/maintenance',
  requireAuth,
  validateRequest({ body: schemas.maintenanceCreate }),
  MaintenanceController.createMaintenance
);
router.patch(
  '/maintenance/:id',
  requireAuth,
  validateRequest({ params: schemas.idParam, body: schemas.maintenanceUpdate }),
  MaintenanceController.updateMaintenance
);

export default router;
