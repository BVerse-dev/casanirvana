import { Router } from 'express';
import * as UnitController from '../controllers/unit';
// import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/:id/units', UnitController.getUnits);
// router.post('/:id/units', requireAdmin, UnitController.createUnit);

export default router;
