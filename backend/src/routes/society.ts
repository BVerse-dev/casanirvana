import { Router } from 'express';
import * as SocietyController from '../controllers/society';
// import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', SocietyController.getSocieties);
// router.post('/', requireAdmin, SocietyController.createSociety);

export default router;
