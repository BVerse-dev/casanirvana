'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useEmailNotificationSettings, { EmailNotificationSettings } from '@/hooks/useEmailNotificationSettings';

// Form validation schema
const notificationSettingsSchema = yup.object({
  // User Notifications
  user_welcome_email: yup.boolean().default(true),
  user_password_reset_email: yup.boolean().default(true),
  user_profile_update_email: yup.boolean().default(false),
  user_payment_confirmation_email: yup.boolean().default(true),
  user_maintenance_status_email: yup.boolean().default(true),
  user_visitor_approval_email: yup.boolean().default(true),
  user_emergency_alert_email: yup.boolean().default(true),
  user_amenity_booking_email: yup.boolean().default(true),
  user_service_request_email: yup.boolean().default(true),

  // Admin Notifications
  admin_new_user_registration: yup.boolean().default(true),
  admin_new_complaint: yup.boolean().default(true),
  admin_new_maintenance_request: yup.boolean().default(true),
  admin_payment_received: yup.boolean().default(true),
  admin_visitor_request: yup.boolean().default(false),
  admin_emergency_alert: yup.boolean().default(true),
  admin_system_errors: yup.boolean().default(true),
  admin_new_amenity_booking: yup.boolean().default(false),
  admin_new_service_request: yup.boolean().default(true),

  // Community Notifications
  community_monthly_report: yup.boolean().default(true),
  community_payment_reminders: yup.boolean().default(true),
  community_maintenance_updates: yup.boolean().default(true),
  community_visitor_summary: yup.boolean().default(false),
  community_amenity_summary: yup.boolean().default(false),
  community_financial_summary: yup.boolean().default(true),

  // Security Notifications
  security_visitor_alerts: yup.boolean().default(true),
  security_emergency_alerts: yup.boolean().default(true),
  security_suspicious_activity: yup.boolean().default(true),
  security_access_violations: yup.boolean().default(true),

  // Notification Frequency
  digest_frequency: yup.string().required('Digest frequency is required').default('daily'),
  reminder_frequency: yup.string().required('Reminder frequency is required').default('weekly'),
  emergency_alert_delay: yup.string().required('Emergency alert delay is required').default('immediate'),
  
  // Email Limits & Throttling
  daily_email_limit: yup.number().min(1).max(1000).required('Daily limit is required').default(500),
  hourly_email_limit: yup.number().min(1).max(100).required('Hourly limit is required').default(50),
  bulk_email_batch_size: yup.number().min(10).max(500).required('Batch size is required').default(100),
  
  // Advanced Settings
  enable_email_tracking: yup.boolean().default(true),
  enable_bounce_handling: yup.boolean().default(true),
  enable_unsubscribe_link: yup.boolean().default(true),
  auto_retry_failed_emails: yup.boolean().default(true),
  notification_time_zone: yup.string().required('Time zone is required').default('Asia/Kolkata'),
  quiet_hours_start: yup.string().default('22:00'),
  quiet_hours_end: yup.string().default('07:00'),
});

interface NotificationSettingsFormData extends EmailNotificationSettings {}

const EmailNotificationsPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Use the email notification settings hook
  const { 
    emailNotificationSettings,
    isLoadingData,
    loadError,
    updateSettings,
    isUpdating
  } = useEmailNotificationSettings();

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<NotificationSettingsFormData>({
    resolver: yupResolver(notificationSettingsSchema),
    defaultValues: {
      // User Notifications
      user_welcome_email: true,
      user_password_reset_email: true,
      user_profile_update_email: false,
      user_payment_confirmation_email: true,
      user_maintenance_status_email: true,
      user_visitor_approval_email: true,
      user_emergency_alert_email: true,
      user_amenity_booking_email: true,
      user_service_request_email: true,

      // Admin Notifications
      admin_new_user_registration: true,
      admin_new_complaint: true,
      admin_new_maintenance_request: true,
      admin_payment_received: true,
      admin_visitor_request: false,
      admin_emergency_alert: true,
      admin_system_errors: true,
      admin_new_amenity_booking: false,
      admin_new_service_request: true,

      // Community Notifications
      community_monthly_report: true,
      community_payment_reminders: true,
      community_maintenance_updates: true,
      community_visitor_summary: false,
      community_amenity_summary: false,
      community_financial_summary: true,

      // Security Notifications
      security_visitor_alerts: true,
      security_emergency_alerts: true,
      security_suspicious_activity: true,
      security_access_violations: true,

      // Notification Frequency
      digest_frequency: 'daily',
      reminder_frequency: 'weekly',
      emergency_alert_delay: 'immediate',
      
      // Email Limits & Throttling
      daily_email_limit: 500,
      hourly_email_limit: 50,
      bulk_email_batch_size: 100,
      
      // Advanced Settings
      enable_email_tracking: true,
      enable_bounce_handling: true,
      enable_unsubscribe_link: true,
      auto_retry_failed_emails: true,
      notification_time_zone: 'Africa/Accra',
      quiet_hours_start: '22:00',
      quiet_hours_end: '07:00',
    },
  });

  // Update form when settings data loads
  useEffect(() => {
    if (emailNotificationSettings) {
      reset(emailNotificationSettings);
    }
  }, [emailNotificationSettings, reset]);

  const onSubmit = async (data: NotificationSettingsFormData) => {
    updateSettings(data, {
      onSuccess: () => {
        setShowAlert({ type: 'success', message: 'Email notification settings updated successfully!' });
        setTimeout(() => setShowAlert(null), 5000);
      },
      onError: (error: any) => {
        console.error('Error updating notification settings:', error);
        setShowAlert({ type: 'danger', message: 'Failed to update notification settings. Please try again.' });
        setTimeout(() => setShowAlert(null), 5000);
      }
    });
  };

  // Show loading state
  if (isLoadingData) {
    return (
      <>
        <PageTitle subName="Email Settings" title="Email Notifications" />
        <div className="d-flex justify-content-center py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading email notification settings...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <>
        <PageTitle subName="Email Settings" title="Email Notifications" />
        <Alert variant="danger">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Failed to load email notification settings. Please refresh the page to try again.
        </Alert>
      </>
    );
  }

  const CheckboxSwitch = ({ name, label, description }: { name: keyof NotificationSettingsFormData; label: string; description: string }) => (
    <div className="form-check form-switch mb-3">
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <input
            className="form-check-input"
            type="checkbox"
            id={name}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
        )}
      />
      <label className="form-check-label" htmlFor={name}>
        {label}
      </label>
      <small className="form-text text-muted d-block">
        {description}
      </small>
    </div>
  );

  return (
    <>
      <PageTitle subName="Email Settings" title="Email Notifications" />

      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          <IconifyIcon 
            icon={showAlert.type === 'success' ? 'ri:check-line' : 'ri:error-warning-line'} 
            className="me-2" 
          />
          {showAlert.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultActiveKey="user-notifications" className="mb-3">
          
          {/* User Notifications Tab */}
          <Tab eventKey="user-notifications" title="User Notifications">
            <Row>
              <Col xl={12}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:user-line" className="me-2" />
                      User Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="user_welcome_email"
                          label="Welcome Email"
                          description="Send welcome email to new users"
                        />
                        <CheckboxSwitch
                          name="user_password_reset_email"
                          label="Password Reset Email"
                          description="Send email for password reset requests"
                        />
                        <CheckboxSwitch
                          name="user_profile_update_email"
                          label="Profile Update Email"
                          description="Send email when user updates profile"
                        />
                        <CheckboxSwitch
                          name="user_payment_confirmation_email"
                          label="Payment Confirmation Email"
                          description="Send email for successful payments"
                        />
                        <CheckboxSwitch
                          name="user_maintenance_status_email"
                          label="Maintenance Status Email"
                          description="Send updates on maintenance requests"
                        />
                      </Col>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="user_visitor_approval_email"
                          label="Visitor Approval Email"
                          description="Send notifications for visitor approvals"
                        />
                        <CheckboxSwitch
                          name="user_emergency_alert_email"
                          label="Emergency Alert Email"
                          description="Send emergency notifications to users"
                        />
                        <CheckboxSwitch
                          name="user_amenity_booking_email"
                          label="Amenity Booking Email"
                          description="Send confirmations for amenity bookings"
                        />
                        <CheckboxSwitch
                          name="user_service_request_email"
                          label="Service Request Email"
                          description="Send updates on service requests"
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Admin Notifications Tab */}
          <Tab eventKey="admin-notifications" title="Admin Notifications">
            <Row>
              <Col xl={12}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:admin-line" className="me-2" />
                      Admin Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="admin_new_user_registration"
                          label="New User Registration"
                          description="Notify when new users register"
                        />
                        <CheckboxSwitch
                          name="admin_new_complaint"
                          label="New Complaint"
                          description="Notify when new complaints are filed"
                        />
                        <CheckboxSwitch
                          name="admin_new_maintenance_request"
                          label="New Maintenance Request"
                          description="Notify when new maintenance requests are created"
                        />
                        <CheckboxSwitch
                          name="admin_payment_received"
                          label="Payment Received"
                          description="Notify when payments are received"
                        />
                        <CheckboxSwitch
                          name="admin_visitor_request"
                          label="Visitor Request"
                          description="Notify when visitor requests are made"
                        />
                      </Col>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="admin_emergency_alert"
                          label="Emergency Alert"
                          description="Notify admin of emergency situations"
                        />
                        <CheckboxSwitch
                          name="admin_system_errors"
                          label="System Errors"
                          description="Notify about system errors and issues"
                        />
                        <CheckboxSwitch
                          name="admin_new_amenity_booking"
                          label="New Amenity Booking"
                          description="Notify when amenities are booked"
                        />
                        <CheckboxSwitch
                          name="admin_new_service_request"
                          label="New Service Request"
                          description="Notify when service requests are created"
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Community Notifications Tab */}
          <Tab eventKey="community-notifications" title="Community Notifications">
            <Row>
              <Col xl={12}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:building-line" className="me-2" />
                      Community Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="community_monthly_report"
                          label="Monthly Report"
                          description="Send monthly community reports"
                        />
                        <CheckboxSwitch
                          name="community_payment_reminders"
                          label="Payment Reminders"
                          description="Send payment reminder notifications"
                        />
                        <CheckboxSwitch
                          name="community_maintenance_updates"
                          label="Maintenance Updates"
                          description="Send maintenance status updates"
                        />
                      </Col>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="community_visitor_summary"
                          label="Visitor Summary"
                          description="Send visitor activity summaries"
                        />
                        <CheckboxSwitch
                          name="community_amenity_summary"
                          label="Amenity Summary"
                          description="Send amenity usage summaries"
                        />
                        <CheckboxSwitch
                          name="community_financial_summary"
                          label="Financial Summary"
                          description="Send financial reports and summaries"
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Security Notifications Tab */}
          <Tab eventKey="security-notifications" title="Security Notifications">
            <Row>
              <Col xl={12}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:shield-line" className="me-2" />
                      Security Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="security_visitor_alerts"
                          label="Visitor Alerts"
                          description="Send alerts for visitor activities"
                        />
                        <CheckboxSwitch
                          name="security_emergency_alerts"
                          label="Emergency Alerts"
                          description="Send emergency security alerts"
                        />
                      </Col>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="security_suspicious_activity"
                          label="Suspicious Activity"
                          description="Send alerts for suspicious activities"
                        />
                        <CheckboxSwitch
                          name="security_access_violations"
                          label="Access Violations"
                          description="Send alerts for access violations"
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Settings Tab */}
          <Tab eventKey="settings" title="Settings">
            <Row>
              <Col xl={12}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:settings-line" className="me-2" />
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col lg={6}>
                        <SelectFormInput
                          control={control}
                          name="digest_frequency"
                          label="Digest Frequency"
                          placeholder="Select frequency"
                          options={[
                            { value: 'immediate', label: 'Immediate' },
                            { value: 'hourly', label: 'Hourly' },
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'monthly', label: 'Monthly' },
                          ]}
                        />

                        <SelectFormInput
                          control={control}
                          name="reminder_frequency"
                          label="Reminder Frequency"
                          placeholder="Select frequency"
                          options={[
                            { value: 'none', label: 'No Reminders' },
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'monthly', label: 'Monthly' },
                          ]}
                        />

                        <SelectFormInput
                          control={control}
                          name="emergency_alert_delay"
                          label="Emergency Alert Delay"
                          placeholder="Select delay"
                          options={[
                            { value: 'immediate', label: 'Immediate' },
                            { value: '5min', label: '5 Minutes' },
                            { value: '15min', label: '15 Minutes' },
                            { value: '30min', label: '30 Minutes' },
                          ]}
                        />

                        <SelectFormInput
                          control={control}
                          name="notification_time_zone"
                          label="Time Zone"
                          placeholder="Select time zone"
                          options={[
                            { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                            { value: 'UTC', label: 'UTC' },
                            { value: 'America/New_York', label: 'America/New_York (EST)' },
                            { value: 'Europe/London', label: 'Europe/London (GMT)' },
                          ]}
                        />
                      </Col>
                      <Col lg={6}>
                        <TextFormInput
                          control={control}
                          name="daily_email_limit"
                          label="Daily Email Limit"
                          placeholder="500"
                          type="number"
                        />

                        <TextFormInput
                          control={control}
                          name="hourly_email_limit"
                          label="Hourly Email Limit"
                          placeholder="50"
                          type="number"
                        />

                        <TextFormInput
                          control={control}
                          name="bulk_email_batch_size"
                          label="Bulk Email Batch Size"
                          placeholder="100"
                          type="number"
                        />

                        <TextFormInput
                          control={control}
                          name="quiet_hours_start"
                          label="Quiet Hours Start"
                          placeholder="22:00"
                          type="time"
                        />

                        <TextFormInput
                          control={control}
                          name="quiet_hours_end"
                          label="Quiet Hours End"
                          placeholder="07:00"
                          type="time"
                        />
                      </Col>
                    </Row>

                    <hr className="my-4" />

                    <h5 className="mb-3">
                      <IconifyIcon icon="ri:toggle-line" className="me-2" />
                      Advanced Options
                    </h5>
                    <Row>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="enable_email_tracking"
                          label="Email Tracking"
                          description="Track email opens and clicks"
                        />
                        <CheckboxSwitch
                          name="enable_bounce_handling"
                          label="Bounce Handling"
                          description="Automatically handle bounced emails"
                        />
                      </Col>
                      <Col lg={6}>
                        <CheckboxSwitch
                          name="enable_unsubscribe_link"
                          label="Unsubscribe Link"
                          description="Include unsubscribe links in emails"
                        />
                        <CheckboxSwitch
                          name="auto_retry_failed_emails"
                          label="Auto Retry Failed Emails"
                          description="Automatically retry failed email deliveries"
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>

        <Row>
          <Col xl={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="light" 
                    onClick={() => reset(emailNotificationSettings)}
                    disabled={isUpdating}
                  >
                    <IconifyIcon icon="ri:refresh-line" className="me-1" />
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={!isDirty || isUpdating}
                  >
                    {isUpdating && (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    )}
                    <IconifyIcon icon="ri:save-line" className="me-1" />
                    Save Settings
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </form>
    </>
  );
};

export default EmailNotificationsPage;
