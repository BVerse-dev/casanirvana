
import express from 'express';
import { requireAuth, requireAdmin, requireSuperAdmin, requirePermission } from '../middleware/auth';
import * as adminController from '../controllers/admin';
import * as notificationsController from '../controllers/notifications';

const router = express.Router();

// Unread notifications count for dashboard
router.get('/notifications/unread-count', requireAuth, requirePermission('read:all_profiles'), notificationsController.getUnreadNotificationsCount);

// Admin dashboard analytics
router.get('/analytics', requireAuth, requirePermission('read:analytics'), adminController.getAnalytics);

// User management routes
router.get('/users', requireAuth, requirePermission('read:all_profiles'), adminController.getAllUsers);
router.post('/users', requireAuth, requirePermission('create:profiles'), adminController.createUser);
router.get('/users/:id', requireAuth, requirePermission('read:all_profiles'), adminController.getUserById);
router.put('/users/:id', requireAuth, requirePermission('update:all_profiles'), adminController.updateUser);
router.delete('/users/:id', requireAuth, requirePermission('delete:profiles'), adminController.deleteUser);
router.post('/users/bulk-update', requireAuth, requirePermission('update:all_profiles'), adminController.bulkUpdateUsers);

// Society management routes
router.get('/societies', requireAuth, requireAdmin, adminController.getAllSocieties);
router.post('/societies', requireAuth, requireSuperAdmin, adminController.createSociety);
router.put('/societies/:id', requireAuth, requireSuperAdmin, adminController.updateSociety);
router.delete('/societies/:id', requireAuth, requireSuperAdmin, adminController.deleteSociety);

// Maintenance management routes
router.get('/maintenance/stats', requireAuth, requirePermission('read:all_maintenance_requests'), adminController.getMaintenanceStats);
router.put('/maintenance/bulk-update', requireAuth, requirePermission('update:maintenance_requests'), adminController.bulkUpdateMaintenanceRequests);

// Complaint management routes
router.get('/complaints/stats', requireAuth, requirePermission('read:all_complaints'), adminController.getComplaintStats);
router.put('/complaints/bulk-update', requireAuth, requirePermission('update:complaints'), adminController.bulkUpdateComplaints);

// Payment management routes
router.get('/payments/stats', requireAuth, requirePermission('read:all_payments'), adminController.getPaymentStats);
router.post('/payments/generate', requireAuth, requirePermission('create:payments'), adminController.generatePayments);
router.put('/payments/bulk-update', requireAuth, requirePermission('update:payments'), adminController.bulkUpdatePayments);

// Notice management routes
router.post('/notices/bulk-create', requireAuth, requirePermission('create:notices'), adminController.bulkCreateNotices);

// Settings routes (superadmin only)
router.get('/settings', requireAuth, requirePermission('manage:settings'), adminController.getSettings);
router.put('/settings', requireAuth, requirePermission('manage:settings'), adminController.updateSettings);

// Role management (superadmin only)
router.get('/roles', requireAuth, requirePermission('manage:roles'), adminController.getRoles);
router.put('/roles/:role/permissions', requireAuth, requirePermission('manage:roles'), adminController.updateRolePermissions);

export default router;
