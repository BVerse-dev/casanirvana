
import express from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin, requireSuperAdmin, requirePermission } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { schemas } from '../validation/schemas';
import * as adminController from '../controllers/admin';
import * as adminDashboardController from '../controllers/adminDashboard';
import * as notificationsController from '../controllers/notifications';
import * as onboardingController from '../controllers/onboarding';
import * as systemSettingsController from '../controllers/systemSettings';
import * as communitiesAdminController from '../controllers/adminCommunities';
import * as joinRequestsAdminController from '../controllers/adminJoinRequests';
import * as unitsAdminController from '../controllers/adminUnits';
import * as residentsAdminController from '../controllers/adminResidents';
import * as visitorsAdminController from '../controllers/adminVisitors';
import * as maintenanceRequestsAdminController from '../controllers/adminMaintenanceRequests';
import * as complaintsAdminController from '../controllers/adminComplaints';
import * as inquiriesAdminController from '../controllers/adminInquiries';
import * as amenitiesAdminController from '../controllers/adminAmenities';
import * as servicesAdminController from '../controllers/adminServices';
import * as profilesAdminController from '../controllers/adminProfiles';
import * as messagesAdminController from '../controllers/adminMessages';
import * as messagesReadModelsAdminController from '../controllers/adminMessagesReadModels';
import * as adminNotificationsController from '../controllers/adminNotifications';
import * as adminNoticesController from '../controllers/adminNotices';
import * as adminMarketplaceController from '../controllers/adminMarketplace';
import * as paymentController from '../controllers/payment';
import * as adminPaymentGatewayController from '../controllers/adminPaymentGateway';
import * as adminSecureSettingsController from '../controllers/adminSecureSettings';
import * as adminTenantConfigurationsController from '../controllers/adminTenantConfigurations';
import * as adminCapabilitiesController from '../controllers/adminCapabilities';
import * as adminGuardsOperationsController from '../controllers/adminGuardsOperations';
import * as adminAgenciesOperationsController from '../controllers/adminAgenciesOperations';
import * as adminEmailsController from '../controllers/adminEmails';
import * as adminEmergencyAlertsController from '../controllers/adminEmergencyAlerts';
import * as adminSettingsAssetsController from '../controllers/adminSettingsAssets';

const router = express.Router();
const settingsAssetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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
router.get(
  '/dashboard/analytics',
  requireAuth,
  requirePermission('read:analytics'),
  validateRequest({ query: schemas.adminAnalyticsDashboardQuery }),
  adminDashboardController.getAnalyticsDashboard
);
router.get(
  '/dashboard/residents',
  requireAuth,
  requirePermission('read:analytics'),
  validateRequest({ query: schemas.adminResidentDashboardQuery }),
  adminDashboardController.getResidentDashboard
);
router.get(
  '/dashboard/guards',
  requireAuth,
  requirePermission('read:analytics'),
  validateRequest({ query: schemas.adminGuardDashboardQuery }),
  adminDashboardController.getGuardDashboard
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
  validateRequest({ query: schemas.adminCommunityListQuery }),
  communitiesAdminController.listCommunities
);
router.get(
  '/communities/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  communitiesAdminController.getCommunity
);
router.get(
  '/communities/:id/management',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  communitiesAdminController.getCommunityManagementData
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
router.put(
  '/communities/:id/directory-members',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminCommunityDirectoryUpsert }),
  communitiesAdminController.upsertCommunityDirectoryMember
);

// Units management
router.get(
  '/units',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.adminUnitListQuery }),
  unitsAdminController.listUnits
);
router.get(
  '/units/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  unitsAdminController.getUnit
);
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

// Community join requests
router.get(
  '/join-requests',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.adminJoinRequestListQuery }),
  joinRequestsAdminController.listJoinRequests
);
router.patch(
  '/join-requests/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminJoinRequestUpdate }),
  joinRequestsAdminController.updateJoinRequest
);

