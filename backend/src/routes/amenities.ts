import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as amenitiesController from '../controllers/amenities_enhanced';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = express.Router();

// Create Amenity
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.amenityCreate }),
  amenitiesController.createAmenity
);

// Get All Amenities with advanced filtering and search
router.get(
  '/',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.amenityListQuery }),
  amenitiesController.getAllAmenities
);

// Search Amenities by Contact Phone
router.get(
  '/search/phone',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.amenityPhoneQuery }),
  amenitiesController.searchAmenitiesByPhone
);

// Get Amenity by ID
router.get(
  '/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.amenityIdParams }),
  amenitiesController.getAmenity
);

// Update Amenity
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.amenityIdParams, body: schemas.amenityUpdate }),
  amenitiesController.updateAmenity
);

// Delete Amenity
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.amenityIdParams }),
  amenitiesController.deleteAmenity
);

export default router;
