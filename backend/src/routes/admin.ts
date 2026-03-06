
import express from 'express';
import { requireAuth, requireAdmin, requireSuperAdmin, requirePermission } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';
import * as adminController from '../controllers/admin';
import * as notificationsController from '../controllers/notifications';
import * as onboardingController from '../controllers/onboarding';
import * as systemSettingsController from '../controllers/systemSettings';
import * as communitiesAdminController from '../controllers/adminCommunities';
import * as unitsAdminController from '../controllers/adminUnits';
import * as profilesAdminController from '../controllers/adminProfiles';
import * as messagesAdminController from '../controllers/adminMessages';
import * as adminNotificationsController from '../controllers/adminNotifications';
import * as complaintController from '../controllers/complaint';
import * as paymentController from '../controllers/payment';
import * as adminPaymentGatewayController from '../controllers/adminPaymentGateway';
import * as adminSecureSettingsController from '../controllers/adminSecureSettings';
import * as adminTenantConfigurationsController from '../controllers/adminTenantConfigurations';
import * as adminCapabilitiesController from '../controllers/adminCapabilities';
import * as adminGuardsOperationsController from '../controllers/adminGuardsOperations';
import * as adminAgenciesOperationsController from '../controllers/adminAgenciesOperations';

const router = express.Router();

// Unread notifications count for dashboard
router.get('/notifications/unread-count', requireAuth, requirePermission('read:all_profiles'), notificationsController.getUnreadNotificationsCount);

// Admin capability contract for frontend menu filtering
router.get('/me/capabilities', requireAuth, requireAdmin, adminCapabilitiesController.getAdminCapabilities);

// Admin dashboard analytics
router.get(
  '/analytics',
  requireAuth,
  requirePermission('read:analytics'),
  validateRequest({ query: schemas.adminAnalyticsQuery }),
  adminController.getAnalytics
);

// User management routes
router.get(
  '/users',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminUsersListQuery }),
  adminController.getAllUsers
);
router.post(
  '/users',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminCreateUser }),
  adminController.createUser
);
router.post(
  '/invites',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminInviteUser }),
  adminController.inviteUser
);
router.get(
  '/users/:id',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ params: schemas.idParam }),
  adminController.getUserById
);
router.put(
  '/users/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminUpdateUserBody }),
  adminController.updateUser
);
router.delete(
  '/users/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminController.deleteUser
);
router.post(
  '/users/bulk-update',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ body: schemas.adminBulkUpdateUsers }),
  adminController.bulkUpdateUsers
);

// Admin onboarding requests
router.get(
  '/onboarding-requests',
  requireAuth,
  requirePermission('manage:users'),
  validateRequest({ query: schemas.onboardingListQuery }),
  onboardingController.listOnboardingRequests
);
router.patch(
  '/onboarding-requests/:id',
  requireAuth,
  requirePermission('manage:users'),
  validateRequest({ params: schemas.onboardingUpdateParams, body: schemas.onboardingUpdateBody }),
  onboardingController.updateOnboardingRequest
);

// Communities management (admin writes)
router.get(
  '/communities',
  requireAuth,
  requireAdmin,
  communitiesAdminController.listCommunities
);
router.post(
  '/communities',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.adminCommunityCreate }),
  communitiesAdminController.createCommunity
);
router.put(
  '/communities/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminCommunityUpdate }),
  communitiesAdminController.updateCommunity
);
router.delete(
  '/communities/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  communitiesAdminController.deleteCommunity
);

// Units management (admin writes)
router.post(
  '/units',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.adminUnitCreate }),
  unitsAdminController.createUnit
);
router.put(
  '/units/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminUnitUpdate }),
  unitsAdminController.updateUnit
);
router.delete(
  '/units/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  unitsAdminController.deleteUnit
);

// Profiles management (admin-only direct profile CRUD)
router.post(
  '/profiles',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminProfileCreate }),
  profilesAdminController.createProfile
);
router.put(
  '/profiles/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminProfileUpdate }),
  profilesAdminController.updateProfile
);
router.delete(
  '/profiles/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  profilesAdminController.deleteProfile
);

// Complaints (admin writes)
router.post(
  '/complaints',
  requireAuth,
  requirePermission('create:complaints'),
  validateRequest({ body: schemas.complaintCreate }),
  complaintController.createComplaint
);
router.patch(
  '/complaints/:id',
  requireAuth,
  requirePermission('update:complaints'),
  validateRequest({ params: schemas.idParam, body: schemas.complaintUpdate }),
  complaintController.updateComplaint
);
router.delete(
  '/complaints/:id',
  requireAuth,
  requirePermission('delete:complaints'),
  validateRequest({ params: schemas.idParam }),
  complaintController.deleteComplaint
);

