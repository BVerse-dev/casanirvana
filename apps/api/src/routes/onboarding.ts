import { Router } from 'express';
import * as onboardingController from '../controllers/onboarding';
import { requireOnboardingApiKey } from '../middleware/apiKey';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

// Public onboarding request endpoint (API key protected)
router.post(
  '/requests',
  requireOnboardingApiKey,
  validateRequest({ body: schemas.onboardingCreate }),
  onboardingController.createOnboardingRequest
);

export default router;
