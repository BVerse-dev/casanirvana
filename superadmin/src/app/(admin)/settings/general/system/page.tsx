'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  Button, 
  Row, 
  Col, 
  Form,
  Alert 
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { toast } from 'react-hot-toast';
import { useSystemConfig, useUpdateSystemConfig } from '@/hooks/useSystemConfig';

// Form validation schema
const systemConfigSchema = yup.object({
  admin_dashboard_refresh_minutes: yup.number().min(1, 'Must be at least 1 minute').max(60, 'Cannot exceed 60 minutes').required('Dashboard refresh interval is required'),
  auto_logout_minutes: yup.number().min(5, 'Must be at least 5 minutes').max(480, 'Cannot exceed 8 hours'),
  max_file_upload_size_mb: yup.number().min(1, 'Must be at least 1 MB').max(100, 'Cannot exceed 100 MB'),
  session_timeout_minutes: yup.number().min(15, 'Must be at least 15 minutes').max(1440, 'Cannot exceed 24 hours'),
  max_concurrent_sessions: yup.number().min(1, 'Must be at least 1').max(10, 'Cannot exceed 10'),
  data_backup_frequency: yup.string().required('Backup frequency is required'),
  log_retention_days: yup.number().min(7, 'Must be at least 7 days').max(365, 'Cannot exceed 365 days'),
  enable_real_time_notifications: yup.boolean(),
  enable_analytics: yup.boolean(),
  enable_audit_logs: yup.boolean(),
  enable_maintenance_mode: yup.boolean(),
});

interface SystemConfigFormData {
  admin_dashboard_refresh_minutes: number;
  auto_logout_minutes?: number;
  max_file_upload_size_mb?: number;
  session_timeout_minutes?: number;
  max_concurrent_sessions?: number;
  data_backup_frequency: string;
  log_retention_days?: number;
  enable_real_time_notifications?: boolean;
  enable_analytics?: boolean;
  enable_audit_logs?: boolean;
  enable_maintenance_mode?: boolean;
}