// Messages (admin writes)
router.post(
  '/messages',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.adminMessageCreate }),
  messagesAdminController.createMessage
);
router.patch(
  '/messages/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminMessageUpdate }),
  messagesAdminController.updateMessage
);
router.delete(
  '/messages/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  messagesAdminController.deleteMessage
);

// Payments (admin writes)
router.post(
  '/payments',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.paymentCreate }),
  paymentController.createPayment
);
router.put(
  '/payments/:id',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.paymentUpdate }),
  paymentController.updatePayment
);
router.delete(
  '/payments/:id',
  requireAuth,
  requirePermission('delete:payments'),
  validateRequest({ params: schemas.idParam }),
  paymentController.deletePayment
);

// Notification campaigns (admin writes)
router.post(
  '/notification-campaigns',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ body: schemas.adminNotificationCreate }),
  adminNotificationsController.createNotificationCampaign
);
router.put(
  '/notification-campaigns/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam, body: schemas.adminNotificationUpdate }),
  adminNotificationsController.updateNotificationCampaign
);
router.delete(
  '/notification-campaigns/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminNotificationsController.deleteNotificationCampaign
);

// Guard operational routes (People -> Guards)
router.post(
  '/guards/profiles',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminGuardProfileCreate }),
  adminGuardsOperationsController.createGuardProfile
);
router.get(
  '/guards/profiles',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminGuardOperationsQuery }),
  adminGuardsOperationsController.listGuardProfiles
);
router.delete(
  '/guards/profiles/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminGuardsOperationsController.deleteGuardProfile
);
router.get(
  '/guards/schedules',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminGuardOperationsQuery }),
  adminGuardsOperationsController.listGuardSchedules
);
router.post(
  '/guards/schedules',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminGuardScheduleCreate }),
  adminGuardsOperationsController.createGuardSchedule
);
router.patch(
  '/guards/schedules/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminGuardScheduleUpdate }),
  adminGuardsOperationsController.updateGuardSchedule
);
router.delete(
  '/guards/schedules/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminGuardsOperationsController.deleteGuardSchedule
);
router.get(
  '/guards/assignments',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminGuardOperationsQuery }),
  adminGuardsOperationsController.listGuardAssignments
);
router.post(
  '/guards/assignments',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminGuardAssignmentCreate }),
  adminGuardsOperationsController.createGuardAssignment
);
router.patch(
  '/guards/assignments/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminGuardAssignmentUpdate }),
  adminGuardsOperationsController.updateGuardAssignment
);
router.delete(
  '/guards/assignments/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminGuardsOperationsController.deleteGuardAssignment
);
router.get(
  '/guards/equipment',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminGuardOperationsQuery }),
  adminGuardsOperationsController.listGuardEquipment
);
router.post(
  '/guards/equipment',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminGuardEquipmentCreate }),
  adminGuardsOperationsController.createGuardEquipment
);
router.patch(
  '/guards/equipment/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminGuardEquipmentUpdate }),
  adminGuardsOperationsController.updateGuardEquipment
);
router.delete(
  '/guards/equipment/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminGuardsOperationsController.deleteGuardEquipment
);
router.get(
  '/guards/performance',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminGuardOperationsQuery }),
  adminGuardsOperationsController.listGuardPerformance
);
router.post(
  '/guards/performance',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminGuardPerformanceCreate }),
  adminGuardsOperationsController.createGuardPerformance
);
router.patch(
  '/guards/performance/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminGuardPerformanceUpdate }),
  adminGuardsOperationsController.updateGuardPerformance
);
router.get(
  '/guards/training',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminGuardOperationsQuery }),
  adminGuardsOperationsController.listGuardTraining
);
router.post(
  '/guards/training',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminGuardTrainingCreate }),
  adminGuardsOperationsController.createGuardTraining
);
router.patch(
  '/guards/training/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminGuardTrainingUpdate }),
  adminGuardsOperationsController.updateGuardTraining
);

