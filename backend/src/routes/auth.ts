import { Router } from 'express';
import * as AuthController from '../controllers/auth';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

// Register
router.post('/register', validateRequest({ body: schemas.authRegister }), AuthController.register);
// Login
router.post('/login', validateRequest({ body: schemas.authLogin }), AuthController.login);
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
