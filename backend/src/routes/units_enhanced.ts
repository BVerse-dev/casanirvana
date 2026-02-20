import express from 'express';
import { requireAuth, requireAdmin, requirePermission } from '../middleware/auth';
import * as unitsController from '../controllers/units_enhanced';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = express.Router();

// Create Unit
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.unitCreate }),
  unitsController.createUnit
);

// Get All Units with advanced filtering and search
router.get(
  '/',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.unitListQuery }),
  unitsController.getAllUnits
);

// Search Units by Phone (owner/tenant)
router.get(
  '/search/phone',
  requireAuth,
  requirePermission('read:units'),
  validateRequest({ query: schemas.unitPhoneQuery }),
  unitsController.searchUnitsByPhone
);

// Get Unit by ID
router.get(
  '/:id',
  requireAuth,
  requirePermission('read:units'),
  validateRequest({ params: schemas.unitIdParams }),
  unitsController.getUnit
);

// Update Unit
router.put(
  '/:id',
  requireAuth,
  requirePermission('update:units'),
  validateRequest({ params: schemas.unitIdParams, body: schemas.unitUpdate }),
  unitsController.updateUnit
);

export default router;
