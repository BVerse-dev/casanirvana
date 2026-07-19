'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Form, Nav, NavItem, NavLink, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import CheckFormInput from '@/components/from/CheckFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useBulkUpdateSettings, useSettingsCategory } from '@/hooks/useSettings';

// Security settings validation schema
const securitySettingsSchema = yup.object({
  // Authentication
  enable_2fa: yup.boolean(),
  enforce_2fa_for_admins: yup.boolean(),
  login_attempts_limit: yup.number().min(3).max(20).required('Login attempt limit is required'),
  lockout_duration: yup.number().min(5).max(1440).required('Lockout duration is required'),
  session_timeout: yup.number().min(5).max(1440).required('Session timeout is required'),
  remember_me_duration: yup.number().min(1).max(90).required('Remember me duration is required'),
  
  // Password Policy
  min_password_length: yup.number().min(6).max(50).required('Minimum password length is required'),
  require_uppercase: yup.boolean(),
  require_lowercase: yup.boolean(),
  require_numbers: yup.boolean(),
  require_symbols: yup.boolean(),
  password_history: yup.number().min(0).max(24).required('Password history setting is required'),
  password_expiry_days: yup.number().min(0).max(365).required('Password expiry setting is required'),
  
  // API Security
  enable_api_rate_limiting: yup.boolean(),
  api_rate_limit: yup.number().min(10).max(1000).when('enable_api_rate_limiting', {
    is: true,
    then: (schema) => schema.required('API rate limit is required when rate limiting is enabled')
  }),
  api_rate_limit_window: yup.number().min(1).max(60).when('enable_api_rate_limiting', {
    is: true,
    then: (schema) => schema.required('Rate limit window is required when rate limiting is enabled')
  }),
  enable_cors: yup.boolean(),
  cors_allowed_origins: yup.string().when('enable_cors', {
    is: true, 
    then: (schema) => schema.required('CORS allowed origins are required when CORS is enabled')
  }),
  enable_api_logging: yup.boolean(),
  
  // Application Security
  enable_xss_protection: yup.boolean(),
  enable_csrf_protection: yup.boolean(),
  enable_clickjack_protection: yup.boolean(),
  enable_content_security_policy: yup.boolean(),
  enable_secure_cookies: yup.boolean(),
  
  // CAPTCHA & Bot Protection
  enable_captcha: yup.boolean(),
  captcha_type: yup.string().when('enable_captcha', {
    is: true,
    then: (schema) => schema.required('CAPTCHA type is required when CAPTCHA is enabled')
  }),
  enable_bot_detection: yup.boolean(),
  
  // Audit & Monitoring
  enable_audit_logging: yup.boolean(),
  audit_log_retention_days: yup.number().min(7).max(730).when('enable_audit_logging', {
    is: true,
    then: (schema) => schema.required('Audit log retention period is required when audit logging is enabled')
  }),
  enable_anomaly_detection: yup.boolean(),
  
  // Emergency Access
  emergency_access_email: yup.string().email('Must be a valid email'),
  enable_emergency_lockdown: yup.boolean(),
});

type SecuritySettingsFormData = yup.InferType<typeof securitySettingsSchema>;

const defaultSecuritySettings: SecuritySettingsFormData = {
  // Authentication
  enable_2fa: false,
  enforce_2fa_for_admins: false,
  login_attempts_limit: 5,
  lockout_duration: 30,
  session_timeout: 120,
  remember_me_duration: 14,

  // Password Policy
  min_password_length: 8,
  require_uppercase: true,
  require_lowercase: true,
  require_numbers: true,
  require_symbols: false,
  password_history: 5,
  password_expiry_days: 90,

  // API Security
  enable_api_rate_limiting: true,
  api_rate_limit: 100,
  api_rate_limit_window: 15,
  enable_cors: true,
  cors_allowed_origins: '*',
  enable_api_logging: true,

  // Application Security
  enable_xss_protection: true,
  enable_csrf_protection: true,
  enable_clickjack_protection: true,
  enable_content_security_policy: true,
  enable_secure_cookies: true,

  // CAPTCHA & Bot Protection
  enable_captcha: false,
  captcha_type: 'recaptcha',
  enable_bot_detection: true,

  // Audit & Monitoring
  enable_audit_logging: true,
  audit_log_retention_days: 90,
  enable_anomaly_detection: true,

  // Emergency Access
  emergency_access_email: 'security@casanirvana.com',
  enable_emergency_lockdown: false,
};