// Profiles management (admin-only direct profile CRUD)
router.get(
  '/residents',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminResidentListQuery }),
  residentsAdminController.listResidents
);
router.get(
  '/residents/:id',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ params: schemas.idParam }),
  residentsAdminController.getResident
);
router.get(
  '/residents/:id/activity',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ params: schemas.idParam }),
  residentsAdminController.getResidentActivity
);
router.get(
  '/residents/:id/directory',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ params: schemas.idParam }),
  residentsAdminController.getResidentDirectory
);
router.post(
  '/residents',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminResidentCreate }),
  residentsAdminController.createResident
);
router.put(
  '/residents/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminResidentUpdate }),
  residentsAdminController.updateResident
);
router.delete(
  '/residents/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  residentsAdminController.deleteResident
);

router.get(
  '/visitor-passes',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ query: schemas.adminVisitorPassListQuery }),
  visitorsAdminController.listVisitorPasses
);
router.get(
  '/visitor-passes/:id',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ params: schemas.idParam }),
  visitorsAdminController.getVisitorPass
);
router.post(
  '/visitor-passes',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminVisitorPassCreate }),
  visitorsAdminController.createVisitorPass
);
router.patch(
  '/visitor-passes/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminVisitorPassUpdate }),
  visitorsAdminController.updateVisitorPass
);
router.delete(
  '/visitor-passes/:id',
  requireAuth,
  requirePermission('delete:profiles'),
  validateRequest({ params: schemas.idParam }),
  visitorsAdminController.deleteVisitorPass
);

router.get(
  '/maintenance-requests',
  requireAuth,
  requirePermission('read:all_maintenance_requests'),
  validateRequest({ query: schemas.adminMaintenanceRequestListQuery }),
  maintenanceRequestsAdminController.listMaintenanceRequests
);
router.get(
  '/maintenance-requests/:id',
  requireAuth,
  requirePermission('read:all_maintenance_requests'),
  validateRequest({ params: schemas.maintenanceRequestIdParam }),
  maintenanceRequestsAdminController.getMaintenanceRequest
);
router.patch(
  '/maintenance-requests/:id',
  requireAuth,
  requirePermission('update:maintenance_requests'),
  validateRequest({ params: schemas.maintenanceRequestIdParam, body: schemas.adminMaintenanceRequestUpdate }),
  maintenanceRequestsAdminController.updateMaintenanceRequest
);
router.delete(
  '/maintenance-requests/:id',
  requireAuth,
  requirePermission('update:maintenance_requests'),
  validateRequest({ params: schemas.maintenanceRequestIdParam }),
  maintenanceRequestsAdminController.deleteMaintenanceRequest
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

// Complaints
router.get(
  '/complaints/stats',
  requireAuth,
  requirePermission('read:all_complaints'),
  complaintsAdminController.getComplaintStats
);
router.get(
  '/complaints',
  requireAuth,
  requirePermission('read:all_complaints'),
  validateRequest({ query: schemas.adminComplaintListQuery }),
  complaintsAdminController.listComplaints
);
router.get(
  '/complaints/:id',
  requireAuth,
  requirePermission('read:all_complaints'),
  validateRequest({ params: schemas.idParam }),
  complaintsAdminController.getComplaint
);
router.get(
  '/complaints/:id/comments',
  requireAuth,
  requirePermission('read:all_complaints'),
  validateRequest({ params: schemas.idParam }),
  complaintsAdminController.listComplaintComments
);
router.post(
  '/complaints',
  requireAuth,
  requirePermission('create:complaints'),
  validateRequest({ body: schemas.complaintCreate }),
  complaintsAdminController.createComplaint
);
router.post(
  '/complaints/:id/comments',
  requireAuth,
  requirePermission('update:complaints'),
  validateRequest({ params: schemas.idParam, body: schemas.adminComplaintCommentCreate }),
  complaintsAdminController.createComplaintComment
);
router.patch(
  '/complaints/:id',
  requireAuth,
  requirePermission('update:complaints'),
  validateRequest({ params: schemas.idParam, body: schemas.adminComplaintUpdate }),
  complaintsAdminController.updateComplaint
);
router.delete(
  '/complaints/:id',
  requireAuth,
  requirePermission('delete:complaints'),
  validateRequest({ params: schemas.idParam }),
  complaintsAdminController.deleteComplaint
);

// Help desk inquiries
router.get(
  '/inquiries',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.adminInquiryListQuery }),
  inquiriesAdminController.listInquiries
);
router.get(
  '/inquiries/assignable-admins',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.adminInquiryAssignableAdminsQuery }),
  inquiriesAdminController.listAssignableInquiryAdmins
);
router.get(
  '/inquiries/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  inquiriesAdminController.getInquiry
);
router.patch(
  '/inquiries/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminInquiryUpdate }),
  inquiriesAdminController.updateInquiry
);