// Agency operational routes (People -> Agency)
router.get(
  '/agencies/directory',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminAgencyOperationsQuery }),
  adminAgenciesOperationsController.listAgencyDirectory
);
router.delete(
  '/agencies/directory/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminAgenciesOperationsController.deleteAgencyDirectory
);
router.get(
  '/agencies/profiles',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminAgencyOperationsQuery }),
  adminAgenciesOperationsController.listAgencyProfiles
);
router.get(
  '/agencies/staff',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminAgencyOperationsQuery }),
  adminAgenciesOperationsController.listAgencyStaff
);
router.post(
  '/agencies/staff',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminAgencyStaffCreate }),
  adminAgenciesOperationsController.createAgencyStaff
);
router.patch(
  '/agencies/staff/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminAgencyStaffUpdate }),
  adminAgenciesOperationsController.updateAgencyStaff
);
router.delete(
  '/agencies/staff/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminAgenciesOperationsController.deleteAgencyStaff
);
router.get(
  '/agencies/services',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminAgencyOperationsQuery }),
  adminAgenciesOperationsController.listAgencyServices
);
router.post(
  '/agencies/services',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminAgencyServiceCreate }),
  adminAgenciesOperationsController.createAgencyService
);
router.patch(
  '/agencies/services/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminAgencyServiceUpdate }),
  adminAgenciesOperationsController.updateAgencyService
);
router.delete(
  '/agencies/services/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminAgenciesOperationsController.deleteAgencyService
);
router.get(
  '/agencies/finance',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminAgencyOperationsQuery }),
  adminAgenciesOperationsController.listAgencyFinance
);
router.post(
  '/agencies/finance',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminAgencyFinanceCreate }),
  adminAgenciesOperationsController.createAgencyFinance
);
router.patch(
  '/agencies/finance/:id',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminAgencyFinanceUpdate }),
  adminAgenciesOperationsController.updateAgencyFinance
);
router.get(
  '/agencies/documents',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminAgencyOperationsQuery }),
  adminAgenciesOperationsController.listAgencyDocuments
);
router.post(
  '/agencies/documents',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminAgencyDocumentCreate }),
  adminAgenciesOperationsController.createAgencyDocument
);
router.patch(
  '/agencies/documents/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminAgencyDocumentUpdate }),
  adminAgenciesOperationsController.updateAgencyDocument
);
router.delete(
  '/agencies/documents/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  adminAgenciesOperationsController.deleteAgencyDocument
);

// Society management routes
router.get('/societies', requireAuth, requireAdmin, adminController.getAllSocieties);
router.post(
  '/societies',
  requireAuth,
  requireSuperAdmin,
  validateRequest({ body: schemas.adminSocietyCreate }),
  adminController.createSociety
);
router.put(
  '/societies/:id',
  requireAuth,
  requireSuperAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminSocietyUpdate }),
  adminController.updateSociety
);
router.delete(
  '/societies/:id',
  requireAuth,
  requireSuperAdmin,
  validateRequest({ params: schemas.idParam }),
  adminController.deleteSociety
);

// Maintenance management routes
router.get('/maintenance/stats', requireAuth, requirePermission('read:all_maintenance_requests'), adminController.getMaintenanceStats);
router.put(
  '/maintenance/bulk-update',
  requireAuth,
  requirePermission('update:maintenance_requests'),
  validateRequest({ body: schemas.adminBulkUpdateMaintenance }),
  adminController.bulkUpdateMaintenanceRequests
);

// Complaint management routes
router.get('/complaints/stats', requireAuth, requirePermission('read:all_complaints'), adminController.getComplaintStats);
router.put(
  '/complaints/bulk-update',
  requireAuth,
  requirePermission('update:complaints'),
  validateRequest({ body: schemas.adminBulkUpdateComplaints }),
  adminController.bulkUpdateComplaints
);

