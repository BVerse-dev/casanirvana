import { Router } from 'express';
import * as ComplaintController from '../controllers/complaint';
// import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/complaints', ComplaintController.getComplaints);
router.post('/complaints', ComplaintController.createComplaint);
router.patch('/complaints/:id', ComplaintController.updateComplaint);

export default router;