// Amenities management
router.get(
  '/amenities',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.adminAmenityListQuery }),
  amenitiesAdminController.listAmenities
);
router.get(
  '/amenities/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  amenitiesAdminController.getAmenity
);
router.post(
  '/amenities',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.adminAmenityCreate }),
  amenitiesAdminController.createAmenity
);
router.put(
  '/amenities/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminAmenityUpdate }),
  amenitiesAdminController.updateAmenity
);
router.delete(
  '/amenities/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  amenitiesAdminController.deleteAmenity
);

// Amenity bookings management
router.get(
  '/amenity-bookings',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.adminAmenityBookingListQuery }),
  amenitiesAdminController.listAmenityBookings
);
router.get(
  '/amenity-bookings/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  amenitiesAdminController.getAmenityBooking
);
router.post(
  '/amenity-bookings',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.adminAmenityBookingCreate }),
  amenitiesAdminController.createAmenityBooking
);
router.patch(
  '/amenity-bookings/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminAmenityBookingUpdate }),
  amenitiesAdminController.updateAmenityBooking
);
router.delete(
  '/amenity-bookings/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  amenitiesAdminController.deleteAmenityBooking
);

// Services management
router.get(
  '/services',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.adminServiceListQuery }),
  servicesAdminController.listServices
);
router.get(
  '/services/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.serviceIdParam }),
  servicesAdminController.getService
);
router.post(
  '/services',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.adminServiceCreate }),
  servicesAdminController.createService
);
router.put(
  '/services/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.serviceIdParam, body: schemas.adminServiceUpdate }),
  servicesAdminController.updateService
);
router.delete(
  '/services/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.serviceIdParam }),
  servicesAdminController.deleteService
);

// Service requests management
router.get(
  '/service-requests',
  requireAuth,
  requireAdmin,
  validateRequest({ query: schemas.adminServiceRequestListQuery }),
  servicesAdminController.listServiceRequests
);
router.get(
  '/service-requests/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.uuidParam }),
  servicesAdminController.getServiceRequest
);
router.patch(
  '/service-requests/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.uuidParam, body: schemas.adminServiceRequestUpdate }),
  servicesAdminController.updateServiceRequest
);

// Messages (admin writes)
router.get(
  '/messages/stats',
  requireAuth,
  requireAdmin,
  messagesReadModelsAdminController.getMessageStats
);
router.get(
  '/messages/contacts',
  requireAuth,
  requireAdmin,
  messagesReadModelsAdminController.listMessageContacts
);
router.get(
  '/messages/contacts/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  messagesReadModelsAdminController.getMessageContact
);
router.get(
  '/messages/conversations/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  messagesReadModelsAdminController.getMessageConversation
);
router.get(
  '/messages/groups',
  requireAuth,
  requireAdmin,
  messagesReadModelsAdminController.listMessageGroups
);
router.post(
  '/messages/groups',
  requireAuth,
  requireAdmin,
  validateRequest({ body: schemas.adminMessageGroupCreate }),
  messagesReadModelsAdminController.createMessageGroup
);
router.get(
  '/messages/groups/:id',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  messagesReadModelsAdminController.getMessageGroup
);
router.get(
  '/messages/groups/:id/messages',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam }),
  messagesReadModelsAdminController.listMessageGroupMessages
);
router.post(
  '/messages/groups/:id/messages',
  requireAuth,
  requireAdmin,
  validateRequest({ params: schemas.idParam, body: schemas.adminMessageGroupMessageCreate }),
  messagesReadModelsAdminController.createMessageGroupMessage
);
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
router.get(
  '/notices',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ query: schemas.adminNoticesListQuery }),
  adminNoticesController.listNotices
);
router.get(
  '/notices/:id',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminNoticesController.getNotice
);
router.post(
  '/notices',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ body: schemas.adminNoticeCreate }),
  adminNoticesController.createNotice
);
router.patch(
  '/notices/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam, body: schemas.adminNoticeUpdate }),
  adminNoticesController.updateNotice
);
router.delete(
  '/notices/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminNoticesController.deleteNotice
);
router.get(
  '/notices/:id/comments',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminNoticesController.listNoticeComments
);
router.post(
  '/notices/:id/comments',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam, body: schemas.adminNoticeCommentCreate }),
  adminNoticesController.createNoticeComment
);

