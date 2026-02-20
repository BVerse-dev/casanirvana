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
import { useSecurityPrivacyConfig, SecurityPrivacyConfigData } from '@/hooks/useSecurityPrivacyConfig';

// Form validation schema
const securityConfigSchema = yup.object({
  terms_url: yup.string().url('Invalid URL').required('Terms URL is required'),
  privacy_url: yup.string().url('Invalid URL').required('Privacy URL is required'),
  refund_policy_url: yup.string().url('Invalid URL').optional(),
  data_retention_policy_url: yup.string().url('Invalid URL').optional(),
  password_min_length: yup.number().min(6, 'Must be at least 6 characters').max(32, 'Cannot exceed 32 characters').required('Password minimum length is required'),
  password_require_uppercase: yup.boolean().default(false),
  password_require_lowercase: yup.boolean().default(false),
  password_require_numbers: yup.boolean().default(false),
  password_require_symbols: yup.boolean().default(false),
  login_attempt_limit: yup.number().min(3, 'Must be at least 3').max(10, 'Cannot exceed 10').required('Login attempt limit is required'),
  account_lockout_duration_minutes: yup.number().min(5, 'Must be at least 5 minutes').max(1440, 'Cannot exceed 24 hours').required('Account lockout duration is required'),
  two_factor_auth_enabled: yup.boolean().default(false),
  data_encryption_enabled: yup.boolean().default(false),
  gdpr_compliance_enabled: yup.boolean().default(false),
  data_retention_days: yup.number().min(30, 'Must be at least 30 days').max(2555, 'Cannot exceed 7 years').required('Data retention days is required'),
});

const SecurityConfigPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
  // Use the Supabase hook for real data
  const { data: configData, isLoading: isLoadingData, error: dataError, updateConfig, isUpdating } = useSecurityPrivacyConfig();

  const { control, handleSubmit, reset, watch, formState: { isDirty, isSubmitting } } = useForm<SecurityPrivacyConfigData>({
    resolver: yupResolver(securityConfigSchema),
    defaultValues: configData || {
      terms_url: '',
      privacy_url: '',
      refund_policy_url: '',
      data_retention_policy_url: '',
      password_min_length: 8,
      password_require_uppercase: true,
      password_require_lowercase: true,
      password_require_numbers: true,
      password_require_symbols: false,
      login_attempt_limit: 5,
      account_lockout_duration_minutes: 30,
      two_factor_auth_enabled: true,
      data_encryption_enabled: true,
      gdpr_compliance_enabled: true,
      data_retention_days: 1095,
    },
  });

  const watchTwoFactorAuth = watch('two_factor_auth_enabled');
  const watchDataEncryption = watch('data_encryption_enabled');

  // Update form when data is loaded
  useEffect(() => {
    if (configData) {
      reset(configData);
    }
  }, [configData, reset]);

  // Show error alert if data loading fails
  useEffect(() => {
    if (dataError) {
      setShowAlert({ 
        type: 'danger', 
        message: `Failed to load configuration: ${dataError.message}` 
      });
    }
  }, [dataError]);

  const onSubmit = async (data: SecurityPrivacyConfigData) => {
    try {
      await updateConfig(data);
      setShowAlert({ type: 'success', message: 'Security & Privacy configuration updated successfully!' });
    } catch (error: any) {
      console.error('Error updating security config:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update security configuration. Please try again.' });
    }
  };

  return (
    <>
      <PageTitle title="Security & Privacy" subName="General Settings" />
      
      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          {showAlert.message}
        </Alert>
      )}

      {isLoadingData ? (
        <Card>
          <CardBody className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading security configuration...</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <CardTitle as="h5" className="mb-1">Security & Privacy Configuration</CardTitle>
                <p className="text-muted mb-0">
                  Configure security policies, privacy settings, and compliance requirements
                </p>
              </div>
              <IconifyIcon icon="material-symbols:security" className="text-danger fs-2" />
            </div>
          </CardHeader>
          <CardBody>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Legal & Compliance URLs */}
            <div className="mb-4">
              <h6 className="mb-3 text-primary">
                <IconifyIcon icon="material-symbols:gavel" className="me-2" />
                Legal & Compliance
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <TextFormInput
                    name="terms_url"
                    label="Terms & Conditions URL"
                    placeholder="https://casanirvana.com/terms"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="privacy_url"
                    label="Privacy Policy URL"
                    placeholder="https://casanirvana.com/privacy"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="refund_policy_url"
                    label="Refund Policy URL"
                    placeholder="https://casanirvana.com/refund-policy"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="data_retention_policy_url"
                    label="Data Retention Policy URL"
                    placeholder="https://casanirvana.com/data-retention"
                    control={control}
                  />
                </Col>
              </Row>
            </div>

            {/* Password Policy */}
            <div className="mb-4">
              <h6 className="mb-3 text-success">
                <IconifyIcon icon="material-symbols:password" className="me-2" />
                Password Policy
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <TextFormInput
                    name="password_min_length"
                    label="Minimum Password Length"
                    type="number"
                    placeholder="8"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...control.register("password_require_uppercase")}
                    />
                    <label className="form-check-label">
                      Require Uppercase Letters
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...control.register("password_require_lowercase")}
                    />
                    <label className="form-check-label">
                      Require Lowercase Letters
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...control.register("password_require_numbers")}
                    />
                    <label className="form-check-label">
                      Require Numbers
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...control.register("password_require_symbols")}
                    />
                    <label className="form-check-label">
                      Require Special Characters
                    </label>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Account Security */}
            <div className="mb-4">
              <h6 className="mb-3 text-warning">
                <IconifyIcon icon="material-symbols:account-circle" className="me-2" />
                Account Security
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <TextFormInput
                    name="login_attempt_limit"
                    label="Login Attempt Limit"
                    type="number"
                    placeholder="5"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="account_lockout_duration_minutes"
                    label="Account Lockout Duration (minutes)"
                    type="number"
                    placeholder="30"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...control.register("two_factor_auth_enabled")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:verified-user" className="me-2" />
                      Two-Factor Authentication
                    </label>
                  </div>
                  {watchTwoFactorAuth && (
                    <small className="text-success">
                      <IconifyIcon icon="material-symbols:check-circle" className="me-1" />
                      Enhanced security enabled
                    </small>
                  )}
                </Col>
              </Row>
            </div>

            {/* Data Protection */}
            <div className="mb-4">
              <h6 className="mb-3 text-info">
                <IconifyIcon icon="material-symbols:shield" className="me-2" />
                Data Protection
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <TextFormInput
                    name="data_retention_days"
                    label="Data Retention Period (days)"
                    type="number"
                    placeholder="1095"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...control.register("data_encryption_enabled")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:enhanced-encryption" className="me-2" />
                      Data Encryption
                    </label>
                  </div>
                  {watchDataEncryption && (
                    <small className="text-success">
                      <IconifyIcon icon="material-symbols:check-circle" className="me-1" />
                      AES-256 encryption active
                    </small>
                  )}
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...control.register("gdpr_compliance_enabled")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:policy" className="me-2" />
                      GDPR Compliance
                    </label>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Security Status */}
            <div className="mb-4">
              <h6 className="mb-3 text-secondary">
                <IconifyIcon icon="material-symbols:security-scan" className="me-2" />
                Security Status
              </h6>
              <Row className="g-3">
                <Col md={3}>
                  <Card className="bg-success-subtle border-success border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:verified-user" className="text-success fs-2 mb-2" />
                      <h6 className="mb-1">Security Score</h6>
                      <span className="text-success fw-medium">95%</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-info-subtle border-info border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:vpn-lock" className="text-info fs-2 mb-2" />
                      <h6 className="mb-1">SSL Certificate</h6>
                      <span className="text-info fw-medium">Valid</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-warning-subtle border-warning border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:scan" className="text-warning fs-2 mb-2" />
                      <h6 className="mb-1">Last Scan</h6>
                      <span className="text-warning fw-medium">6h ago</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-primary-subtle border-primary border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:backup" className="text-primary fs-2 mb-2" />
                      <h6 className="mb-1">Data Backup</h6>
                      <span className="text-primary fw-medium">Current</span>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => configData && reset(configData)}
                disabled={!isDirty || isSubmitting || isUpdating || !configData}
              >
                Reset Changes
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty || isSubmitting || isUpdating || isLoadingData}
              >
                {isSubmitting || isUpdating ? (
                  <span className="spinner-border spinner-border-sm me-1" />
                ) : (
                  <IconifyIcon icon="material-symbols:save" className="me-1" />
                )}
                Save Configuration
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
      )}
    </>
  );
};

export default SecurityConfigPage;
