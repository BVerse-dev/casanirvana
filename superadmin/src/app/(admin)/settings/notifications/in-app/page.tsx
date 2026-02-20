'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Form, Tab, Tabs, Badge } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useInAppNotificationSettings, { InAppNotificationSettings } from '@/hooks/useInAppNotificationSettings';

// Comprehensive form validation schema
const inAppNotificationSchema = yup.object({
  // General Settings
  notifications_enabled: yup.boolean().required(),
  sound_enabled: yup.boolean().required(),
  vibration_enabled: yup.boolean().required(),
  badge_count_enabled: yup.boolean().required(),
  preview_enabled: yup.boolean().required(),
  group_notifications: yup.boolean().required(),
  
  // Display Settings
  auto_dismiss_enabled: yup.boolean().required(),
  auto_dismiss_duration: yup.number().min(1000).max(30000).required(),
  notification_position: yup.string().oneOf(['top', 'center', 'bottom']).required(),
  animation_type: yup.string().oneOf(['slide', 'fade', 'bounce', 'none']).required(),
  theme_mode: yup.string().oneOf(['light', 'dark', 'auto']).required(),
  
  // Quiet Hours
  quiet_hours_enabled: yup.boolean().required(),
  quiet_hours_start: yup.string().required(),
  quiet_hours_end: yup.string().required(),
  quiet_hours_weekends_only: yup.boolean().required(),
  
  // Priority Levels
  priority_high_enabled: yup.boolean().required(),
  priority_medium_enabled: yup.boolean().required(),
  priority_low_enabled: yup.boolean().required(),
  priority_urgent_bypass_quiet: yup.boolean().required(),
  
  // Category Settings
  maintenance_notifications: yup.boolean().required(),
  payment_notifications: yup.boolean().required(),
  community_announcements: yup.boolean().required(),
  event_notifications: yup.boolean().required(),
  security_alerts: yup.boolean().required(),
  amenity_bookings: yup.boolean().required(),
  visitor_notifications: yup.boolean().required(),
  complaint_updates: yup.boolean().required(),
  billing_reminders: yup.boolean().required(),
  emergency_alerts: yup.boolean().required(),
  
  // Delivery Settings
  max_notifications_per_hour: yup.number().min(1).max(100).required(),
  retry_failed_notifications: yup.boolean().required(),
  notification_timeout: yup.number().min(5).max(300).required(),
  batch_notifications: yup.boolean().required(),
  
  // User Preferences
  user_can_disable_categories: yup.boolean().required(),
  user_can_set_quiet_hours: yup.boolean().required(),
  user_can_choose_priority: yup.boolean().required(),
  user_can_customize_sounds: yup.boolean().required(),
  
  // Advanced Settings
  rich_notifications: yup.boolean().required(),
  action_buttons_enabled: yup.boolean().required(),
  inline_replies_enabled: yup.boolean().required(),
  notification_history_days: yup.number().min(1).max(365).required(),
});

const InAppNotificationSettingsPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Use the in-app notification settings hook
  const {
    inappSettings,
    isLoadingData,
    loadError,
    updateSettings,
    isUpdating,
    updateError,
    updateSuccess,
  } = useInAppNotificationSettings();

  const { control, handleSubmit, reset, watch, formState: { isDirty } } = useForm<InAppNotificationSettings>({
    resolver: yupResolver(inAppNotificationSchema),
    defaultValues: {
      // General Settings
      notifications_enabled: true,
      sound_enabled: true,
      vibration_enabled: true,
      badge_count_enabled: true,
      preview_enabled: true,
      group_notifications: true,
      
      // Display Settings
      auto_dismiss_enabled: false,
      auto_dismiss_duration: 5000,
      notification_position: 'top',
      animation_type: 'slide',
      theme_mode: 'auto',
      
      // Quiet Hours
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '07:00',
      quiet_hours_weekends_only: false,
      
      // Priority Levels
      priority_high_enabled: true,
      priority_medium_enabled: true,
      priority_low_enabled: true,
      priority_urgent_bypass_quiet: true,
      
      // Category Settings
      maintenance_notifications: true,
      payment_notifications: true,
      community_announcements: true,
      event_notifications: true,
      security_alerts: true,
      amenity_bookings: true,
      visitor_notifications: true,
      complaint_updates: true,
      billing_reminders: true,
      emergency_alerts: true,
      
      // Delivery Settings
      max_notifications_per_hour: 20,
      retry_failed_notifications: true,
      notification_timeout: 30,
      batch_notifications: false,
      
      // User Preferences
      user_can_disable_categories: true,
      user_can_set_quiet_hours: true,
      user_can_choose_priority: false,
      user_can_customize_sounds: true,
      
      // Advanced Settings
      rich_notifications: true,
      action_buttons_enabled: true,
      inline_replies_enabled: false,
      notification_history_days: 30,
    },
  });

  // Watch certain fields for conditional rendering
  const watchedValues = watch();

  // Reset form when data loads
  useEffect(() => {
    if (inappSettings) {
      reset(inappSettings);
    }
  }, [inappSettings, reset]);

  // Handle success/error states
  useEffect(() => {
    if (updateSuccess) {
      setShowAlert({ type: 'success', message: 'In-app notification setup updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (updateError) {
      setShowAlert({ type: 'danger', message: 'Failed to update in-app notification setup. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  }, [updateError]);

  const onSubmit = async (data: InAppNotificationSettings) => {
    try {
      setShowAlert(null);
      updateSettings(data);
    } catch (error) {
      console.error('Error submitting in-app notification settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update in-app notification setup' });
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <>
        <PageTitle subName="Notification Setup" title="In-App Notification Setup" />
        <Alert variant="info">
          <IconifyIcon icon="solar:loading-line-duotone" className="fs-18 me-2" />
          Loading in-app notification setup...
        </Alert>
      </>
    );
  }

  // Error state
  if (loadError) {
    return (
      <>
        <PageTitle subName="Notification Setup" title="In-App Notification Setup" />
        <Alert variant="danger">
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error loading in-app notification setup: {loadError.message}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Notification Setup" title="In-App Notification Setup" />
      
      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          {showAlert.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultActiveKey="general" className="mb-3">
          
          {/* General Settings Tab */}
          <Tab eventKey="general" title="General Settings">
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <CardTitle className="mb-0">
                    <IconifyIcon icon="solar:settings-line-duotone" className="fs-18 me-2" />
                    Basic Configuration
                  </CardTitle>
                  <Badge bg={watchedValues.notifications_enabled ? 'success' : 'secondary'}>
                    {watchedValues.notifications_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="notifications_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="notifications_enabled"
                            label="Enable In-App Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="sound_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="sound_enabled"
                            label="Enable Notification Sounds"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={!watchedValues.notifications_enabled}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="vibration_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="vibration_enabled"
                            label="Enable Vibration (Mobile)"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={!watchedValues.notifications_enabled}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="badge_count_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="badge_count_enabled"
                            label="Show Badge Count"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={!watchedValues.notifications_enabled}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="preview_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="preview_enabled"
                            label="Show Notification Preview"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={!watchedValues.notifications_enabled}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="group_notifications"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="group_notifications"
                            label="Group Similar Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={!watchedValues.notifications_enabled}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Tab>

          {/* Display Settings Tab */}
          <Tab eventKey="display" title="Display & UI">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconifyIcon icon="solar:monitor-line-duotone" className="fs-18 me-2" />
                  Display Configuration
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="auto_dismiss_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="auto_dismiss_enabled"
                            label="Auto-Dismiss Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  {watchedValues.auto_dismiss_enabled && (
                    <Col lg={6}>
                      <TextFormInput
                        name="auto_dismiss_duration"
                        label="Auto-Dismiss Duration (ms)"
                        placeholder="5000"
                        type="number"
                        control={control}
                        containerClassName="mb-3"
                      />
                    </Col>
                  )}
                  <Col lg={6}>
                    <SelectFormInput
                      name="notification_position"
                      label="Notification Position"
                      control={control}
                      containerClassName="mb-3"
                      options={[
                        { value: 'top', label: 'Top' },
                        { value: 'center', label: 'Center' },
                        { value: 'bottom', label: 'Bottom' }
                      ]}
                    />
                  </Col>
                  <Col lg={6}>
                    <SelectFormInput
                      name="animation_type"
                      label="Animation Type"
                      control={control}
                      containerClassName="mb-3"
                      options={[
                        { value: 'slide', label: 'Slide' },
                        { value: 'fade', label: 'Fade' },
                        { value: 'bounce', label: 'Bounce' },
                        { value: 'none', label: 'None' }
                      ]}
                    />
                  </Col>
                  <Col lg={6}>
                    <SelectFormInput
                      name="theme_mode"
                      label="Theme Mode"
                      control={control}
                      containerClassName="mb-3"
                      options={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'auto', label: 'Auto (System)' }
                      ]}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Tab>

          {/* Quiet Hours Tab */}
          <Tab eventKey="quiet-hours" title="Quiet Hours">
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <CardTitle className="mb-0">
                    <IconifyIcon icon="solar:moon-line-duotone" className="fs-18 me-2" />
                    Do Not Disturb Settings
                  </CardTitle>
                  <Badge bg={watchedValues.quiet_hours_enabled ? 'info' : 'secondary'}>
                    {watchedValues.quiet_hours_enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="quiet_hours_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="quiet_hours_enabled"
                            label="Enable Quiet Hours"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  {watchedValues.quiet_hours_enabled && (
                    <>
                      <Col lg={6}>
                        <TextFormInput
                          name="quiet_hours_start"
                          label="Start Time"
                          type="time"
                          control={control}
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col lg={6}>
                        <TextFormInput
                          name="quiet_hours_end"
                          label="End Time"
                          type="time"
                          control={control}
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col lg={6}>
                        <div className="form-check form-switch mb-3">
                          <Controller
                            name="quiet_hours_weekends_only"
                            control={control}
                            render={({ field }) => (
                              <Form.Check
                                type="switch"
                                id="quiet_hours_weekends_only"
                                label="Weekends Only"
                                checked={Boolean(field.value)}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                            )}
                          />
                        </div>
                      </Col>
                      <Col lg={6}>
                        <div className="form-check form-switch mb-3">
                          <Controller
                            name="priority_urgent_bypass_quiet"
                            control={control}
                            render={({ field }) => (
                              <Form.Check
                                type="switch"
                                id="priority_urgent_bypass_quiet"
                                label="Urgent Notifications Bypass Quiet Hours"
                                checked={Boolean(field.value)}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                            )}
                          />
                        </div>
                      </Col>
                    </>
                  )}
                </Row>
                {watchedValues.quiet_hours_enabled && (
                  <Alert variant="info" className="mt-3">
                    <IconifyIcon icon="solar:info-circle-line-duotone" className="fs-16 me-2" />
                    During quiet hours, only urgent notifications will be shown (if enabled above).
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Tab>

          {/* Priority Settings Tab */}
          <Tab eventKey="priority" title="Priority Levels">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconifyIcon icon="solar:flag-line-duotone" className="fs-18 me-2" />
                  Priority Configuration
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="priority_high_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="priority_high_enabled"
                            label="High Priority Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="priority_medium_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="priority_medium_enabled"
                            label="Medium Priority Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="priority_low_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="priority_low_enabled"
                            label="Low Priority Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
                <Alert variant="warning" className="mt-3">
                  <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-16 me-2" />
                  Emergency and security alerts will always be shown regardless of priority settings.
                </Alert>
              </CardBody>
            </Card>
          </Tab>

          {/* Categories Tab */}
          <Tab eventKey="categories" title="Notification Categories">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconifyIcon icon="solar:folder-line-duotone" className="fs-18 me-2" />
                  Category Settings
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <h6 className="mb-3">Community & Events</h6>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="community_announcements"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="community_announcements"
                            label="Community Announcements"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="event_notifications"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="event_notifications"
                            label="Event Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="amenity_bookings"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="amenity_bookings"
                            label="Amenity Booking Updates"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <h6 className="mb-3">Services & Maintenance</h6>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="maintenance_notifications"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="maintenance_notifications"
                            label="Maintenance Updates"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="complaint_updates"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="complaint_updates"
                            label="Complaint Status Updates"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="visitor_notifications"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="visitor_notifications"
                            label="Visitor Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <h6 className="mb-3">Financial</h6>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="payment_notifications"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="payment_notifications"
                            label="Payment Confirmations"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="billing_reminders"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="billing_reminders"
                            label="Billing Reminders"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <h6 className="mb-3">Security & Safety</h6>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="security_alerts"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="security_alerts"
                            label="Security Alerts"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="emergency_alerts"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="emergency_alerts"
                            label="Emergency Alerts"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={true}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
                <Alert variant="danger" className="mt-3">
                  <IconifyIcon icon="solar:shield-warning-line-duotone" className="fs-16 me-2" />
                  Emergency alerts cannot be disabled for safety reasons.
                </Alert>
              </CardBody>
            </Card>
          </Tab>

          {/* Delivery Settings Tab */}
          <Tab eventKey="delivery" title="Delivery & Performance">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconifyIcon icon="solar:delivery-line-duotone" className="fs-18 me-2" />
                  Delivery Configuration
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <TextFormInput
                      name="max_notifications_per_hour"
                      label="Max Notifications Per Hour"
                      placeholder="20"
                      type="number"
                      control={control}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <TextFormInput
                      name="notification_timeout"
                      label="Notification Timeout (seconds)"
                      placeholder="30"
                      type="number"
                      control={control}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="retry_failed_notifications"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="retry_failed_notifications"
                            label="Retry Failed Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="batch_notifications"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="batch_notifications"
                            label="Batch Similar Notifications"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Tab>

          {/* User Preferences Tab */}
          <Tab eventKey="user-prefs" title="User Control">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconifyIcon icon="solar:user-line-duotone" className="fs-18 me-2" />
                  User Preference Settings
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="user_can_disable_categories"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="user_can_disable_categories"
                            label="Users Can Disable Categories"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="user_can_set_quiet_hours"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="user_can_set_quiet_hours"
                            label="Users Can Set Quiet Hours"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="user_can_choose_priority"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="user_can_choose_priority"
                            label="Users Can Set Priority Preferences"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="user_can_customize_sounds"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="user_can_customize_sounds"
                            label="Users Can Customize Sounds"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
                <Alert variant="info" className="mt-3">
                  <IconifyIcon icon="solar:info-circle-line-duotone" className="fs-16 me-2" />
                  These settings control what notification preferences users can modify in their personal settings.
                </Alert>
              </CardBody>
            </Card>
          </Tab>

          {/* Advanced Features Tab */}
          <Tab eventKey="advanced" title="Advanced Features">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconifyIcon icon="solar:programming-line-duotone" className="fs-18 me-2" />
                  Advanced Configuration
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="rich_notifications"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="rich_notifications"
                            label="Rich Notifications (Images, Links)"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="action_buttons_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="action_buttons_enabled"
                            label="Action Buttons (Quick Reply, Approve)"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="inline_replies_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="inline_replies_enabled"
                            label="Inline Replies"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <TextFormInput
                      name="notification_history_days"
                      label="Keep Notification History (days)"
                      placeholder="30"
                      type="number"
                      control={control}
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>
                <Alert variant="warning" className="mt-3">
                  <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-16 me-2" />
                  Advanced features may require additional client-side implementation and testing.
                </Alert>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button
            variant="outline-secondary"
            type="button"
            onClick={() => reset()}
            disabled={!isDirty || isUpdating}
          >
            <IconifyIcon icon="solar:refresh-line-duotone" className="fs-16 me-2" />
            Reset Changes
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!isDirty || isUpdating}
            size="lg"
          >
            {isUpdating && <IconifyIcon icon="solar:loading-line-duotone" className="fs-16 me-2" />}
            <IconifyIcon icon="solar:diskette-line-duotone" className="fs-16 me-2" />
            Save Configuration
          </Button>
        </div>
      </form>
    </>
  );
};

export default InAppNotificationSettingsPage;