// Notification campaigns (admin writes)
router.get(
  '/notifications/dashboard',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ query: schemas.adminNotificationDashboardQuery }),
  adminNotificationsController.getNotificationDashboard
);
router.get(
  '/notifications/analytics',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ query: schemas.adminNotificationAnalyticsQuery }),
  adminNotificationsController.getNotificationAnalytics
);
router.get(
  '/notification-campaigns',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ query: schemas.adminNotificationCampaignListQuery }),
  adminNotificationsController.listNotificationCampaigns
);
router.get(
  '/notification-campaigns/:id',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminNotificationsController.getNotificationCampaign
);
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
router.get(
  '/notification-templates',
  requireAuth,
  requirePermission('read:all_notifications'),
  adminNotificationsController.listNotificationTemplates
);
router.get(
  '/notification-templates/:id',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminNotificationsController.getNotificationTemplate
);
router.post(
  '/notification-templates',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ body: schemas.adminNotificationTemplateCreate }),
  adminNotificationsController.createNotificationTemplate
);
router.put(
  '/notification-templates/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam, body: schemas.adminNotificationTemplateUpdate }),
  adminNotificationsController.updateNotificationTemplate
);
router.delete(
  '/notification-templates/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminNotificationsController.deleteNotificationTemplate
);

// Email Management (admin operations)
router.get(
  '/emails/contacts',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ query: schemas.adminEmailsContactsQuery }),
  adminEmailsController.listEmailContacts
);
router.get(
  '/emails',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ query: schemas.adminEmailsListQuery }),
  adminEmailsController.listEmails
);
router.get(
  '/emails/:id',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminEmailsController.getEmail
);
router.post(
  '/emails',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ body: schemas.adminEmailCreate }),
  adminEmailsController.createEmail
);
router.patch(
  '/emails/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam, body: schemas.adminEmailUpdate }),
  adminEmailsController.updateEmail
);

