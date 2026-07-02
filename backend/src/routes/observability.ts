import express from 'express';

import { ingestClientEvent } from '../controllers/observability';
import { observabilityRateLimiter } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = express.Router();

router.post(
  '/client-events',
  observabilityRateLimiter,
  validateRequest({ body: schemas.clientObservabilityEvent }),
  ingestClientEvent
);

export default router;
