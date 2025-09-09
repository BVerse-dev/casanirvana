import express from 'express';
// import { requireAuth, requirePermission } from '../middleware/auth'; // Temporarily disabled for testing
import * as amenitiesController from '../controllers/amenities_enhanced';

const router = express.Router();

// Create Amenity
router.post('/', amenitiesController.createAmenity);

// Get All Amenities with advanced filtering and search
router.get('/', amenitiesController.getAllAmenities);

// Get Amenity by ID
router.get('/:id', amenitiesController.getAmenity);

// Update Amenity
router.put('/:id', amenitiesController.updateAmenity);

// Delete Amenity
router.delete('/:id', amenitiesController.deleteAmenity);

// Search Amenities by Contact Phone
router.get('/search/phone', amenitiesController.searchAmenitiesByPhone);

export default router;