// Emergency Alerts (admin operations)
router.get(
  '/emergency-alerts',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ query: schemas.adminEmergencyAlertsListQuery }),
  adminEmergencyAlertsController.listEmergencyAlerts
);
router.get(
  '/emergency-alerts/:id',
  requireAuth,
  requirePermission('read:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminEmergencyAlertsController.getEmergencyAlert
);
router.post(
  '/emergency-alerts',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ body: schemas.adminEmergencyAlertCreate }),
  adminEmergencyAlertsController.createEmergencyAlert
);
router.patch(
  '/emergency-alerts/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam, body: schemas.adminEmergencyAlertUpdate }),
  adminEmergencyAlertsController.updateEmergencyAlert
);
router.delete(
  '/emergency-alerts/:id',
  requireAuth,
  requirePermission('write:all_notifications'),
  validateRequest({ params: schemas.idParam }),
  adminEmergencyAlertsController.deleteEmergencyAlert
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
router.get(
  '/agencies/directory/:id/summary',
  requireAuth,
  requirePermission('read:all_profiles'),
  validateRequest({ params: schemas.idParam }),
  adminAgenciesOperationsController.getAgencyDirectorySummary
);
router.post(
  '/agencies/directory',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminAgencyDirectoryCreate }),
  adminAgenciesOperationsController.createAgencyDirectory
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
router.post(
  '/agencies/profiles',
  requireAuth,
  requirePermission('create:profiles'),
  validateRequest({ body: schemas.adminAgencyProfileCreate }),
  adminAgenciesOperationsController.createAgencyProfile
);
router.patch(
  '/agencies/profiles/:id',
  requireAuth,
  requirePermission('update:all_profiles'),
  validateRequest({ params: schemas.idParam, body: schemas.adminAgencyProfileUpdate }),
  adminAgenciesOperationsController.updateAgencyProfile
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
  '/personal-hub/dashboard',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPersonalHubDashboardQuery }),
  paymentController.getAdminPersonalHubDashboard
);
router.get(
  '/personal-hub/catalog/providers',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPersonalHubCatalogProvidersQuery }),
  paymentController.listAdminPersonalHubCatalogProviders
);
router.patch(
  '/personal-hub/catalog/providers/:id',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({
    params: schemas.adminPersonalHubCatalogProviderUpdateParams,
    body: schemas.adminPersonalHubCatalogProviderUpdate,
  }),
  paymentController.updateAdminPersonalHubCatalogProvider
);
router.get(
  '/personal-hub/catalog/packages',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPersonalHubCatalogPackagesQuery }),
  paymentController.listAdminPersonalHubCatalogPackages
);
router.post(
  '/personal-hub/catalog/sync',
  requireAuth,
  requirePermission('update:payments'),
  paymentController.syncAdminPersonalHubCatalog
);
router.get(
  '/personal-hub/reports',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPersonalHubReportsQuery }),
  paymentController.getAdminPersonalHubReports
);
router.get(
  '/personal-hub/marketplace/workspace',
  requireAuth,
  requirePermission('read:all_payments'),
  adminMarketplaceController.getMarketplaceWorkspace
);
router.post(
  '/personal-hub/marketplace/categories',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminMarketplaceCategoryCreate }),
  adminMarketplaceController.createMarketplaceCategory
);
router.patch(
  '/personal-hub/marketplace/categories/:id',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminMarketplaceCategoryUpdate }),
  adminMarketplaceController.updateMarketplaceCategory
);
router.post(
  '/personal-hub/marketplace/products',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminMarketplaceProductCreate }),
  adminMarketplaceController.createMarketplaceProduct
);
router.patch(
  '/personal-hub/marketplace/products/:id',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminMarketplaceProductUpdate }),
  adminMarketplaceController.updateMarketplaceProduct
);
router.post(
  '/personal-hub/marketplace/vendors',
  requireAuth,
  requirePermission('create:payments'),
  validateRequest({ body: schemas.adminMarketplaceVendorCreate }),
  adminMarketplaceController.createMarketplaceVendor
);
router.patch(
  '/personal-hub/marketplace/vendors/:id',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminMarketplaceVendorUpdate }),
  adminMarketplaceController.updateMarketplaceVendor
);
router.patch(
  '/personal-hub/marketplace/orders/:id/status',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminMarketplaceOrderStatusUpdate }),
  adminMarketplaceController.updateMarketplaceOrderStatus
);
router.patch(
  '/personal-hub/marketplace/reviews/:id/visibility',
  requireAuth,
  requirePermission('update:payments'),
  validateRequest({ params: schemas.idParam, body: schemas.adminMarketplaceReviewVisibilityUpdate }),
  adminMarketplaceController.updateMarketplaceReviewVisibility
);
router.get(
  '/payments/transactions',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPaymentTransactionsQuery }),
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
  validateRequest({ query: schemas.adminPaymentObligationsQuery }),
  paymentController.listAdminObligations
);
router.get(
  '/payments/statements',
  requireAuth,
  requirePermission('read:all_payments'),
  validateRequest({ query: schemas.adminPaymentStatementsQuery }),
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
router.post(
  '/system-settings/assets/:assetType',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({ params: schemas.adminSettingsAssetParams }),
  settingsAssetUpload.single('file'),
  adminSettingsAssetsController.uploadSettingsAsset
);
router.delete(
  '/system-settings/assets/:assetType',
  requireAuth,
  requirePermission('manage:settings'),
  validateRequest({
    params: schemas.adminSettingsAssetParams,
    body: schemas.adminSettingsAssetDelete,
  }),
  adminSettingsAssetsController.deleteSettingsAsset
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
