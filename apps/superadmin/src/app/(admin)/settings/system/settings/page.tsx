"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Alert,
  Badge,
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  ProgressBar,
  Table,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import PageTitle from "@/components/PageTitle";
import TextFormInput from "@/components/from/TextFormInput";
import SelectFormInput from "@/components/from/SelectFormInput";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import { useSystemSettings, useUpdateSystemSettings } from "@/hooks/useSystemSettings";
import { toast } from "react-hot-toast";

// Form schema for comprehensive system configuration
const systemConfigSchema = yup.object({
  // Performance & Infrastructure
  app_name: yup.string().required('Application name is required'),
  app_version: yup.string().required('Application version is required'),
  environment: yup.string().oneOf(['development', 'staging', 'production']).required('Environment is required'),
  debug_mode: yup.boolean(),
  maintenance_mode: yup.boolean(),
  force_ssl: yup.boolean(),
  
  // Database & Storage
  database_connection_pool_size: yup.number().min(5).max(100),
  database_query_timeout: yup.number().min(1000).max(60000),
  max_file_upload_size: yup.number().min(1).max(100),
  storage_provider: yup.string().oneOf(['local', 'aws-s3', 'azure', 'gcp']),
  cache_provider: yup.string().oneOf(['redis', 'memcached', 'database']),
  cache_ttl: yup.number().min(60).max(86400),
  
  // Security & Authentication
  session_timeout: yup.number().min(5).max(1440),
  password_min_length: yup.number().min(6).max(50),
  max_login_attempts: yup.number().min(3).max(10),
  enable_two_factor: yup.boolean(),
  jwt_expiry_minutes: yup.number().min(15).max(10080),
  cors_allowed_origins: yup.string(),
  
  // API & Rate Limiting
  api_rate_limit_per_minute: yup.number().min(10).max(10000),
  api_burst_limit: yup.number().min(5).max(1000),
  webhook_timeout: yup.number().min(5).max(60),
  enable_api_versioning: yup.boolean(),
  
  // Notification Settings
  notification_email_enabled: yup.boolean(),
  notification_sms_enabled: yup.boolean(),
  notification_push_enabled: yup.boolean(),
  email_queue_batch_size: yup.number().min(1).max(100),
  sms_queue_batch_size: yup.number().min(1).max(50),
  notification_retry_attempts: yup.number().min(1).max(5),
  
  // System Monitoring
  enable_system_monitoring: yup.boolean(),
  monitoring_interval_seconds: yup.number().min(30).max(3600),
  disk_space_alert_threshold: yup.number().min(10).max(95),
  memory_usage_alert_threshold: yup.number().min(50).max(95),
  cpu_usage_alert_threshold: yup.number().min(50).max(95),
  
  // Backup & Recovery
  backup_frequency: yup.string().oneOf(['hourly', 'daily', 'weekly', 'monthly']),
  backup_retention_days: yup.number().min(7).max(365),
  auto_backup_enabled: yup.boolean(),
  backup_compression: yup.boolean(),
  offsite_backup_enabled: yup.boolean(),
  
  // Logging & Auditing
  log_level: yup.string().oneOf(['debug', 'info', 'warning', 'error', 'critical']),
  log_retention_days: yup.number().min(7).max(365),
  enable_audit_logging: yup.boolean(),
  enable_performance_logging: yup.boolean(),
  log_file_max_size_mb: yup.number().min(10).max(1000),
  
  // Business Logic
  maintenance_auto_assignment: yup.boolean(),
  amenity_booking_advance_days: yup.number().min(1).max(90),
  visitor_pass_validity_hours: yup.number().min(1).max(168),
  payment_grace_period_days: yup.number().min(0).max(30),
  complaint_auto_escalation_hours: yup.number().min(1).max(168),
  
  // Advanced Features
  enable_analytics: yup.boolean(),
  enable_machine_learning: yup.boolean(),
  enable_real_time_sync: yup.boolean(),
  enable_mobile_push: yup.boolean(),
  enable_whatsapp_integration: yup.boolean(),
});