const normalizeSecuritySettings = (
  settings: Record<string, unknown> | undefined
): SecuritySettingsFormData => ({
  ...defaultSecuritySettings,
  ...(settings || {}),
});

const SecuritySettingsPage = () => {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('authentication');
  const [securityScore, setSecurityScore] = useState(65); // Initial security score
  const { data: settingsData, isLoading: isLoadingSettings, error: settingsError } = useSettingsCategory('security', 'admin_security');
  const updateSettingsMutation = useBulkUpdateSettings();

  // Initialize form with react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<SecuritySettingsFormData>({
    resolver: yupResolver(securitySettingsSchema),
    defaultValues: defaultSecuritySettings
  });

  useEffect(() => {
    if (!settingsData) {
      return;
    }

    reset(normalizeSecuritySettings(settingsData));
  }, [settingsData, reset]);
  const hasStoredSettings = Boolean(settingsData && Object.keys(settingsData).length > 0);

  // Watch for changes to calculate security score
  const watchedValues = watch();
  
  // Calculate security score when form values change
  useEffect(() => {
    let score = 0;
    
    // Authentication checks
    if (watchedValues.enable_2fa) score += 10;
    if (watchedValues.enforce_2fa_for_admins) score += 5;
    if (watchedValues.login_attempts_limit < 6) score += 5;
    if (watchedValues.session_timeout < 60) score += 5;
    
    // Password policy checks
    if (watchedValues.min_password_length >= 12) score += 10;
    else if (watchedValues.min_password_length >= 8) score += 5;
    
    if (watchedValues.require_uppercase) score += 5;
    if (watchedValues.require_lowercase) score += 5;
    if (watchedValues.require_numbers) score += 5; 
    if (watchedValues.require_symbols) score += 5;
    
    if (watchedValues.password_expiry_days > 0 && watchedValues.password_expiry_days <= 90) score += 5;
    if (watchedValues.password_history >= 5) score += 5;
    
    // API security
    if (watchedValues.enable_api_rate_limiting) score += 5;
    if (watchedValues.enable_api_logging) score += 5;
    if (watchedValues.enable_cors && watchedValues.cors_allowed_origins !== '*') score += 5;
    
    // Application security
    if (watchedValues.enable_csrf_protection) score += 5;
    if (watchedValues.enable_xss_protection) score += 5;
    if (watchedValues.enable_content_security_policy) score += 5;
    if (watchedValues.enable_secure_cookies) score += 5;
    
    // CAPTCHA & bot protection
    if (watchedValues.enable_captcha) score += 5;
    if (watchedValues.enable_bot_detection) score += 5;
    
    // Audit & monitoring
    if (watchedValues.enable_audit_logging) score += 5;
    if (watchedValues.enable_anomaly_detection) score += 5;
    
    // Cap the score at 100
    score = Math.min(score, 100);
    
    setSecurityScore(score);
  }, [watchedValues]);

  const getScoreVariant = () => {
    if (securityScore >= 80) return 'success';
    if (securityScore >= 60) return 'warning';
    return 'danger';
  };

  const onSubmit = async (data: SecuritySettingsFormData) => {
    try {
      await updateSettingsMutation.mutateAsync({
        category: 'security',
        subcategory: 'admin_security',
        settings: data,
      });
      
      setShowAlert({ type: 'success', message: 'Security settings updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error updating security settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update security settings. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  if (settingsError && !settingsData) {
    return (
      <>
        <PageTitle subName="Identity & Access" title="Security Policies" />
        <Card>
          <CardBody>
            <Alert variant="danger" className="mb-0">
              <IconifyIcon icon="ri:error-warning-line" className="me-2" />
              Failed to load admin security settings. Fix the backend connection and reload this page before making changes.
            </Alert>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Identity & Access" title="Security Policies" />
      
      <div className="container-xxl">
        {showAlert && (
          <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)} className="mb-3">
            <IconifyIcon 
              icon={showAlert.type === 'success' ? 'ri:check-line' : 'ri:error-warning-line'} 
              className="me-2" 
            />
            {showAlert.message}
          </Alert>
        )}

        {!isLoadingSettings && !hasStoredSettings && (
          <Alert variant="info" className="mb-3">
            <IconifyIcon icon="ri:information-line" className="me-2" />
            No saved admin security settings were found yet. You are editing the platform defaults for first-time setup.
          </Alert>
        )}
        
        {isLoadingSettings && (
          <Card className="mb-4">
            <CardBody className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading security settings...</p>
            </CardBody>
          </Card>
        )}

        {isLoadingSettings ? (
          <Card className="mb-4">
            <CardBody className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading security settings...</p>
            </CardBody>
          </Card>
        ) : (
        <>
        {/* Security Strength Indicator */}
        <Card className="mb-4">
          <CardBody>
            <Row className="align-items-center">
              <Col md={6}>
                <h5 className="mb-0 d-flex align-items-center">
                  <IconifyIcon icon="ri:shield-keyhole-line" className="me-2" />
                  Security Score: 
                  <Badge bg={getScoreVariant()} className="ms-2 fs-6">
                    {securityScore}/100
                  </Badge>
                </h5>
              </Col>
              <Col md={6}>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar bg-${getScoreVariant()}`} 
                    role="progressbar" 
                    style={{ width: `${securityScore}%` }} 
                    aria-valuenow={securityScore} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-muted">Weak</small>
                  <small className="text-muted">Strong</small>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <Nav variant="tabs" className="nav-bordered">
                <NavItem>
                  <NavLink
                    href="#"
                    className={activeTab === 'authentication' ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('authentication');
                    }}
                  >
                    <IconifyIcon icon="heroicons:shield-check" className="me-1" />
                    Authentication
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={activeTab === 'password' ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('password');
                    }}
                  >
                    <IconifyIcon icon="heroicons:key" className="me-1" />
                    Password Policy
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={activeTab === 'api' ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('api');
                    }}
                  >
                    <IconifyIcon icon="heroicons:code-bracket" className="me-1" />
                    API Security
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={activeTab === 'application' ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('application');
                    }}
                  >
                    <IconifyIcon icon="heroicons:window" className="me-1" />
                    Application Security
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={activeTab === 'audit' ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('audit');
                    }}
                  >
                    <IconifyIcon icon="heroicons:clipboard-document-list" className="me-1" />
                    Audit & Monitoring
                  </NavLink>
                </NavItem>
              </Nav>
            </CardHeader>

            <CardBody>
              {activeTab === 'authentication' && (
                <div>
                  <div className="mb-4">
                    <h5 className="mb-1">Authentication & Access Control</h5>
                    <p className="text-muted mb-3">Configure authentication methods, session settings, and access control policies</p>
                  </div>

                  <Row>
                    <Col lg={6}>
                      <Card className="border mb-4">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Multi-Factor Authentication</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_2fa"
                              control={control}
                              label="Enable Two-Factor Authentication"
                              id="enable_2fa"
                            />
                            <small className="text-muted d-block mt-1">
                              Require 2FA for all users accessing sensitive information
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enforce_2fa_for_admins"
                              control={control}
                              label="Enforce 2FA for Admin Users"
                              id="enforce_2fa_for_admins"
                            />
                            <small className="text-muted d-block mt-1">
                              Make 2FA mandatory for all administrator accounts
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                      
                      <Card className="border">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Session Management</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <TextFormInput
                              name="session_timeout"
                              control={control}
                              label="Session Timeout (minutes)"
                              type="number"
                              placeholder="120"
                            />
                            <small className="text-muted d-block mt-1">
                              Automatically log out users after this period of inactivity
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <TextFormInput
                              name="remember_me_duration"
                              control={control}
                              label="Remember Me Duration (days)"
                              type="number"
                              placeholder="14"
                            />
                            <small className="text-muted d-block mt-1">
                              How long to keep users logged in when using &quot;Remember Me&quot;
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                    
                    <Col lg={6}>
                      <Card className="border mb-4">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Login Protection</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <TextFormInput
                              name="login_attempts_limit"
                              control={control}
                              label="Maximum Login Attempts"
                              type="number"
                              placeholder="5"
                            />
                            <small className="text-muted d-block mt-1">
                              Number of failed attempts before account is temporarily locked
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <TextFormInput
                              name="lockout_duration"
                              control={control}
                              label="Account Lockout Duration (minutes)"
                              type="number"
                              placeholder="30"
                            />
                            <small className="text-muted d-block mt-1">
                              How long accounts remain locked after too many failed login attempts
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                      
                      <Card className="border">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Emergency Access</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <TextFormInput
                              name="emergency_access_email"
                              control={control}
                              label="Emergency Contact Email"
                              type="email"
                              placeholder="security@casanirvana.com"
                            />
                            <small className="text-muted d-block mt-1">
                              Email to notify in case of security incidents
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_emergency_lockdown"
                              control={control}
                              label="Enable Emergency Lockdown Option"
                              id="enable_emergency_lockdown"
                            />
                            <small className="text-muted d-block mt-1">
                              Allow emergency lockdown of all access during security incidents
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <div className="mb-4">
                    <h5 className="mb-1">Password Policy</h5>
                    <p className="text-muted mb-3">Define password complexity requirements and security policies</p>
                  </div>

                  <Row>
                    <Col lg={6}>
                      <Card className="border mb-4">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Password Complexity</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <TextFormInput
                              name="min_password_length"
                              control={control}
                              label="Minimum Password Length"
                              type="number"
                              placeholder="8"
                            />
                          </div>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="require_uppercase"
                              control={control}
                              label="Require Uppercase Letters"
                              id="require_uppercase"
                            />
                          </div>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="require_lowercase"
                              control={control}
                              label="Require Lowercase Letters"
                              id="require_lowercase"
                            />
                          </div>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="require_numbers"
                              control={control}
                              label="Require Numbers"
                              id="require_numbers"
                            />
                          </div>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="require_symbols"
                              control={control}
                              label="Require Special Characters"
                              id="require_symbols"
                            />
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                    
                    <Col lg={6}>
                      <Card className="border">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Password Management</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <TextFormInput
                              name="password_expiry_days"
                              control={control}
                              label="Password Expiry (days)"
                              type="number"
                              placeholder="90"
                            />
                            <small className="text-muted d-block mt-1">
                              Number of days before passwords expire and must be changed (0 = never)
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <TextFormInput
                              name="password_history"
                              control={control}
                              label="Password History"
                              type="number"
                              placeholder="5"
                            />
                            <small className="text-muted d-block mt-1">
                              Number of previous passwords that cannot be reused (0 = disabled)
                            </small>
                          </div>
                          
                          <div className="mt-4">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              type="button"
                              onClick={() => router.push('/settings/admin/users')}
                            >
                              <IconifyIcon icon="heroicons:arrow-path" className="me-1" />
                              Open Admin User Security Controls
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'api' && (
                <div>
                  <div className="mb-4">
                    <h5 className="mb-1">API Security</h5>
                    <p className="text-muted mb-3">Configure API security and access control settings</p>
                  </div>

                  <Row>
                    <Col lg={6}>
                      <Card className="border mb-4">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Rate Limiting</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_api_rate_limiting"
                              control={control}
                              label="Enable API Rate Limiting"
                              id="enable_api_rate_limiting"
                            />
                          </div>
                          
                          {watch('enable_api_rate_limiting') && (
                            <>
                              <div className="mb-3">
                                <TextFormInput
                                  name="api_rate_limit"
                                  control={control}
                                  label="API Request Limit"
                                  type="number"
                                  placeholder="100"
                                />
                                <small className="text-muted d-block mt-1">
                                  Maximum number of requests allowed per time window
                                </small>
                              </div>
                              
                              <div className="mb-3">
                                <TextFormInput
                                  name="api_rate_limit_window"
                                  control={control}
                                  label="Time Window (minutes)"
                                  type="number"
                                  placeholder="15"
                                />
                                <small className="text-muted d-block mt-1">
                                  Time period for rate limit calculation
                                </small>
                              </div>
                            </>
                          )}
                        </CardBody>
                      </Card>
                      
                      <Card className="border">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">API Logging</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_api_logging"
                              control={control}
                              label="Enable API Logging"
                              id="enable_api_logging"
                            />
                            <small className="text-muted d-block mt-1">
                              Log all API requests for security auditing
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                    
                    <Col lg={6}>
                      <Card className="border">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">CORS Settings</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_cors"
                              control={control}
                              label="Enable CORS"
                              id="enable_cors"
                            />
                          </div>
                          
                          {watch('enable_cors') && (
                            <div className="mb-3">
                              <TextFormInput
                                name="cors_allowed_origins"
                                control={control}
                                label="Allowed Origins"
                                placeholder="https://casanirvana.app,https://admin.casanirvana.app"
                              />
                              <small className="text-muted d-block mt-1">
                                Comma-separated list of allowed origins. Use * for all origins (not recommended for production)
                              </small>
                            </div>
                          )}
                          
                          <div className="mt-4">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              type="button"
                              onClick={() => router.push('/settings/general/integrations')}
                            >
                              <IconifyIcon icon="heroicons:key" className="me-1" />
                              Open Integration Credentials
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
              
              {activeTab === 'application' && (
                <div>
                  <div className="mb-4">
                    <h5 className="mb-1">Application Security</h5>
                    <p className="text-muted mb-3">Configure security headers, CSRF protection, and other application security features</p>
                  </div>

                  <Row>
                    <Col lg={6}>
                      <Card className="border mb-4">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">HTTP Security Headers</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_xss_protection"
                              control={control}
                              label="Enable XSS Protection"
                              id="enable_xss_protection"
                            />
                            <small className="text-muted d-block mt-1">
                              Set X-XSS-Protection header to prevent cross-site scripting
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_clickjack_protection"
                              control={control}
                              label="Enable Clickjacking Protection"
                              id="enable_clickjack_protection"
                            />
                            <small className="text-muted d-block mt-1">
                              Set X-Frame-Options header to prevent clickjacking
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_content_security_policy"
                              control={control}
                              label="Enable Content Security Policy"
                              id="enable_content_security_policy"
                            />
                            <small className="text-muted d-block mt-1">
                              Set Content-Security-Policy header to control allowed content sources
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                    
                    <Col lg={6}>
                      <Card className="border mb-4">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">CSRF & Cookie Security</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_csrf_protection"
                              control={control}
                              label="Enable CSRF Protection"
                              id="enable_csrf_protection"
                            />
                            <small className="text-muted d-block mt-1">
                              Protect against Cross-Site Request Forgery attacks
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_secure_cookies"
                              control={control}
                              label="Enable Secure Cookies"
                              id="enable_secure_cookies"
                            />
                            <small className="text-muted d-block mt-1">
                              Set Secure and HttpOnly flags on cookies
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                      
                      <Card className="border">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Bot Protection</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_captcha"
                              control={control}
                              label="Enable CAPTCHA"
                              id="enable_captcha"
                            />
                          </div>
                          
                          {watch('enable_captcha') && (
                            <div className="mb-3">
                              <SelectFormInput
                                name="captcha_type"
                                control={control}
                                label="CAPTCHA Type"
                                options={[
                                  { value: 'recaptcha', label: 'Google reCAPTCHA' },
                                  { value: 'hcaptcha', label: 'hCaptcha' },
                                  { value: 'turnstile', label: 'Cloudflare Turnstile' }
                                ]}
                              />
                            </div>
                          )}
                          
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_bot_detection"
                              control={control}
                              label="Enable Bot Detection"
                              id="enable_bot_detection"
                            />
                            <small className="text-muted d-block mt-1">
                              Use behavioral analysis to detect and block bot activity
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'audit' && (
                <div>
                  <div className="mb-4">
                    <h5 className="mb-1">Audit & Monitoring</h5>
                    <p className="text-muted mb-3">Configure audit logging, security monitoring, and anomaly detection</p>
                  </div>

                  <Row>
                    <Col lg={6}>
                      <Card className="border mb-4">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Audit Logging</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_audit_logging"
                              control={control}
                              label="Enable Audit Logging"
                              id="enable_audit_logging"
                            />
                            <small className="text-muted d-block mt-1">
                              Log all security-related events for audit purposes
                            </small>
                          </div>
                          
                          {watch('enable_audit_logging') && (
                            <div className="mb-3">
                              <TextFormInput
                                name="audit_log_retention_days"
                                control={control}
                                label="Log Retention Period (days)"
                                type="number"
                                placeholder="90"
                              />
                              <small className="text-muted d-block mt-1">
                                Number of days to retain audit logs
                              </small>
                            </div>
                          )}
                          
                          <div className="mt-4">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              type="button"
                              onClick={() => router.push('/settings/users/activity')}
                            >
                              <IconifyIcon icon="heroicons:document-magnifying-glass" className="me-1" />
                              Open Activity Logs
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                    
                    <Col lg={6}>
                      <Card className="border">
                        <CardHeader className="bg-light">
                          <h5 className="mb-0">Security Monitoring</h5>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <CheckFormInput
                              type="switch"
                              name="enable_anomaly_detection"
                              control={control}
                              label="Enable Anomaly Detection"
                              id="enable_anomaly_detection"
                            />
                            <small className="text-muted d-block mt-1">
                              Detect unusual login patterns and potential security threats
                            </small>
                          </div>
                          
                          <div className="mt-4">
                            <Button 
                              variant="outline-warning"
                              size="sm"
                              type="button"
                              onClick={() => router.push('/settings/system/overview')}
                              className="me-2"
                            >
                              <IconifyIcon icon="heroicons:bell-alert" className="me-1" />
                              Open Security Alerts
                            </Button>
                            
                            <Button 
                              variant="outline-danger"
                              size="sm"
                              type="button"
                              onClick={() => router.push('/settings/system/overview')}
                            >
                              <IconifyIcon icon="heroicons:shield-exclamation" className="me-1" />
                              Open System Security Overview
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
            </CardBody>

            <div className="card-footer bg-light border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  <small>
                    <IconifyIcon icon="heroicons:information-circle" className="me-1" />
                    Changes are applied immediately when you save the settings
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => reset()}
                    disabled={!isDirty || isSubmitting}
                    type="button"
                  >
                    <IconifyIcon icon="heroicons:arrow-path" className="me-1" />
                    Reset Changes
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="heroicons:check" className="me-1" />
                        Save Security Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Form>
        </>
        )}
      </div>
    </>
  );
};

export default SecuritySettingsPage;
