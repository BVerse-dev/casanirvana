'use client';

import React, { useEffect } from 'react';
import { Row, Col, Card, CardHeader, CardBody, Alert, Badge, Form, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import PasswordFormInput from '@/components/from/PasswordFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import usePushNotificationSettings, { PushNotificationSettings } from '@/hooks/usePushNotificationSettings';

const schema = yup.object({
  // Firebase Configuration
  firebase_enabled: yup.boolean().required(),
  firebase_server_key: yup.string().required(),
  firebase_sender_id: yup.string().required(),
  firebase_api_key: yup.string().required(),
  firebase_project_id: yup.string().required(),

  // Push Notification Types
  push_maintenance_requests: yup.boolean().required(),
  push_payment_reminders: yup.boolean().required(),
  push_visitor_approvals: yup.boolean().required(),
  push_emergency_alerts: yup.boolean().required(),
  push_community_announcements: yup.boolean().required(),
  push_complaint_updates: yup.boolean().required(),
  push_amenity_bookings: yup.boolean().required(),
  push_service_updates: yup.boolean().required(),

  // Admin Push Notifications
  admin_push_new_users: yup.boolean().required(),
  admin_push_new_complaints: yup.boolean().required(),
  admin_push_maintenance_requests: yup.boolean().required(),
  admin_push_payment_received: yup.boolean().required(),
  admin_push_emergency_alerts: yup.boolean().required(),

  // Push Settings
  push_sound_enabled: yup.boolean().required(),
  push_vibration_enabled: yup.boolean().required(),
  push_badge_enabled: yup.boolean().required(),
  push_quiet_hours_enabled: yup.boolean().required(),
  push_quiet_start_time: yup.string().required(),
  push_quiet_end_time: yup.string().required(),

  // Message Customization
  default_push_title: yup.string().required(),
  default_push_message: yup.string().required(),
  push_click_action: yup.string().required(),
});

const PushNotificationsPage = () => {
  const {
    pushNotificationSettings,
    isLoadingData,
    isUpdating,
    loadError,
    updateError,
    updateSuccess,
    updateSettings,
  } = usePushNotificationSettings();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PushNotificationSettings>({
    resolver: yupResolver(schema),
  });

  // Reset form when settings are loaded
  useEffect(() => {
    if (pushNotificationSettings) {
      reset(pushNotificationSettings);
    }
  }, [pushNotificationSettings, reset]);

  const firebaseEnabled = watch('firebase_enabled');
  const quietHoursEnabled = watch('push_quiet_hours_enabled');

  const onSubmit = async (data: PushNotificationSettings) => {
    updateSettings(data);
  };

  const testPushNotification = () => {
    // Mock test push notification functionality
    alert('Test push notification sent!');
  };

  if (isLoadingData) {
    return (
      <>
        <PageTitle subName="Notification Setup" title="Push Notification Setup" />
        <Alert variant="info">
          <IconifyIcon icon="solar:loading-line-duotone" className="fs-18 me-2" />
          Loading push notification setup...
        </Alert>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <PageTitle subName="Notification Setup" title="Push Notification Setup" />
        <Alert variant="danger">
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error loading push notification setup: {loadError.message}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Notification Setup" title="Push Notification Setup" />

      {updateSuccess && (
        <Alert variant="success" dismissible>
          <IconifyIcon icon="solar:check-circle-line-duotone" className="fs-18 me-2" />
          Push notification setup updated successfully!
        </Alert>
      )}

      {updateError && (
        <Alert variant="danger" dismissible>
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error updating push notification setup: {updateError.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          {/* Firebase Configuration */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="ri-firebase-line me-2"></i>
                    Firebase Configuration
                  </h5>
                  <Badge bg={firebaseEnabled ? 'success' : 'secondary'}>
                    {firebaseEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="firebase_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="firebase_enabled"
                        label="Enable Firebase Push Notifications"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {firebaseEnabled && (
                  <>
                    <PasswordFormInput
                      name="firebase_server_key"
                      label="Server Key"
                      placeholder="AAAAxxxxxxxxxx:APA91bHxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="firebase_sender_id"
                      label="Sender ID"
                      placeholder="123456789012"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <PasswordFormInput
                      name="firebase_api_key"
                      label="API Key"
                      placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="firebase_project_id"
                      label="Project ID"
                      placeholder="casa-nirvana-app"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={testPushNotification}
                    >
                      <i className="ri-notification-3-line me-1"></i>
                      Send Test Notification
                    </button>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Push Settings */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-settings-3-line me-2"></i>
                  Push Settings
                </h5>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_sound_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_sound_enabled"
                        label="Enable Sound"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                  <small className="text-muted">Play notification sound</small>
                </div>

                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_vibration_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_vibration_enabled"
                        label="Enable Vibration"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                  <small className="text-muted">Vibrate device on notification</small>
                </div>

                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_badge_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_badge_enabled"
                        label="Enable Badge Count"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                  <small className="text-muted">Show unread count on app icon</small>
                </div>

                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_quiet_hours_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_quiet_hours_enabled"
                        label="Enable Quiet Hours"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                  <small className="text-muted">Disable notifications during specific hours</small>
                </div>

                {quietHoursEnabled && (
                  <Row>
                    <Col md={6}>
                      <TextFormInput
                        name="push_quiet_start_time"
                        label="Start Time"
                        type="time"
                        control={control}
                        containerClassName="mb-3"
                      />
                    </Col>
                    <Col md={6}>
                      <TextFormInput
                        name="push_quiet_end_time"
                        label="End Time"
                        type="time"
                        control={control}
                        containerClassName="mb-3"
                      />
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* User Push Notifications */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-user-line me-2"></i>
                  User Push Notifications
                </h5>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_maintenance_requests"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_maintenance_requests"
                        label="Maintenance Request Updates"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_payment_reminders"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_payment_reminders"
                        label="Payment Reminders"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_visitor_approvals"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_visitor_approvals"
                        label="Visitor Approvals"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_emergency_alerts"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_emergency_alerts"
                        label="Emergency Alerts"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_community_announcements"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_community_announcements"
                        label="Community Announcements"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_complaint_updates"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_complaint_updates"
                        label="Complaint Updates"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="push_amenity_bookings"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_amenity_bookings"
                        label="Amenity Booking Confirmations"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-0">
                  <Controller
                    name="push_service_updates"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="push_service_updates"
                        label="Service Request Updates"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Admin Push Notifications */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-admin-line me-2"></i>
                  Admin Push Notifications
                </h5>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="admin_push_new_users"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="admin_push_new_users"
                        label="New User Registrations"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="admin_push_new_complaints"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="admin_push_new_complaints"
                        label="New Complaints"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="admin_push_maintenance_requests"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="admin_push_maintenance_requests"
                        label="New Maintenance Requests"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="admin_push_payment_received"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="admin_push_payment_received"
                        label="Payment Received"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
                <div className="form-check form-switch mb-0">
                  <Controller
                    name="admin_push_emergency_alerts"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="admin_push_emergency_alerts"
                        label="Emergency Alerts"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Message Customization */}
          <Col lg={12}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-message-3-line me-2"></i>
                  Message Customization
                </h5>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={4}>
                    <TextFormInput
                      name="default_push_title"
                      label="Default Title"
                      placeholder="Casa Nirvana"
                      control={control}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={4}>
                    <TextFormInput
                      name="default_push_message"
                      label="Default Message"
                      placeholder="You have a new notification"
                      control={control}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={4}>
                    <TextFormInput
                      name="push_click_action"
                      label="Click Action"
                      placeholder="FLUTTER_NOTIFICATION_CLICK"
                      control={control}
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>

                <Alert variant="info" className="mb-3">
                  <i className="ri-information-line me-2"></i>
                  <strong>Firebase Setup:</strong> You&apos;ll need to configure Firebase Cloud Messaging (FCM) 
                  in your Firebase project and download the configuration files for your mobile app.
                </Alert>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => reset()}
                    disabled={isUpdating}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Push Settings'
                    )}
                  </button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </form>
    </>
  );
};

export default PushNotificationsPage;