// Payment management routes
router.get('/payments/stats', requireAuth, requirePermission('read:all_payments'), adminController.getPaymentStats);
router.get(
  '/payments/transactions',
  requireAuth,
  requirePermission('read:all_payments'),
  paymentController.listAdminTransactions
);
router.get(
  '/payments/transactions/:id',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ params: schemas.idParam }),
  paymentController.getAdminTransaction
);
router.get(
  '/payments/obligations',
  requireAuth,
  requirePermission('read:all_payments'),
  paymentController.listAdminObligations
);
router.get(
  '/payments/statements',
  requireAuth,
  requirePermission('read:all_payments'),
  paymentController.listAdminStatements
);
router.get(
  '/payment-charges/catalog',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPaymentChargeCatalogQuery }),
  paymentController.listAdminPaymentChargeCatalog
);
router.get(
  '/payment-charges/templates',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPaymentChargeTemplateListQuery }),
  paymentController.listAdminPaymentChargeTemplates
);
router.post(
  '/payment-charges/templates',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminPaymentChargeTemplateCreate }),
  paymentController.createAdminPaymentChargeTemplate
);
router.patch(
  '/payment-charges/templates/:id',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminPaymentChargeTemplateUpdate }),
  paymentController.updateAdminPaymentChargeTemplate
);
router.post(
  '/payment-charges/templates/:id/preview',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminPaymentChargeTemplatePreviewBody }),
  paymentController.previewAdminPaymentChargeTemplate
);
router.post(
  '/payment-charges/templates/:id/issue',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminPaymentChargeTemplatePreviewBody }),
  paymentController.issueAdminPaymentChargeTemplate
);
router.get(
  '/payment-charges/runs',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPaymentChargeRunListQuery }),
  paymentController.listAdminPaymentChargeRuns
);
router.get(
  '/payment-charges/runs/:id',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ params: schemas.idParam }),
  paymentController.getAdminPaymentChargeRunDetails
);
router.post(
  '/payment-charges/run-due',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminPaymentChargeRunDueBody }),
  paymentController.runDueAdminPaymentCharges
);
router.get(
  '/payouts/summary',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPayoutScopeQuery }),
  paymentController.getAdminPayoutSummaryHandler
);
router.get(
  '/payouts/transactions',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPayoutScopeQuery }),
  paymentController.listAdminPayoutTransactionsHandler
);
router.get(
  '/payouts/destinations',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPayoutScopeQuery }),
  paymentController.listAdminPayoutDestinationsHandler
);
router.post(
  '/payouts/destinations',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminPayoutDestinationCreate }),
  paymentController.createAdminPayoutDestinationHandler
);
router.patch(
  '/payouts/destinations/:id',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminPayoutDestinationUpdate }),
  paymentController.updateAdminPayoutDestinationHandler
);
router.get(
  '/payouts/rules',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPayoutScopeQuery }),
  paymentController.listAdminPayoutRulesHandler
);
router.post(
  '/payouts/rules',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ body: schemas.adminPayoutRuleUpsert }),
  paymentController.upsertAdminPayoutRuleHandler
);
router.get(
  '/payouts/requests',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPayoutScopeQuery }),
  paymentController.listAdminPayoutRequestsHandler
);
router.post(
  '/payouts/requests',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminPayoutRequestCreate }),
  paymentController.createAdminPayoutRequestHandler
);
router.post(
  '/payouts/requests/:id/:action',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.adminPayoutRequestActionParams, body: schemas.adminPayoutRequestActionBody }),
  paymentController.updateAdminPayoutRequestStatusHandler
);
router.post(
  '/payments/generate',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminGeneratePayments }),
  adminController.generatePayments
);
router.put(
  '/payments/bulk-update',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ body: schemas.adminBulkUpdatePayments }),
  adminController.bulkUpdatePayments
);

// Notice management routes
router.post(
  '/notices/bulk-create',
  requireAuth,
  requirePermission('create:notices'),
  validateRequest({ body: schemas.adminBulkCreateNotices }),
  adminController.bulkCreateNotices
);

