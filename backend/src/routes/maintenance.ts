import { Router } from 'express';
import * as MaintenanceController from '../controllers/maintenance';
// import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/maintenance', MaintenanceController.getMaintenance);
router.post('/maintenance', MaintenanceController.createMaintenance);
router.patch('/maintenance/:id', MaintenanceController.updateMaintenance);

export default router;
