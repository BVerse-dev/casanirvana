import { Router } from 'express';

import { createContactRequest } from '../controllers/contact';
import { requireMarketingContactApiKey } from '../middleware/apiKey';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.post('/requests', requireMarketingContactApiKey, validateRequest({ body: schemas.marketingContactCreate }), createContactRequest);

export default router;
