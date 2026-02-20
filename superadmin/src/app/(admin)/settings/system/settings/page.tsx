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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "react-bootstrap";
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
  { value: 'textlocal', label: 'TextLocal' },
  { value: 'msg91', label: 'MSG91' },
];

const SystemConfigSettings = () => {
  const { data: systemSettingsData, isLoading } = useSystemSettings();
  const updateSystemSettingsMutation = useUpdateSystemSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 67,
    disk: 34,
    network: 23,
    uptime: "15d 7h 32m",
    connections: 156,
  });
  const [logs, setLogs] = useState([
    { timestamp: "2024-01-20 14:30:25", level: "INFO", message: "System health check completed successfully", module: "Health" },
    { timestamp: "2024-01-20 14:25:12", level: "WARN", message: "High memory usage detected - 87%", module: "Monitor" },
    { timestamp: "2024-01-20 14:20:08", level: "INFO", message: "Backup completed successfully", module: "Backup" },
    { timestamp: "2024-01-20 14:15:03", level: "ERROR", message: "Failed to send SMS notification", module: "SMS" },
  ]);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(95, prev.memory + (Math.random() - 0.5) * 8)),
        network: Math.max(5, Math.min(80, prev.network + (Math.random() - 0.5) * 15)),
        connections: Math.max(50, Math.min(500, prev.connections + Math.floor((Math.random() - 0.5) * 20))),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const {
    control,
    handleSubmit,
    reset,
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
    { label: "Database Status", status: "operational", icon: "ri:database-2-line", details: "Connected - 45ms latency" },
    { label: "Email Service", status: "operational", icon: "ri:mail-line", details: "Queue: 12 pending" },
    { label: "SMS Service", status: "degraded", icon: "ri:message-2-line", details: "High latency detected" },
    { label: "Push Notifications", status: "operational", icon: "ri:notification-3-line", details: "All channels active" },
    { label: "File Storage", status: "operational", icon: "ri:folder-cloud-line", details: "34% used (156GB)" },
    { label: "Backup System", status: "operational", icon: "ri:save-line", details: "Last backup: 2h ago" },
    { label: "Cache System", status: "operational", icon: "ri:refresh-line", details: "Redis - 89% hit rate" },
    { label: "Security Scanner", status: "operational", icon: "ri:shield-check-line", details: "No threats detected" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge bg="success">Operational</Badge>;
      case "degraded":
        return <Badge bg="warning">Degraded</Badge>;
      case "down":
        return <Badge bg="danger">Down</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const handleClearCache = async () => {
    try {
      toast.success("Cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cache");
    }
  };

  const handleRunBackup = async () => {
    try {
      toast.success("Backup initiated successfully");
      setShowBackupModal(false);
    } catch (error) {
      toast.error("Failed to initiate backup");
    }
  };

  const handleSystemMaintenance = async () => {
    try {
      toast.success("System maintenance scheduled");
      setShowMaintenanceModal(false);
    } catch (error) {
      toast.error("Failed to schedule maintenance");
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

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="page-title">System Configuration</h4>
          <p className="text-muted mb-0">Configure system-wide settings and monitor system health</p>
        </div>
      </div>

      <Row>
        {/* System Status */}
        <Col xl={4}>
          {/* System Health */}
          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h6">System Health</CardTitle>
              <Dropdown>
                <DropdownToggle variant="outline-secondary" size="sm">
                  <IconifyIcon icon="ri:more-line" />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => setShowLogsModal(true)}>
                    <IconifyIcon icon="ri:file-list-line" className="me-2" />
                    View Logs
                  </DropdownItem>
                  <DropdownItem onClick={() => setShowBackupModal(true)}>
                    <IconifyIcon icon="ri:save-line" className="me-2" />
                    Run Backup
                  </DropdownItem>
                  <DropdownItem onClick={() => setShowMaintenanceModal(true)}>
                    <IconifyIcon icon="ri:tools-line" className="me-2" />
                    Maintenance
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

          {/* Real-time Metrics */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h6">System Metrics</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">CPU Usage</span>
                  <span className="fw-medium">{systemMetrics.cpu.toFixed(1)}%</span>
                </div>
                <ProgressBar 
                  now={systemMetrics.cpu} 
                  variant={systemMetrics.cpu > 80 ? "danger" : systemMetrics.cpu > 60 ? "warning" : "success"} 
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Memory Usage</span>
                  <span className="fw-medium">{systemMetrics.memory.toFixed(1)}%</span>
                </div>
                <ProgressBar 
                  now={systemMetrics.memory} 
                  variant={systemMetrics.memory > 85 ? "danger" : systemMetrics.memory > 70 ? "warning" : "info"} 
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Disk Usage</span>
                  <span className="fw-medium">{systemMetrics.disk}%</span>
                </div>
                <ProgressBar now={systemMetrics.disk} variant="primary" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Network I/O</span>
                  <span className="fw-medium">{systemMetrics.network.toFixed(1)}%</span>
                </div>
                <ProgressBar now={systemMetrics.network} variant="secondary" />
              </div>
              <hr />
              <div className="row text-center">
                <div className="col-6">
                  <div className="text-muted small">Uptime</div>
                  <div className="fw-medium">{systemMetrics.uptime}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Connections</div>
                  <div className="fw-medium">{systemMetrics.connections}</div>
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
                <Button variant="outline-primary" size="sm" onClick={handleClearCache}>
                  <IconifyIcon icon="ri:refresh-line" className="me-1" />
                  Clear Cache
                </Button>
                <Button variant="outline-info" size="sm" onClick={() => setShowBackupModal(true)}>
                  <IconifyIcon icon="ri:download-line" className="me-1" />
                  Create Backup
                </Button>
                <Button variant="outline-warning" size="sm" onClick={() => setShowMaintenanceModal(true)}>
                  <IconifyIcon icon="ri:tools-line" className="me-1" />
                  System Maintenance
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setShowLogsModal(true)}>
                  <IconifyIcon icon="ri:file-list-line" className="me-1" />
                  View System Logs
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
                            {...control.register("debug_mode")}
                          />
                          <label className="form-check-label">Debug Mode</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...control.register("maintenance_mode")}
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
                            {...control.register("enable_two_factor")}
                          />
                          <label className="form-check-label">Enable Two-Factor Auth</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...control.register("force_ssl")}
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
                            {...control.register("notification_email_enabled")}
                          />
                          <label className="form-check-label">Enable Email Notifications</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...control.register("notification_sms_enabled")}
                          />
                          <label className="form-check-label">Enable SMS Notifications</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...control.register("notification_push_enabled")}
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
                            {...control.register("enable_system_monitoring")}
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
                            {...control.register("enable_audit_logging")}
                          />
                          <label className="form-check-label">Enable Audit Logging</label>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...control.register("enable_performance_logging")}
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
                            {...control.register("maintenance_auto_assignment")}
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
                            {...control.register("enable_analytics")}
                          />
                          <label className="form-check-label">Enable Analytics</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...control.register("enable_machine_learning")}
                          />
                          <label className="form-check-label">Enable Machine Learning</label>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...control.register("enable_real_time_sync")}
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
                            {...control.register("enable_mobile_push")}
                          />
                          <label className="form-check-label">Enable Mobile Push</label>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...control.register("enable_whatsapp_integration")}
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
                    
                    {/* Database Management */}
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle as="h6">Database Management</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <strong>Connection Pool Status:</strong>
                              <div className="d-flex justify-content-between mt-1">
                                <span>Active: 15/20</span>
                                <Badge bg="success">Healthy</Badge>
                              </div>
                            </div>
                            <div className="mb-3">
                              <strong>Query Performance:</strong>
                              <div className="d-flex justify-content-between mt-1">
                                <span>Avg Response: 45ms</span>
                                <Badge bg="info">Good</Badge>
                              </div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <strong>Storage Usage:</strong>
                              <ProgressBar now={67} label="67%" variant="primary" />
                            </div>
                            <div className="d-grid gap-2">
                              <Button variant="outline-primary" size="sm">
                                <IconifyIcon icon="ri:database-line" className="me-1" />
                                Optimize Tables
                              </Button>
                              <Button variant="outline-warning" size="sm">
                                <IconifyIcon icon="ri:refresh-line" className="me-1" />
                                Rebuild Indexes
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>

                    {/* Cache Management */}
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle as="h6">Cache Management</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <Col md={8}>
                            <div className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span>Cache Hit Rate</span>
                                <span className="fw-bold text-success">89.2%</span>
                              </div>
                              <ProgressBar now={89.2} variant="success" />
                            </div>
                            <div className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span>Memory Usage</span>
                                <span>156 MB / 512 MB</span>
                              </div>
                              <ProgressBar now={30.4} variant="info" />
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="d-grid gap-2">
                              <Button variant="outline-danger" size="sm" onClick={handleClearCache}>
                                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                Clear All Cache
                              </Button>
                              <Button variant="outline-secondary" size="sm">
                                <IconifyIcon icon="ri:restart-line" className="me-1" />
                                Restart Cache
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>

                    {/* Security Audit */}
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle as="h6">Security Audit</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Last Security Scan:</span>
                            <Badge bg="success">2 hours ago</Badge>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Failed Login Attempts (24h):</span>
                            <Badge bg="warning">12</Badge>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Active Sessions:</span>
                            <Badge bg="info">234</Badge>
                          </div>
                        </div>
                        <Button variant="outline-primary" size="sm" className="w-100">
                          <IconifyIcon icon="ri:scan-line" className="me-1" />
                          Run Security Scan
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
                          Environment variables are managed through secure deployment processes.
                        </Alert>
                        <div className="table-responsive">
                          <Table size="sm">
                            <thead>
                              <tr>
                                <th>Variable</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>DATABASE_URL</td>
                                <td><Badge bg="success">Set</Badge></td>
                                <td>2024-01-15</td>
                              </tr>
                              <tr>
                                <td>REDIS_URL</td>
                                <td><Badge bg="success">Set</Badge></td>
                                <td>2024-01-15</td>
                              </tr>
                              <tr>
                                <td>JWT_SECRET</td>
                                <td><Badge bg="success">Set</Badge></td>
                                <td>2024-01-10</td>
                              </tr>
                              <tr>
                                <td>SMTP_PASSWORD</td>
                                <td><Badge bg="warning">Missing</Badge></td>
                                <td>-</td>
                              </tr>
                            </tbody>
                          </Table>
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

      {/* Modals */}
      {/* Backup Modal */}
      <Modal show={showBackupModal} onHide={() => setShowBackupModal(false)}>
        <ModalHeader closeButton>
          <h5>System Backup</h5>
        </ModalHeader>
        <ModalBody>
          <p>This will create a complete system backup including:</p>
          <ul>
            <li>Database snapshot</li>
            <li>Configuration files</li>
            <li>User uploaded files</li>
            <li>System logs</li>
          </ul>
          <Alert variant="info">
            <IconifyIcon icon="ri:information-line" className="me-1" />
            Backup process may take 5-10 minutes depending on data size.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowBackupModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRunBackup}>
            <IconifyIcon icon="ri:download-line" className="me-1" />
            Start Backup
          </Button>
        </ModalFooter>
      </Modal>

      {/* Logs Modal */}
      <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} size="lg">
        <ModalHeader closeButton>
          <h5>System Logs</h5>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Row>
              <Col md={4}>
                <Form.Select size="sm">
                  <option>All Levels</option>
                  <option>Error</option>
                  <option>Warning</option>
                  <option>Info</option>
                  <option>Debug</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Select size="sm">
                  <option>All Modules</option>
                  <option>Auth</option>
                  <option>Database</option>
                  <option>API</option>
                  <option>Backup</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Button variant="outline-primary" size="sm" className="w-100">
                  <IconifyIcon icon="ri:refresh-line" className="me-1" />
                  Refresh
                </Button>
              </Col>
            </Row>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table striped size="sm">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Level</th>
                  <th>Module</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '0.8rem' }}>{log.timestamp}</td>
                    <td>
                      <Badge 
                        bg={log.level === 'ERROR' ? 'danger' : log.level === 'WARN' ? 'warning' : 'info'}
                      >
                        {log.level}
                      </Badge>
                    </td>
                    <td>{log.module}</td>
                    <td style={{ fontSize: '0.9rem' }}>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline-secondary" size="sm">
            <IconifyIcon icon="ri:download-line" className="me-1" />
            Export Logs
          </Button>
          <Button variant="secondary" onClick={() => setShowLogsModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Maintenance Modal */}
      <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)}>
        <ModalHeader closeButton>
          <h5>System Maintenance</h5>
        </ModalHeader>
        <ModalBody>
          <p>Schedule system maintenance tasks:</p>
          <div className="mb-3">
            <Form.Check 
              type="checkbox" 
              label="Database optimization" 
              defaultChecked 
            />
            <Form.Check 
              type="checkbox" 
              label="Clear temporary files" 
              defaultChecked 
            />
            <Form.Check 
              type="checkbox" 
              label="Update search indexes" 
            />
            <Form.Check 
              type="checkbox" 
              label="Compress old logs" 
            />
          </div>
          <Alert variant="warning">
            <IconifyIcon icon="ri:warning-line" className="me-1" />
            Maintenance tasks may cause brief service interruptions.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleSystemMaintenance}>
            <IconifyIcon icon="ri:tools-line" className="me-1" />
            Schedule Maintenance
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SystemConfigSettings;