// Settings routes (superadmin only)
router.get('/settings', requireAuth, requirePermission('manage:settings'), adminController.getSettings);
router.get(
  '/settings/smtp',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getSmtpSettings
);
router.put(
  '/settings/smtp',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminSmtpSettingsUpdate }),
  adminSecureSettingsController.updateSmtpSettings
);
router.post(
  '/settings/smtp/test',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminSmtpSettingsTest }),
  adminSecureSettingsController.testSmtpSettings
);
router.get(
  '/settings/integrations',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getIntegrationSettings
);
router.put(
  '/settings/integrations',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminIntegrationSettingsUpdate }),
  adminSecureSettingsController.updateIntegrationSettings
);
router.post(
  '/settings/integrations/test',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminIntegrationSettingsTest }),
  adminSecureSettingsController.testIntegrationSettings
);
router.get(
  '/settings/business',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getBusinessSettings
);
router.put(
  '/settings/business',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminBusinessSettingsUpdate }),
  adminSecureSettingsController.updateBusinessSettings
);
router.get(
  '/settings/regional',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getRegionalSettings
);
router.put(
  '/settings/regional',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminRegionalSettingsUpdate }),
  adminSecureSettingsController.updateRegionalSettings
);
router.get(
  '/settings/security-privacy',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getSecurityPrivacySettings
);
router.put(
  '/settings/security-privacy',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminSecurityPrivacySettingsUpdate }),
  adminSecureSettingsController.updateSecurityPrivacySettings
);
router.get(
  '/settings/general-system',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getGeneralSystemSettings
);
router.put(
  '/settings/general-system',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminGeneralSystemSettingsUpdate }),
  adminSecureSettingsController.updateGeneralSystemSettings
);
router.get(
  '/settings/push',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getPushSettings
);
router.put(
  '/settings/push',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminPushSettingsUpdate }),
  adminSecureSettingsController.updatePushSettings
);
router.post(
  '/settings/push/test',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminPushSettingsTest }),
  adminSecureSettingsController.testPushSettings
);
router.get(
  '/settings/sms',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getSmsSettings
);
router.put(
  '/settings/sms',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminSmsSettingsUpdate }),
  adminSecureSettingsController.updateSmsSettings
);
router.post(
  '/settings/sms/test',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminSmsSettingsTest }),
  adminSecureSettingsController.testSmsSettings
);
router.get(
  '/settings/payment-gateways',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getPaymentGatewaySettings
);
router.put(
  '/settings/payment-gateways',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminPaymentGatewaySettingsUpdate }),
  adminSecureSettingsController.updatePaymentGatewaySettings
);
router.get(
  '/settings/payment-methods',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getPaymentMethodSettings
);
router.put(
  '/settings/payment-methods',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminPaymentMethodSettingsUpdate }),
  adminSecureSettingsController.updatePaymentMethodSettings
);
router.get(
  '/settings/payment-fees',
  requireAuth,
  requirePermission('manage:settings'),
  adminSecureSettingsController.getPaymentFeeSettings
);
router.put(
  '/settings/payment-fees',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminPaymentFeeSettingsUpdate }),
  adminSecureSettingsController.updatePaymentFeeSettings
);
router.get(
  '/settings/community-configurations',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ query: schemas.adminCommunityConfigurationsQuery }),
  adminTenantConfigurationsController.listCommunityConfigurations
);
router.put(
  '/settings/community-configurations/:id',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({
    params: schemas.adminConfigurationIdParam,
    body: schemas.adminCommunityConfigurationUpdate,
  }),
  adminTenantConfigurationsController.updateCommunityConfiguration
);
router.get(
  '/settings/agency-configurations',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ query: schemas.adminAgencyConfigurationsQuery }),
  adminTenantConfigurationsController.listAgencyConfigurations
);
router.get(
  '/settings/agency-configurations/stats',
  requireAuth,
  requirePermission('manage:settings'),
  adminTenantConfigurationsController.getAgencyConfigurationStats
);
router.post(
  '/settings/agency-configurations',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminAgencyConfigurationCreate }),
  adminTenantConfigurationsController.createAgencyConfiguration
);
router.put(
  '/settings/agency-configurations/:id',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({
    params: schemas.adminConfigurationIdParam,
    body: schemas.adminAgencyConfigurationUpdate,
  }),
  adminTenantConfigurationsController.updateAgencyConfiguration
);
router.delete(
  '/settings/agency-configurations/:id',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ params: schemas.adminConfigurationIdParam }),
  adminTenantConfigurationsController.deleteAgencyConfiguration
);
router.put(
  '/settings',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminSettingsUpdate }),
  adminController.updateSettings
);
router.delete(
  '/settings/:key',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ params: schemas.adminDeleteSettingParams }),
  adminController.deleteSetting
);
router.get(
  '/payment-gateways/expresspay/config',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ query: schemas.adminExpressPayConfigQuery }),
  adminPaymentGatewayController.getExpressPayGatewayConfig
);
router.put(
  '/payment-gateways/expresspay/config',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminExpressPayConfigUpsert }),
  adminPaymentGatewayController.updateExpressPayGatewayConfig
);
router.post(
  '/payment-gateways/expresspay/test',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.adminExpressPayConfigTest }),
  adminPaymentGatewayController.testExpressPayGatewayConfig
);
router.get(
  '/system-settings',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ query: schemas.systemSettingsQuery }),
  systemSettingsController.getSystemSettings
);
router.get(
  '/system-settings/exists',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ query: schemas.systemSettingsExistsQuery }),
  systemSettingsController.systemSettingsExists
);
router.put(
  '/system-settings',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ body: schemas.systemSettingsUpsert }),
  systemSettingsController.upsertSystemSettings
);
router.delete(
  '/system-settings/:key',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ params: schemas.systemSettingsDeleteParams, query: schemas.systemSettingsDeleteQuery }),
  systemSettingsController.deleteSystemSetting
);

// Role management (superadmin only)
router.get('/roles', requireAuth, requirePermission('manage:roles'), adminController.getRoles);
router.put(
  '/roles/:role/permissions',
  requireAuth,
  requirePermission('manage:roles'),
  validateRequest({ params: schemas.roleParams, body: schemas.rolePermissions }),
  adminController.updateRolePermissions
);
router.delete(
  '/roles/:role',
  requireAuth,
  requirePermission('manage:roles'),
  validateRequest({ params: schemas.roleParams }),
  adminController.deleteRole
);

export default router;
