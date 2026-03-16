'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Form, Tab, Tabs } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useEmailNotificationSettingsAdvanced, { EmailNotificationSettingsAdvanced } from '@/hooks/useEmailNotificationSettingsAdvanced';

// Form validation schema
const emailNotificationSchema = yup.object({
  // Email Delivery Settings
  email_enabled: yup.boolean().required(),
  email_rate_limit_per_hour: yup.number().min(1).max(1000).required('Rate limit is required'),
  email_batch_size: yup.number().min(1).max(100).required('Batch size is required'),
  email_retry_attempts: yup.number().min(0).max(10).required('Retry attempts is required'),
  email_queue_enabled: yup.boolean().required(),
  email_priority_enabled: yup.boolean().required(),
  
  // Email Content Settings
  default_sender_name: yup.string().required('Sender name is required'),
  default_sender_email: yup.string().email('Invalid email').required('Sender email is required'),
  reply_to_email: yup.string().email('Invalid email').required('Reply-to email is required'),
  email_signature: yup.string(),
  email_footer: yup.string(),
  email_header_logo_url: yup.string().url('Invalid URL'),
  email_branding_enabled: yup.boolean().required(),
  email_tracking_enabled: yup.boolean().required(),
  
  // Email Notification Types
  email_welcome_new_users: yup.boolean().required(),
  email_password_reset: yup.boolean().required(),
  email_account_verification: yup.boolean().required(),
  email_maintenance_requests: yup.boolean().required(),
  email_payment_confirmations: yup.boolean().required(),
  email_payment_reminders: yup.boolean().required(),
  email_visitor_approvals: yup.boolean().required(),
  email_emergency_alerts: yup.boolean().required(),
  email_community_announcements: yup.boolean().required(),
  email_complaint_updates: yup.boolean().required(),
  email_amenity_bookings: yup.boolean().required(),
  email_service_updates: yup.boolean().required(),
  
  // Admin Email Notifications
  admin_email_new_registrations: yup.boolean().required(),
  admin_email_new_complaints: yup.boolean().required(),
  admin_email_maintenance_requests: yup.boolean().required(),
  admin_email_payment_received: yup.boolean().required(),
  admin_email_failed_payments: yup.boolean().required(),
  admin_email_emergency_alerts: yup.boolean().required(),
  admin_email_system_errors: yup.boolean().required(),
  admin_email_daily_summary: yup.boolean().required(),
  
  // Email Scheduling & Delivery
  email_quiet_hours_enabled: yup.boolean().required(),
  email_quiet_start_time: yup.string().required(),
  email_quiet_end_time: yup.string().required(),
  email_digest_enabled: yup.boolean().required(),
  email_digest_frequency: yup.string().required(),
  email_unsubscribe_enabled: yup.boolean().required(),
  
  // Email Security & Compliance
  email_encryption_enabled: yup.boolean().required(),
  email_dkim_enabled: yup.boolean().required(),
  email_spf_enabled: yup.boolean().required(),
  email_bounce_handling: yup.boolean().required(),
  email_complaint_handling: yup.boolean().required(),
});

const EmailNotificationSettingsPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Use the email notification settings hook
  const {
    emailSettings,
    isLoadingData,
    loadError,
    updateSettingsAsync,
    isUpdating,
    updateError,
    updateSuccess,
  } = useEmailNotificationSettingsAdvanced();

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<EmailNotificationSettingsAdvanced>({
    resolver: yupResolver(emailNotificationSchema),
    defaultValues: {
      // Email Delivery Settings
      email_enabled: true,
      email_rate_limit_per_hour: 100,
      email_batch_size: 50,
      email_retry_attempts: 3,
      email_queue_enabled: true,
      email_priority_enabled: false,
      
      // Email Content Settings
      default_sender_name: 'Casa Nirvana',
      default_sender_email: 'noreply@casanirvana.com',
      reply_to_email: 'support@casanirvana.com',
      email_signature: 'Best regards,\nCasa Nirvana Team',
      email_footer: 'Casa Nirvana - Complete Community Management System\nThis is an automated email, please do not reply.',
      email_header_logo_url: '',
      email_branding_enabled: true,
      email_tracking_enabled: true,
      
      // Email Notification Types
      email_welcome_new_users: true,
      email_password_reset: true,
      email_account_verification: true,
      email_maintenance_requests: true,
      email_payment_confirmations: true,
      email_payment_reminders: true,
      email_visitor_approvals: true,
      email_emergency_alerts: true,
      email_community_announcements: true,
      email_complaint_updates: true,
      email_amenity_bookings: false,
      email_service_updates: true,
      
      // Admin Email Notifications
      admin_email_new_registrations: true,
      admin_email_new_complaints: true,
      admin_email_maintenance_requests: true,
      admin_email_payment_received: false,
      admin_email_failed_payments: true,
      admin_email_emergency_alerts: true,
      admin_email_system_errors: true,
      admin_email_daily_summary: false,
      
      // Email Scheduling & Delivery
      email_quiet_hours_enabled: false,
      email_quiet_start_time: '22:00',
      email_quiet_end_time: '08:00',
      email_digest_enabled: false,
      email_digest_frequency: 'daily',
      email_unsubscribe_enabled: true,
      
      // Email Security & Compliance
      email_encryption_enabled: true,
      email_dkim_enabled: false,
      email_spf_enabled: false,
      email_bounce_handling: true,
      email_complaint_handling: true,
    },
  });

  // Reset form when settings are loaded
  useEffect(() => {
    if (emailSettings) {
      reset(emailSettings);
    }
  }, [emailSettings, reset]);

  // Handle success/error states
  useEffect(() => {
    if (updateSuccess) {
      setShowAlert({ type: 'success', message: 'Email notification setup updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (updateError) {
      setShowAlert({ type: 'danger', message: updateError.message || 'Failed to update email notification setup. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  }, [updateError]);

  const onSubmit = async (data: EmailNotificationSettingsAdvanced) => {
    try {
      setShowAlert(null);
      await updateSettingsAsync(data);
    } catch (error) {
      console.error('Error submitting email notification settings:', error);
      setShowAlert({
        type: 'danger',
        message: error instanceof Error ? error.message : 'Failed to update email notification setup',
      });
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <>
        <PageTitle subName="Notification Setup" title="Email Notification Setup" />
        <Alert variant="info">
          <IconifyIcon icon="solar:loading-line-duotone" className="fs-18 me-2" />
          Loading email notification setup...
        </Alert>
      </>
    );
  }

  // Error state
  if (loadError) {
    return (
      <>
        <PageTitle subName="Notification Setup" title="Email Notification Setup" />
        <Alert variant="danger">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Failed to load email notification setup: {loadError.message}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Notification Setup" title="Email Notification Setup" />

      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          <IconifyIcon 
            icon={showAlert.type === 'success' ? 'ri:check-line' : 'ri:error-warning-line'} 
            className="me-2" 
          />
          {showAlert.message}
        </Alert>
      )}

      <Alert variant="info">
        <IconifyIcon icon="ri:information-line" className="me-2" />
        This page controls queueing, delivery limits, and email-notification policy. SMTP transport lives on SMTP Configuration, and reusable message bodies belong on Email Templates.
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultActiveKey="delivery" className="mb-4">
          {/* Email Delivery Settings Tab */}
          <Tab eventKey="delivery" title="Delivery Settings">
            <Row>
              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:mail-send-line" className="me-2" />
                      Email Delivery Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_enabled"
                            label="Enable Email Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <small className="text-muted">Master switch for all email notifications</small>
                    </div>

                    <TextFormInput
                      control={control}
                      name="email_rate_limit_per_hour"
                      type="number"
                      label="Rate Limit (per hour)"
                      placeholder="100"
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      control={control}
                      name="email_batch_size"
                      type="number"
                      label="Batch Size"
                      placeholder="50"
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      control={control}
                      name="email_retry_attempts"
                      type="number"
                      label="Retry Attempts"
                      placeholder="3"
                      containerClassName="mb-3"
                    />
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                      Advanced Settings
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_queue_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_queue_enabled"
                            label="Email Queue"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <small className="text-muted">Queue emails for batch processing</small>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_priority_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_priority_enabled"
                            label="Priority Queue"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <small className="text-muted">Enable priority-based email delivery</small>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_tracking_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_tracking_enabled"
                            label="Email Tracking"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <small className="text-muted">Track email opens and clicks</small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Email Content Settings Tab */}
          <Tab eventKey="content" title="Content Settings">
            <Row>
              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:user-line" className="me-2" />
                      Sender Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <TextFormInput
                      control={control}
                      name="default_sender_name"
                      label="Default Sender Name"
                      placeholder="Casa Nirvana"
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      control={control}
                      name="default_sender_email"
                      type="email"
                      label="Default Sender Email"
                      placeholder="noreply@casanirvana.com"
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      control={control}
                      name="reply_to_email"
                      type="email"
                      label="Reply-To Email"
                      placeholder="support@casanirvana.com"
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      control={control}
                      name="email_header_logo_url"
                      label="Header Logo URL"
                      placeholder="https://example.com/logo.png"
                      containerClassName="mb-3"
                    />
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:file-text-line" className="me-2" />
                      Email Content
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <TextAreaFormInput
                      control={control}
                      name="email_signature"
                      label="Email Signature"
                      rows={3}
                      placeholder="Best regards,&#10;Casa Nirvana Team"
                      containerClassName="mb-3"
                    />

                    <TextAreaFormInput
                      control={control}
                      name="email_footer"
                      label="Email Footer"
                      rows={3}
                      placeholder="Casa Nirvana - Complete Community Management System&#10;This is an automated email, please do not reply."
                      containerClassName="mb-3"
                    />

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_branding_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_branding_enabled"
                            label="Email Branding"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <small className="text-muted">Include company branding in emails</small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* User Notifications Tab */}
          <Tab eventKey="user-notifications" title="User Notifications">
            <Row>
              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:user-3-line" className="me-2" />
                      Account & Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_welcome_new_users"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_welcome_new_users"
                            label="Welcome New Users"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_password_reset"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_password_reset"
                            label="Password Reset"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_account_verification"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_account_verification"
                            label="Account Verification"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:community-line" className="me-2" />
                      Community Activities
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_community_announcements"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_community_announcements"
                            label="Community Announcements"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_visitor_approvals"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_visitor_approvals"
                            label="Visitor Approvals"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_amenity_bookings"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_amenity_bookings"
                            label="Amenity Bookings"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:tools-line" className="me-2" />
                      Services & Maintenance
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_maintenance_requests"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_maintenance_requests"
                            label="Maintenance Requests"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_service_updates"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_service_updates"
                            label="Service Updates"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_complaint_updates"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_complaint_updates"
                            label="Complaint Updates"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:money-dollar-circle-line" className="me-2" />
                      Payments & Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_payment_confirmations"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_payment_confirmations"
                            label="Payment Confirmations"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_payment_reminders"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_payment_reminders"
                            label="Payment Reminders"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_emergency_alerts"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_emergency_alerts"
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
          </Tab>

          {/* Admin Notifications Tab */}
          <Tab eventKey="admin-notifications" title="Admin Notifications">
            <Row>
              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:admin-line" className="me-2" />
                      System Events
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="admin_email_new_registrations"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="admin_email_new_registrations"
                            label="New User Registrations"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="admin_email_new_complaints"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="admin_email_new_complaints"
                            label="New Complaints"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="admin_email_maintenance_requests"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="admin_email_maintenance_requests"
                            label="Maintenance Requests"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="admin_email_system_errors"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="admin_email_system_errors"
                            label="System Errors"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:money-dollar-circle-line" className="me-2" />
                      Financial & Security
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="admin_email_payment_received"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="admin_email_payment_received"
                            label="Payment Received"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="admin_email_failed_payments"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="admin_email_failed_payments"
                            label="Failed Payments"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="admin_email_emergency_alerts"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="admin_email_emergency_alerts"
                            label="Emergency Alerts"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="admin_email_daily_summary"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="admin_email_daily_summary"
                            label="Daily Summary"
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
          </Tab>

          {/* Scheduling & Security Tab */}
          <Tab eventKey="scheduling-security" title="Scheduling & Security">
            <Row>
              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:time-line" className="me-2" />
                      Email Scheduling
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_quiet_hours_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_quiet_hours_enabled"
                            label="Quiet Hours"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <small className="text-muted">Delay emails during quiet hours</small>
                    </div>

                    <Row>
                      <Col lg={6}>
                        <TextFormInput
                          control={control}
                          name="email_quiet_start_time"
                          type="time"
                          label="Quiet Start Time"
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col lg={6}>
                        <TextFormInput
                          control={control}
                          name="email_quiet_end_time"
                          type="time"
                          label="Quiet End Time"
                          containerClassName="mb-3"
                        />
                      </Col>
                    </Row>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_digest_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_digest_enabled"
                            label="Email Digest"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <small className="text-muted">Combine multiple notifications</small>
                    </div>

                    <SelectFormInput
                      control={control}
                      name="email_digest_frequency"
                      label="Digest Frequency"
                      containerClassName="mb-3"
                      options={[
                        { value: 'hourly', label: 'Hourly' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' }
                      ]}
                    />
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardHeader>
                    <CardTitle as="h4">
                      <IconifyIcon icon="ri:shield-check-line" className="me-2" />
                      Security & Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_encryption_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_encryption_enabled"
                            label="Email Encryption (TLS)"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_dkim_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_dkim_enabled"
                            label="DKIM Signing"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_spf_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_spf_enabled"
                            label="SPF Validation"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_bounce_handling"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_bounce_handling"
                            label="Bounce Handling"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_complaint_handling"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_complaint_handling"
                            label="Complaint Handling"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>

                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="email_unsubscribe_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="email_unsubscribe_enabled"
                            label="Unsubscribe Links"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                      <small className="text-muted">Include unsubscribe links in emails</small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>

        <div className="d-flex justify-content-between">
          <Button 
            variant="outline-secondary" 
            type="button" 
            onClick={() => emailSettings && reset(emailSettings)}
            disabled={!isDirty || isUpdating}
          >
            <IconifyIcon icon="ri:refresh-line" className="me-1" />
            Reset
          </Button>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={!isDirty || isUpdating}
          >
            {isUpdating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Saving...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:save-line" className="me-1" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
};

export default EmailNotificationSettingsPage;
