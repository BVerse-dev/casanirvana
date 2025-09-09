import express from 'express';
// import { requireAuth, requirePermission } from '../middleware/auth'; // Temporarily disabled for testing
import * as guardsController from '../controllers/guards_enhanced';

const router = express.Router();

// Create Guard
router.post('/', guardsController.createGuard);

// Get All Guards with advanced filtering and search
router.get('/', guardsController.getAllGuards);

// Get Guard by ID
router.get('/:id', guardsController.getGuard);

// Update Guard
router.put('/:id', guardsController.updateGuard);

// Delete Guard
router.delete('/:id', guardsController.deleteGuard);

// Search Guards by Phone
router.get('/search/phone', guardsController.searchGuardsByPhone);

export default router;
