import { Router } from 'express';
import * as AuthController from '../controllers/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', AuthController.register);
// Login
router.post('/login', AuthController.login);
// Me (profile)
router.get('/me', async (req, res, next) => {
  try {
    // First run authentication middleware
    await requireAuth(req, res, next);
    // Then call the controller
    await AuthController.me(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
