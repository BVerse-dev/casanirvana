import express from 'express';
import { requireAuth, requirePermission } from '../middleware/auth';
import * as unitsController from '../controllers/units_enhanced';

const router = express.Router();

// Create Unit
router.post('/', unitsController.createUnit);

// Get All Units with advanced filtering and search
router.get('/', unitsController.getAllUnits);

// Get Unit by ID
router.get('/:id', requireAuth, requirePermission('read:units'), unitsController.getUnit);

// Update Unit
router.put('/:id', requireAuth, requirePermission('update:units'), unitsController.updateUnit);

// Search Units by Phone (owner/tenant)
router.get('/search/phone', requireAuth, requirePermission('read:units'), unitsController.searchUnitsByPhone);

export default router;