type SystemConfigFormData = yup.InferType<typeof systemConfigSchema>;

// Option arrays for various settings
const environmentOptions = [
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
];

const storageProviderOptions = [
  { value: 'local', label: 'Local Storage' },
  { value: 'aws-s3', label: 'Amazon S3' },
  { value: 'azure', label: 'Azure Blob Storage' },
  { value: 'gcp', label: 'Google Cloud Storage' },
];

const cacheProviderOptions = [
  { value: 'redis', label: 'Redis' },
  { value: 'memcached', label: 'Memcached' },
  { value: 'database', label: 'Database Cache' },
];

const backupFrequencyOptions = [
  { value: 'hourly', label: 'Every Hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const logLevelOptions = [
  { value: 'debug', label: 'Debug' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'critical', label: 'Critical' },
];

const smsProviderOptions = [
  { value: 'twilio', label: 'Twilio' },
  { value: 'aws-sns', label: 'AWS SNS' },
  { value: 'hubtel', label: 'Hubtel' },
  { value: 'arkesel', label: 'Arkesel' },
];

const SystemConfigSettings = () => {
  const router = useRouter();
  const { data: systemSettingsData, isLoading, error: systemSettingsError } = useSystemSettings();
  const updateSystemSettingsMutation = useUpdateSystemSettings();
  const [activeTab, setActiveTab] = useState("general");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<SystemConfigFormData>({
    resolver: yupResolver(systemConfigSchema),
    defaultValues: {
      // General defaults
      app_name: "Casa Nirvana",
      app_version: "1.0.0",
      environment: "production",
      debug_mode: false,
      maintenance_mode: false,
      force_ssl: true,
      
      // Performance defaults
      database_connection_pool_size: 20,
      database_query_timeout: 30000,
      max_file_upload_size: 10,
      storage_provider: "local",
      cache_provider: "redis",
      cache_ttl: 3600,
      
      // Security defaults
      session_timeout: 60,
      password_min_length: 8,
      max_login_attempts: 5,
      enable_two_factor: false,
      jwt_expiry_minutes: 60,
      cors_allowed_origins: "*",
      
      // API defaults
      api_rate_limit_per_minute: 100,
      api_burst_limit: 20,
      webhook_timeout: 30,
      enable_api_versioning: true,
      
      // Notification defaults
      notification_email_enabled: true,
      notification_sms_enabled: false,
      notification_push_enabled: true,
      email_queue_batch_size: 10,
      sms_queue_batch_size: 5,
      notification_retry_attempts: 3,
      
      // Monitoring defaults
      enable_system_monitoring: true,
      monitoring_interval_seconds: 300,
      disk_space_alert_threshold: 85,
      memory_usage_alert_threshold: 80,
      cpu_usage_alert_threshold: 80,
      
      // Backup defaults
      backup_frequency: "daily",
      backup_retention_days: 30,
      auto_backup_enabled: true,
      backup_compression: true,
      offsite_backup_enabled: false,
      
      // Logging defaults
      log_level: "info",
      log_retention_days: 30,
      enable_audit_logging: true,
      enable_performance_logging: false,
      log_file_max_size_mb: 100,
      
      // Business logic defaults
      maintenance_auto_assignment: true,
      amenity_booking_advance_days: 7,
      visitor_pass_validity_hours: 24,
      payment_grace_period_days: 5,
      complaint_auto_escalation_hours: 48,
      
      // Advanced features defaults
      enable_analytics: true,
      enable_machine_learning: false,
      enable_real_time_sync: true,
      enable_mobile_push: true,
      enable_whatsapp_integration: false,
    },
  });
  const watchedValues = watch();
  const systemMetrics = {
    cpuThreshold: Number(watchedValues.cpu_usage_alert_threshold ?? 0),
    memoryThreshold: Number(watchedValues.memory_usage_alert_threshold ?? 0),
    diskThreshold: Number(watchedValues.disk_space_alert_threshold ?? 0),
    apiBurstUtilization: Math.min(
      100,
      Math.max(0, Number(watchedValues.api_burst_limit ?? 0) / 10)
    ),
    sessionTimeout: Number(watchedValues.session_timeout ?? 0),
    connectionPoolSize: Number(watchedValues.database_connection_pool_size ?? 0),
  };

  // Populate form when settings are loaded
  useEffect(() => {
    if (systemSettingsData?.settings) {
      // The settings object already has parsed values with correct types
      reset(systemSettingsData.settings);
    }
  }, [systemSettingsData, reset]);

  const onSubmit = async (data: SystemConfigFormData) => {
    try {
      // Use the system settings hook which handles the correct format
      await updateSystemSettingsMutation.mutateAsync(data);
      toast.success("System configuration updated successfully");
    } catch (error) {
      console.error("System config update error:", error);
      toast.error("Failed to update system configuration");
    }
  };

  const systemStatus = [
    {
      label: "Environment",
      status: watchedValues.environment === "production" ? "configured" : "review",
      icon: "ri:server-line",
      details: `Configured as ${watchedValues.environment || "production"}`,
    },
    {
      label: "Monitoring Policy",
      status: watchedValues.enable_system_monitoring ? "configured" : "disabled",
      icon: "ri:pulse-line",
      details: watchedValues.enable_system_monitoring
        ? `Enabled • ${watchedValues.monitoring_interval_seconds || 300}s interval`
        : "Disabled in configuration",
    },
    {
      label: "Notification Channels",
      status:
        watchedValues.notification_email_enabled ||
        watchedValues.notification_sms_enabled ||
        watchedValues.notification_push_enabled
          ? "configured"
          : "review",
      icon: "ri:notification-3-line",
      details: [
        watchedValues.notification_email_enabled ? "Email" : null,
        watchedValues.notification_sms_enabled ? "SMS" : null,
        watchedValues.notification_push_enabled ? "Push" : null,
      ]
        .filter(Boolean)
        .join(" • ") || "No channels enabled",
    },
    {
      label: "Backup Policy",
      status: watchedValues.auto_backup_enabled ? "configured" : "review",
      icon: "ri:save-line",
      details: watchedValues.auto_backup_enabled
        ? `${watchedValues.backup_frequency || "daily"} backups • ${watchedValues.backup_retention_days || 30} day retention`
        : "Auto backup disabled",
    },
    {
      label: "Security Controls",
      status: watchedValues.force_ssl ? "configured" : "review",
      icon: "ri:shield-check-line",
      details: `SSL ${watchedValues.force_ssl ? "enforced" : "not enforced"} • Max login attempts ${watchedValues.max_login_attempts || 0}`,
    },
    {
      label: "Runtime Operations",
      status: "review",
      icon: "ri:settings-5-line",
      details: "Use System Overview for live metrics, alerts, and operational logs",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge bg="success">Operational</Badge>;
      case "degraded":
        return <Badge bg="warning">Degraded</Badge>;
      case "down":
        return <Badge bg="danger">Down</Badge>;
      case "configured":
        return <Badge bg="info">Configured</Badge>;
      case "review":
        return <Badge bg="warning">Needs Review</Badge>;
      case "disabled":
        return <Badge bg="secondary">Disabled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (systemSettingsError && !systemSettingsData) {
    return (
      <Alert variant="danger">
        <IconifyIcon icon="ri:error-warning-line" className="me-2" />
        Failed to load system configuration. Fix the backend connection and reload this page before making changes.
      </Alert>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="page-title">System Configuration</h4>
          <p className="text-muted mb-0">Configure system-wide behavior. Runtime operations are handled in System Overview.</p>
        </div>
      </div>

      <Row>
        {/* System Status */}
        <Col xl={4}>
          {/* System Health */}
          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h6">Configuration Health</CardTitle>
              <Dropdown>
                <DropdownToggle variant="outline-secondary" size="sm">
                  <IconifyIcon icon="ri:more-line" />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => router.push("/settings/system/overview")}>
                    <IconifyIcon icon="ri:pulse-line" className="me-2" />
                    Open System Overview
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/settings/admin/security")}>
                    <IconifyIcon icon="ri:shield-check-line" className="me-2" />
                    Open Security Policies
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/settings/notifications/rules")}>
                    <IconifyIcon icon="ri:notification-3-line" className="me-2" />
                    Open Notification Rules
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </CardHeader>
            <CardBody className="p-0">
              <ListGroup variant="flush">
                {systemStatus.map((item, index) => (
                  <ListGroupItem key={index}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center">
                        <IconifyIcon icon={item.icon} className="me-2" />
                        <div>
                          <div className="fw-medium">{item.label}</div>
                          <small className="text-muted">{item.details}</small>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </CardBody>
          </Card>

          {/* Configured Thresholds */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h6">Configured Thresholds</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">CPU Alert Threshold</span>
                  <span className="fw-medium">{systemMetrics.cpuThreshold.toFixed(1)}%</span>
                </div>
                <ProgressBar 
                  now={systemMetrics.cpuThreshold}
                  variant={systemMetrics.cpuThreshold > 80 ? "danger" : systemMetrics.cpuThreshold > 60 ? "warning" : "success"}
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Memory Alert Threshold</span>
                  <span className="fw-medium">{systemMetrics.memoryThreshold.toFixed(1)}%</span>
                </div>
                <ProgressBar 
                  now={systemMetrics.memoryThreshold}
                  variant={systemMetrics.memoryThreshold > 85 ? "danger" : systemMetrics.memoryThreshold > 70 ? "warning" : "info"}
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Disk Alert Threshold</span>
                  <span className="fw-medium">{systemMetrics.diskThreshold}%</span>
                </div>
                <ProgressBar now={systemMetrics.diskThreshold} variant="primary" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">API Burst Utilization</span>
                  <span className="fw-medium">{systemMetrics.apiBurstUtilization.toFixed(1)}%</span>
                </div>
                <ProgressBar now={systemMetrics.apiBurstUtilization} variant="secondary" />
              </div>
              <hr />
              <div className="row text-center">
                <div className="col-6">
                  <div className="text-muted small">Session Timeout</div>
                  <div className="fw-medium">{systemMetrics.sessionTimeout} min</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">DB Pool Size</div>
                  <div className="fw-medium">{systemMetrics.connectionPoolSize}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle as="h6">Quick Actions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm" onClick={() => router.push("/settings/system/overview")}>
                  <IconifyIcon icon="ri:pulse-line" className="me-1" />
                  Open Runtime Overview
                </Button>
                <Button variant="outline-info" size="sm" onClick={() => router.push("/settings/general/integrations")}>
                  <IconifyIcon icon="ri:plug-line" className="me-1" />
                  Review Integrations
                </Button>
                <Button variant="outline-warning" size="sm" onClick={() => router.push("/settings/admin/security")}>
                  <IconifyIcon icon="ri:shield-keyhole-line" className="me-1" />
                  Review Security Policies
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => router.push("/settings/notifications/rules")}>
                  <IconifyIcon icon="ri:notification-4-line" className="me-1" />
                  Review Notification Rules
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Configuration Form */}
        <Col xl={8}>
          <Card>
            <CardHeader>
              <CardTitle as="h6">System Configuration</CardTitle>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Navigation Tabs */}
                <div className="nav nav-tabs mb-4" role="tablist">
                  <button
                    className={`nav-link ${activeTab === "general" ? "active" : ""}`}
                    onClick={() => setActiveTab("general")}
                    type="button"
                  >
                    <IconifyIcon icon="ri:settings-line" className="me-2" />
                    General
                  </button>
                  <button
                    className={`nav-link ${activeTab === "performance" ? "active" : ""}`}
                    onClick={() => setActiveTab("performance")}
                    type="button"
                  >
                    <IconifyIcon icon="ri:speed-line" className="me-2" />
                    Performance
                  </button>
                  <button
                    className={`nav-link ${activeTab === "security" ? "active" : ""}`}
                    onClick={() => setActiveTab("security")}
                    type="button"
                  >
                    <IconifyIcon icon="ri:shield-line" className="me-2" />
                    Security
                  </button>
                  <button
                    className={`nav-link ${activeTab === "notifications" ? "active" : ""}`}
                    onClick={() => setActiveTab("notifications")}
                    type="button"
                  >
                    <IconifyIcon icon="ri:notification-3-line" className="me-2" />
                    Notifications
                  </button>
                  <button
                    className={`nav-link ${activeTab === "monitoring" ? "active" : ""}`}
                    onClick={() => setActiveTab("monitoring")}
                    type="button"
                  >
                    <IconifyIcon icon="ri:pulse-line" className="me-2" />
                    Monitoring
                  </button>
                  <button
                    className={`nav-link ${activeTab === "business" ? "active" : ""}`}
                    onClick={() => setActiveTab("business")}
                    type="button"
                  >
                    <IconifyIcon icon="ri:building-line" className="me-2" />
                    Business
                  </button>
                  <button
                    className={`nav-link ${activeTab === "advanced" ? "active" : ""}`}
                    onClick={() => setActiveTab("advanced")}
                    type="button"
                  >
                    <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                    Advanced
                  </button>
                </div>

                {/* General Settings */}
                {activeTab === "general" && (
                  <div>
                    <h6 className="mb-3">General Configuration</h6>
                    <Row>
                      <Col md={6}>
                        <TextFormInput
                          name="app_name"
                          label="Application Name"
                          placeholder="Casa Nirvana"
                          control={control}
                        />
                      </Col>
                      <Col md={6}>
                        <TextFormInput
                          name="app_version"
                          label="Application Version"
                          placeholder="1.0.0"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <SelectFormInput
                          name="environment"
                          label="Environment"
                          control={control}
                          options={environmentOptions}
                        />
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("debug_mode")}
                          />
                          <label className="form-check-label">Debug Mode</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("maintenance_mode")}
                          />
                          <label className="form-check-label">Maintenance Mode</label>
                        </div>
                      </Col>
                    </Row>
                    <Alert variant="warning" className="mt-3">
                      <IconifyIcon icon="ri:warning-line" className="me-1" />
                      Enabling maintenance mode will make the application unavailable to users.
                    </Alert>
                  </div>
                )}

                {/* Performance Settings */}
                {activeTab === "performance" && (
                  <div>
                    <h6 className="mb-3">Performance & Infrastructure</h6>
                    <Row>
                      <Col md={4}>
                        <TextFormInput
                          name="database_connection_pool_size"
                          label="DB Connection Pool Size"
                          type="number"
                          placeholder="20"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="database_query_timeout"
                          label="DB Query Timeout (ms)"
                          type="number"
                          placeholder="30000"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="max_file_upload_size"
                          label="Max File Upload (MB)"
                          type="number"
                          placeholder="10"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <SelectFormInput
                          name="storage_provider"
                          label="Storage Provider"
                          control={control}
                          options={storageProviderOptions}
                        />
                      </Col>
                      <Col md={4}>
                        <SelectFormInput
                          name="cache_provider"
                          label="Cache Provider"
                          control={control}
                          options={cacheProviderOptions}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="cache_ttl"
                          label="Cache TTL (seconds)"
                          type="number"
                          placeholder="3600"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <SelectFormInput
                          name="backup_frequency"
                          label="Backup Frequency"
                          control={control}
                          options={backupFrequencyOptions}
                        />
                      </Col>
                      <Col md={6}>
                        <TextFormInput
                          name="backup_retention_days"
                          label="Backup Retention (days)"
                          type="number"
                          placeholder="30"
                          control={control}
                        />
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === "security" && (
                  <div>
                    <h6 className="mb-3">Security Configuration</h6>
                    <Row>
                      <Col md={4}>
                        <TextFormInput
                          name="session_timeout"
                          label="Session Timeout (minutes)"
                          type="number"
                          placeholder="60"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="password_min_length"
                          label="Minimum Password Length"
                          type="number"
                          placeholder="8"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="max_login_attempts"
                          label="Max Login Attempts"
                          type="number"
                          placeholder="5"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <TextFormInput
                          name="jwt_expiry_minutes"
                          label="JWT Expiry (minutes)"
                          type="number"
                          placeholder="60"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_two_factor")}
                          />
                          <label className="form-check-label">Enable Two-Factor Auth</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("force_ssl")}
                          />
                          <label className="form-check-label">Force SSL</label>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <TextFormInput
                          name="api_rate_limit_per_minute"
                          label="API Rate Limit (per minute)"
                          type="number"
                          placeholder="100"
                          control={control}
                        />
                      </Col>
                      <Col md={6}>
                        <TextFormInput
                          name="api_burst_limit"
                          label="API Burst Limit"
                          type="number"
                          placeholder="20"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <TextAreaFormInput
                      name="cors_allowed_origins"
                      label="CORS Allowed Origins"
                      placeholder="https://yourdomain.com, https://api.yourdomain.com"
                      control={control}
                      rows={3}
                    />
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === "notifications" && (
                  <div>
                    <h6 className="mb-3">Notification Configuration</h6>
                    <Row>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("notification_email_enabled")}
                          />
                          <label className="form-check-label">Enable Email Notifications</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("notification_sms_enabled")}
                          />
                          <label className="form-check-label">Enable SMS Notifications</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("notification_push_enabled")}
                          />
                          <label className="form-check-label">Enable Push Notifications</label>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <TextFormInput
                          name="email_queue_batch_size"
                          label="Email Batch Size"
                          type="number"
                          placeholder="10"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="sms_queue_batch_size"
                          label="SMS Batch Size"
                          type="number"
                          placeholder="5"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="notification_retry_attempts"
                          label="Retry Attempts"
                          type="number"
                          placeholder="3"
                          control={control}
                        />
                      </Col>
                    </Row>
                    
                    <Alert variant="info" className="mt-3">
                      <IconifyIcon icon="ri:information-line" className="me-1" />
                      Configure specific notification providers in their respective settings pages.
                    </Alert>
                  </div>
                )}

                {/* Monitoring Settings */}
                {activeTab === "monitoring" && (
                  <div>
                    <h6 className="mb-3">System Monitoring & Logging</h6>
                    <Row>
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_system_monitoring")}
                          />
                          <label className="form-check-label">Enable System Monitoring</label>
                        </div>
                      </Col>
                      <Col md={6}>
                        <TextFormInput
                          name="monitoring_interval_seconds"
                          label="Monitoring Interval (seconds)"
                          type="number"
                          placeholder="300"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <TextFormInput
                          name="disk_space_alert_threshold"
                          label="Disk Space Alert (%)"
                          type="number"
                          placeholder="85"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="memory_usage_alert_threshold"
                          label="Memory Alert (%)"
                          type="number"
                          placeholder="80"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="cpu_usage_alert_threshold"
                          label="CPU Alert (%)"
                          type="number"
                          placeholder="80"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <SelectFormInput
                          name="log_level"
                          label="Log Level"
                          control={control}
                          options={logLevelOptions}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="log_retention_days"
                          label="Log Retention (days)"
                          type="number"
                          placeholder="30"
                          control={control}
                        />
                      </Col>
                      <Col md={4}>
                        <TextFormInput
                          name="log_file_max_size_mb"
                          label="Max Log File Size (MB)"
                          type="number"
                          placeholder="100"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_audit_logging")}
                          />
                          <label className="form-check-label">Enable Audit Logging</label>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_performance_logging")}
                          />
                          <label className="form-check-label">Enable Performance Logging</label>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Business Settings */}
                {activeTab === "business" && (
                  <div>
                    <h6 className="mb-3">Business Logic Configuration</h6>
                    <Row>
                      <Col md={6}>
                        <TextFormInput
                          name="amenity_booking_advance_days"
                          label="Amenity Booking Advance Days"
                          type="number"
                          placeholder="7"
                          control={control}
                        />
                      </Col>
                      <Col md={6}>
                        <TextFormInput
                          name="visitor_pass_validity_hours"
                          label="Visitor Pass Validity (hours)"
                          type="number"
                          placeholder="24"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <TextFormInput
                          name="payment_grace_period_days"
                          label="Payment Grace Period (days)"
                          type="number"
                          placeholder="5"
                          control={control}
                        />
                      </Col>
                      <Col md={6}>
                        <TextFormInput
                          name="complaint_auto_escalation_hours"
                          label="Complaint Auto-Escalation (hours)"
                          type="number"
                          placeholder="48"
                          control={control}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("maintenance_auto_assignment")}
                          />
                          <label className="form-check-label">Auto-Assign Maintenance Requests</label>
                        </div>
                      </Col>
                      <Col md={6}>
                        <TextFormInput
                          name="webhook_timeout"
                          label="Webhook Timeout (seconds)"
                          type="number"
                          placeholder="30"
                          control={control}
                        />
                      </Col>
                    </Row>
                    
                    <h6 className="mb-3 mt-4">Advanced Features</h6>
                    <Row>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_analytics")}
                          />
                          <label className="form-check-label">Enable Analytics</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_machine_learning")}
                          />
                          <label className="form-check-label">Enable Machine Learning</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_real_time_sync")}
                          />
                          <label className="form-check-label">Enable Real-time Sync</label>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_mobile_push")}
                          />
                          <label className="form-check-label">Enable Mobile Push</label>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("enable_whatsapp_integration")}
                          />
                          <label className="form-check-label">Enable WhatsApp Integration</label>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Advanced Settings */}
                {activeTab === "advanced" && (
                  <div>
                    <h6 className="mb-3">Advanced System Configuration</h6>
                    
                    {/* Database Configuration */}
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle as="h6">Database Configuration</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <strong>Connection Pool Size</strong>
                              <div className="d-flex justify-content-between mt-1">
                                <span>{watchedValues.database_connection_pool_size || 0} configured connections</span>
                                <Badge bg="info">Configured</Badge>
                              </div>
                            </div>
                            <div className="mb-3">
                              <strong>Query Timeout</strong>
                              <div className="d-flex justify-content-between mt-1">
                                <span>{watchedValues.database_query_timeout || 0} ms</span>
                                <Badge bg="info">Configured</Badge>
                              </div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <strong>Upload Limit</strong>
                              <ProgressBar
                                now={Math.min(100, (Number(watchedValues.max_file_upload_size || 0) / 100) * 100)}
                                label={`${watchedValues.max_file_upload_size || 0} MB`}
                                variant="primary"
                              />
                            </div>
                            <div className="d-grid gap-2">
                              <Button variant="outline-primary" size="sm" onClick={() => router.push("/settings/system/overview")}>
                                <IconifyIcon icon="ri:pulse-line" className="me-1" />
                                Open Runtime Database Metrics
                              </Button>
                              <Button variant="outline-secondary" size="sm" onClick={() => router.push("/settings/general/integrations")}>
                                <IconifyIcon icon="ri:plug-line" className="me-1" />
                                Review Storage Integrations
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>

                    {/* Cache Configuration */}
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle as="h6">Cache Configuration</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md={8}>
                            <div className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span>Cache Provider</span>
                                <span className="fw-bold text-info">{watchedValues.cache_provider || "redis"}</span>
                              </div>
                              <ProgressBar now={100} variant="info" />
                            </div>
                            <div className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span>Cache TTL</span>
                                <span>{watchedValues.cache_ttl || 0} seconds</span>
                              </div>
                              <ProgressBar now={Math.min(100, Number(watchedValues.cache_ttl || 0) / 864)} variant="secondary" />
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="d-grid gap-2">
                              <Button variant="outline-primary" size="sm" onClick={() => router.push("/settings/system/overview")}>
                                <IconifyIcon icon="ri:pulse-line" className="me-1" />
                                View Runtime Cache Metrics
                              </Button>
                              <Button variant="outline-secondary" size="sm" onClick={() => router.push("/settings/general/system")}>
                                <IconifyIcon icon="ri:settings-4-line" className="me-1" />
                                Open System Config
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>

                    {/* Security Configuration */}
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle as="h6">Security Configuration</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Force SSL</span>
                            <Badge bg={watchedValues.force_ssl ? "success" : "warning"}>
                              {watchedValues.force_ssl ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Max Login Attempts</span>
                            <Badge bg="info">{watchedValues.max_login_attempts || 0}</Badge>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Session Timeout</span>
                            <Badge bg="info">{watchedValues.session_timeout || 0} minutes</Badge>
                          </div>
                        </div>
                        <Button variant="outline-primary" size="sm" className="w-100" onClick={() => router.push("/settings/admin/security")}>
                          <IconifyIcon icon="ri:shield-check-line" className="me-1" />
                          Open Security Policies
                        </Button>
                      </CardBody>
                    </Card>

                    {/* Environment Variables */}
                    <Card>
                      <CardHeader>
                        <CardTitle as="h6">Environment Configuration</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Alert variant="warning">
                          <IconifyIcon icon="ri:warning-line" className="me-1" />
                          Environment variables are managed in deployment platforms (Vercel/Render). This page does not read raw secret values.
                        </Alert>
                        <div className="table-responsive">
                          <Table size="sm">
                            <thead>
                              <tr>
                                <th>Variable</th>
                                <th>Purpose</th>
                                <th>Scope</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>DATABASE_URL</td>
                                <td>Primary database connection</td>
                                <td><Badge bg="secondary">Backend</Badge></td>
                              </tr>
                              <tr>
                                <td>SUPABASE_SERVICE_ROLE_KEY</td>
                                <td>Privileged Supabase operations</td>
                                <td><Badge bg="secondary">Backend</Badge></td>
                              </tr>
                              <tr>
                                <td>NEXTAUTH_SECRET</td>
                                <td>Session and auth signing</td>
                                <td><Badge bg="secondary">Superadmin</Badge></td>
                              </tr>
                              <tr>
                                <td>SMTP_PASSWORD</td>
                                <td>Email provider authentication</td>
                                <td><Badge bg="secondary">Backend</Badge></td>
                              </tr>
                              <tr>
                                <td>PAYMENT_CHARGE_CRON_API_KEY</td>
                                <td>Scheduled charge issuance protection</td>
                                <td><Badge bg="secondary">Backend</Badge></td>
                              </tr>
                              <tr>
                                <td>PAYOUT_AUTOMATION_API_KEY</td>
                                <td>Payout automation protection</td>
                                <td><Badge bg="secondary">Backend</Badge></td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                          <Button variant="outline-secondary" size="sm" onClick={() => router.push("/settings/general/integrations")}>
                            <IconifyIcon icon="ri:external-link-line" className="me-1" />
                            Review Integration Settings
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isDirty || updateSystemSettingsMutation.isPending}
                  >
                    {updateSystemSettingsMutation.isPending ? (
                      <span className="spinner-border spinner-border-sm me-1" />
                    ) : (
                      <IconifyIcon icon="ri:save-line" className="me-1" />
                    )}
                    Save Configuration
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>

    </>
  );
};

export default SystemConfigSettings;
