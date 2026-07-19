import { Router } from 'express';
import * as accountController from '../controllers/account';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

router.post(
  '/delete',
  validateRequest({ body: schemas.accountDelete }),
  accountController.deleteAccount
);

router.post(
  '/deactivate',
  validateRequest({ body: schemas.accountDeactivate }),
  accountController.deactivateAccount
);

router.get(
  '/backup/status',
  accountController.getBackupStatus
);

router.post(
  '/backup/export',
  accountController.exportBackup
);

router.post(
  '/backup/restore',
  validateRequest({ body: schemas.accountBackupRestore }),
  accountController.restoreBackup
);

router.post(
  '/backup/cleanup',
  validateRequest({ body: schemas.accountBackupCleanup }),
  accountController.cleanupBackups
);

router.get(
  '/app-updates/status',
  validateRequest({ query: schemas.accountAppUpdateStatusQuery }),
  accountController.getAppUpdateStatus
);

export default router;
