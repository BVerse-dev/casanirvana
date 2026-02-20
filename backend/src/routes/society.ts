import { Router } from 'express';
import * as SocietyController from '../controllers/society';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.get(
  '/',
  requireAuth,
  validateRequest({ query: schemas.societyListQuery }),
  SocietyController.getSocieties
);
// router.post('/', requireAdmin, SocietyController.createSociety);

export default router;
