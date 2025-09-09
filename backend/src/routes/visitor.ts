import { Router } from 'express';
import * as VisitorController from '../controllers/visitor';
// import { requireAuth, requireGuard } from '../middleware/auth';

const router = Router();

router.post('/visitor-passes', VisitorController.createVisitorPass);
router.get('/visitor-passes', VisitorController.getVisitorPasses);
router.get('/visitor-passes/pending', VisitorController.getPendingVisitorPasses);
router.patch('/visitor-passes/:id/approve', VisitorController.approveVisitorPass);
router.patch('/visitor-passes/:id/reject', VisitorController.rejectVisitorPass);
router.post('/entry-logs', VisitorController.createEntryLog);

export default router;