// Options for select inputs
const backupFrequencyOptions = [
  { value: 'hourly', label: 'Every Hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const SystemConfigPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const { data: systemConfig, isLoading: isLoadingConfig, error: configError } = useSystemConfig();
  const updateSystemConfig = useUpdateSystemConfig();

  const { register, control, handleSubmit, reset, watch, formState: { isDirty, isSubmitting } } = useForm<SystemConfigFormData>({
    resolver: yupResolver(systemConfigSchema),
    defaultValues: {
      admin_dashboard_refresh_minutes: 5,
      auto_logout_minutes: 60,
      max_file_upload_size_mb: 10,
      session_timeout_minutes: 30,
      max_concurrent_sessions: 3,
      data_backup_frequency: 'daily',
      log_retention_days: 90,
      enable_real_time_notifications: true,
      enable_analytics: true,
      enable_audit_logs: true,
      enable_maintenance_mode: false,
    },
  });

  const watchMaintenanceMode = watch('enable_maintenance_mode');
  const watchRefreshMinutes = watch('admin_dashboard_refresh_minutes');
  const watchSessionTimeout = watch('session_timeout_minutes');
  const watchUploadSize = watch('max_file_upload_size_mb');
  const watchBackupFrequency = watch('data_backup_frequency');

  useEffect(() => {
    if (systemConfig) {
      reset(systemConfig);
    }
  }, [systemConfig, reset]);

  const onSubmit = async (data: SystemConfigFormData) => {
    try {
      await updateSystemConfig.mutateAsync(data);
      
      toast.success('System configuration updated successfully!');
      setShowAlert({ type: 'success', message: 'System configuration has been updated successfully.' });
    } catch (error) {
      console.error('Error updating system config:', error);
      toast.error('Failed to update system configuration');
      setShowAlert({ type: 'danger', message: 'Failed to update system configuration. Please try again.' });
    }
  };

  if (configError && !systemConfig) {
    return (
      <>
        <PageTitle title="System Configuration" subName="General Settings" />
        <Card>
          <CardBody>
            <Alert variant="danger" className="mb-0">
              <IconifyIcon icon="material-symbols:error" className="me-2" />
              Failed to load system configuration. Fix the backend connection and reload this page before making changes.
            </Alert>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="System Configuration" subName="General Settings" />
      
      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          {showAlert.message}
        </Alert>
      )}

      {watchMaintenanceMode && (
        <Alert variant="warning">
          <IconifyIcon icon="material-symbols:warning" className="me-2" />
          <strong>Maintenance Mode Enabled:</strong> This will make the system temporarily unavailable to users.
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <CardTitle as="h5" className="mb-1">System Configuration</CardTitle>
              <p className="text-muted mb-0">
                Configure system behavior, performance, and technical parameters
              </p>
            </div>
            <IconifyIcon icon="material-symbols:computer" className="text-info fs-2" />
          </div>
        </CardHeader>
        <CardBody>
          {isLoadingConfig ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading system configuration...</p>
              </div>
            </div>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Performance Settings */}
            <div className="mb-4">
              <h6 className="mb-3 text-primary">
                <IconifyIcon icon="material-symbols:speed" className="me-2" />
                Performance Settings
              </h6>
              <Row className="g-3">
                <Col md={4}>
                  <TextFormInput
                    name="admin_dashboard_refresh_minutes"
                    label="Dashboard Refresh (minutes)"
                    type="number"
                    placeholder="5"
                    control={control}
                  />
                </Col>
                <Col md={4}>
                  <TextFormInput
                    name="auto_logout_minutes"
                    label="Auto Logout (minutes)"
                    type="number"
                    placeholder="60"
                    control={control}
                  />
                </Col>
                <Col md={4}>
                  <TextFormInput
                    name="max_file_upload_size_mb"
                    label="Max File Upload (MB)"
                    type="number"
                    placeholder="10"
                    control={control}
                  />
                </Col>
              </Row>
            </div>

            {/* Session Management */}
            <div className="mb-4">
              <h6 className="mb-3 text-success">
                <IconifyIcon icon="material-symbols:person" className="me-2" />
                Session Management
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <TextFormInput
                    name="session_timeout_minutes"
                    label="Session Timeout (minutes)"
                    type="number"
                    placeholder="30"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="max_concurrent_sessions"
                    label="Max Concurrent Sessions"
                    type="number"
                    placeholder="3"
                    control={control}
                  />
                </Col>
              </Row>
            </div>

            {/* Data Management */}
            <div className="mb-4">
              <h6 className="mb-3 text-warning">
                <IconifyIcon icon="material-symbols:database" className="me-2" />
                Data Management
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <SelectFormInput
                    name="data_backup_frequency"
                    label="Data Backup Frequency"
                    control={control}
                    options={backupFrequencyOptions}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="log_retention_days"
                    label="Log Retention (days)"
                    type="number"
                    placeholder="90"
                    control={control}
                  />
                </Col>
              </Row>
            </div>

            {/* System Features */}
            <div className="mb-4">
              <h6 className="mb-3 text-info">
                <IconifyIcon icon="material-symbols:toggle-on" className="me-2" />
                System Features
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("enable_real_time_notifications")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:notifications" className="me-2" />
                      Real-time Notifications
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("enable_analytics")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:analytics" className="me-2" />
                      Analytics & Reporting
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("enable_audit_logs")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:history" className="me-2" />
                      Audit Logs
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("enable_maintenance_mode")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:build" className="me-2" />
                      Maintenance Mode
                    </label>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Configuration Snapshot */}
            <div className="mb-4">
              <h6 className="mb-3 text-secondary">
                <IconifyIcon icon="material-symbols:monitoring" className="me-2" />
                Configuration Snapshot
              </h6>
              <Row className="g-3">
                <Col md={3}>
                  <Card className="bg-success-subtle border-success border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:schedule" className="text-success fs-2 mb-2" />
                      <h6 className="mb-1">Dashboard Refresh</h6>
                      <span className="text-success fw-medium">{watchRefreshMinutes || 5} min</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-info-subtle border-info border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:timer" className="text-info fs-2 mb-2" />
                      <h6 className="mb-1">Session Timeout</h6>
                      <span className="text-info fw-medium">{watchSessionTimeout || 30} min</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-warning-subtle border-warning border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:upload-file" className="text-warning fs-2 mb-2" />
                      <h6 className="mb-1">Upload Limit</h6>
                      <span className="text-warning fw-medium">{watchUploadSize || 10} MB</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-primary-subtle border-primary border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:backup" className="text-primary fs-2 mb-2" />
                      <h6 className="mb-1">Backup Policy</h6>
                      <span className="text-primary fw-medium text-capitalize">{watchBackupFrequency || 'daily'}</span>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => systemConfig && reset(systemConfig)}
                disabled={!isDirty || isSubmitting || isLoadingConfig}
              >
                Reset Changes
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty || isSubmitting || isLoadingConfig}
              >
                {isSubmitting ? (
                  <span className="spinner-border spinner-border-sm me-1" />
                ) : (
                  <IconifyIcon icon="material-symbols:save" className="me-1" />
                )}
                Save Configuration
              </Button>
            </div>
          </Form>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default SystemConfigPage;
