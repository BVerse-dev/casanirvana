import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as guardsController from '../controllers/guards_enhanced';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = express.Router();

// Create Guard
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.guardCreate }),
  guardsController.createGuard
);

// Get All Guards with advanced filtering and search
router.get(
  '/',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.guardListQuery }),
  guardsController.getAllGuards
);

// Search Guards by Phone
router.get(
  '/search/phone',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.guardPhoneQuery }),
  guardsController.searchGuardsByPhone
);

// Get Guard by ID
router.get(
  '/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.guardIdParams }),
  guardsController.getGuard
);

// Update Guard
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.guardIdParams, body: schemas.guardUpdate }),
  guardsController.updateGuard
);

// Delete Guard
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.guardIdParams }),
  guardsController.deleteGuard
);

export default router;
