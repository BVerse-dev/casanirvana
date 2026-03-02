'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import PasswordFormInput from '@/components/from/PasswordFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useSmtpSettings, { SmtpSettings } from '@/hooks/useSmtpSettings';

// Form validation schema
const smtpSettingsSchema = yup.object({
  smtp_host: yup.string().required('SMTP host is required'),
  smtp_port: yup.number().min(1, 'Port must be positive').max(65535, 'Invalid port').required('SMTP port is required'),
  smtp_username: yup.string().required('SMTP username is required'),
  smtp_password: yup.string().required('SMTP password is required'),
  smtp_encryption: yup.string().required('Encryption type is required'),
  smtp_from_email: yup.string().email('Invalid email').required('From email is required'),
  smtp_from_name: yup.string().required('From name is required'),
  smtp_timeout: yup.number().min(1, 'Timeout must be positive').required('Timeout is required'),
  smtp_enable_ssl: yup.boolean().default(false),
  smtp_enable_tls: yup.boolean().default(true),
  smtp_test_mode: yup.boolean().default(false),
});

interface SmtpSettingsFormData extends SmtpSettings {}

const SmtpSettingsPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);

  // Use SMTP settings hook
  const {
    smtpSettings,
    isLoadingData,
    isUpdating,
    isTesting,
    updateSettingsAsync,
    testConnectionAsync,
    loadError,
    updateError,
    testError,
    updateSuccess,
    testResult,
  } = useSmtpSettings();

  const { control, handleSubmit, reset, getValues, register, formState: { isDirty, isSubmitting } } = useForm<SmtpSettingsFormData>({
    resolver: yupResolver(smtpSettingsSchema),
    defaultValues: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_username: 'noreply@casanirvana.com',
      smtp_password: '',
      smtp_encryption: 'tls',
      smtp_from_email: 'noreply@casanirvana.com',
      smtp_from_name: 'Casa Nirvana',
      smtp_timeout: 30,
      smtp_enable_ssl: false,
      smtp_enable_tls: true,
      smtp_test_mode: false,
    },
  });

  // Reset form with real data when it loads
  useEffect(() => {
    if (smtpSettings) {
      reset(smtpSettings);
    }
  }, [smtpSettings, reset]);

  // Handle success/error alerts
  useEffect(() => {
    if (updateSuccess) {
      setShowAlert({ type: 'success', message: 'SMTP settings updated successfully!' });
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (updateError) {
      setShowAlert({ type: 'danger', message: 'Failed to update SMTP settings. Please try again.' });
    }
  }, [updateError]);

  useEffect(() => {
    if (testResult) {
      setShowAlert({ 
        type: testResult.success ? 'success' : 'danger', 
        message: testResult.message 
      });
    }
  }, [testResult]);

  useEffect(() => {
    if (testError) {
      setShowAlert({ type: 'danger', message: 'SMTP connection test failed. Please check your settings.' });
    }
  }, [testError]);

  useEffect(() => {
    if (loadError) {
      setShowAlert({ type: 'warning', message: 'Failed to load some settings. Using default values.' });
    }
  }, [loadError]);

  const onSubmit = async (data: SmtpSettingsFormData) => {
    try {
      // Hide any existing alerts
      setShowAlert(null);
      
      // Update settings via the hook
      await updateSettingsAsync(data);
    } catch (error) {
      console.error('Error submitting SMTP settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update SMTP settings' });
    }
  };

  const handleTestConnection = async () => {
    try {
      const currentValues = getValues();
      // Hide any existing alerts
      setShowAlert(null);
      
      // Test connection via the hook
      await testConnectionAsync(currentValues as SmtpSettings);
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      setShowAlert({ type: 'danger', message: 'Failed to test SMTP connection' });
    }
  };

  return (
    <>
      <PageTitle subName="Email Settings" title="SMTP Configuration" />

      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          <IconifyIcon 
            icon={showAlert.type === 'success' ? 'ri:check-line' : 'ri:error-warning-line'} 
            className="me-2" 
          />
          {showAlert.message}
        </Alert>
      )}

      {isLoadingData ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading SMTP settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:server-line" className="me-2" />
                  SMTP Server Configuration
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <TextFormInput
                      control={control}
                      name="smtp_host"
                      label="SMTP Host"
                      placeholder="smtp.gmail.com"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <TextFormInput
                      control={control}
                      name="smtp_port"
                      type="number"
                      label="SMTP Port"
                      placeholder="587"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <SelectFormInput
                      control={control}
                      name="smtp_encryption"
                      label="Encryption"
                      containerClassName="mb-3"
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'ssl', label: 'SSL' },
                        { value: 'tls', label: 'TLS' },
                        { value: 'starttls', label: 'STARTTLS' }
                      ]}
                    />
                  </Col>
                  <Col lg={12}>
                    <TextFormInput
                      control={control}
                      name="smtp_username"
                      label="SMTP Username"
                      placeholder="your-email@gmail.com"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={12}>
                    <PasswordFormInput
                      control={control}
                      name="smtp_password"
                      label="SMTP Password"
                      placeholder="Enter SMTP password"
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:mail-send-line" className="me-2" />
                  Email Sender Configuration
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <TextFormInput
                      control={control}
                      name="smtp_from_email"
                      type="email"
                      label="From Email Address"
                      placeholder="noreply@casanirvana.com"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={12}>
                    <TextFormInput
                      control={control}
                      name="smtp_from_name"
                      label="From Name"
                      placeholder="Casa Nirvana"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={12}>
                    <TextFormInput
                      control={control}
                      name="smtp_timeout"
                      type="number"
                      label="Connection Timeout (seconds)"
                      placeholder="30"
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:shield-check-line" className="me-2" />
                  Security & Testing
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="smtp_enable_ssl"
                        {...register('smtp_enable_ssl')}
                      />
                      <label className="form-check-label" htmlFor="smtp_enable_ssl">
                        Enable SSL
                      </label>
                      <small className="form-text text-muted d-block">
                        Use SSL encryption for SMTP connection
                      </small>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="smtp_enable_tls"
                        {...register('smtp_enable_tls')}
                      />
                      <label className="form-check-label" htmlFor="smtp_enable_tls">
                        Enable TLS
                      </label>
                      <small className="form-text text-muted d-block">
                        Use TLS encryption for SMTP connection
                      </small>
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="smtp_test_mode"
                        {...register('smtp_test_mode')}
                      />
                      <label className="form-check-label" htmlFor="smtp_test_mode">
                        Test Mode
                      </label>
                      <small className="form-text text-muted d-block">
                        Log emails instead of sending them (for development)
                      </small>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xl={12}>
            <Card className="border-info">
              <CardHeader className="bg-light">
                <CardTitle as="h4" className="text-info mb-0">
                  <IconifyIcon icon="ri:information-line" className="me-2" />
                  Popular SMTP Providers
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={3}>
                    <div className="mb-3">
                      <h6 className="fw-bold">Gmail</h6>
                      <small className="text-muted">
                        Host: smtp.gmail.com<br />
                        Port: 587 (TLS) or 465 (SSL)<br />
                        Encryption: TLS/SSL
                      </small>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="mb-3">
                      <h6 className="fw-bold">Outlook</h6>
                      <small className="text-muted">
                        Host: smtp-mail.outlook.com<br />
                        Port: 587<br />
                        Encryption: STARTTLS
                      </small>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="mb-3">
                      <h6 className="fw-bold">SendGrid</h6>
                      <small className="text-muted">
                        Host: smtp.sendgrid.net<br />
                        Port: 587<br />
                        Encryption: TLS
                      </small>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="mb-3">
                      <h6 className="fw-bold">Mailgun</h6>
                      <small className="text-muted">
                        Host: smtp.mailgun.org<br />
                        Port: 587<br />
                        Encryption: TLS
                      </small>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-between">
          <Button 
            variant="info" 
            type="button" 
            onClick={handleTestConnection}
            disabled={isTesting || isLoadingData}
          >
            {isTesting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Testing Connection...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:plug-line" className="me-1" />
                Test Connection
              </>
            )}
          </Button>
          
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              type="button" 
              onClick={() => smtpSettings && reset(smtpSettings)}
              disabled={!isDirty || isUpdating || isLoadingData}
            >
              <IconifyIcon icon="ri:refresh-line" className="me-1" />
              Reset
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={!isDirty || isUpdating || isLoadingData}
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
        </div>
      </form>
      )}
    </>
  );
};

export default SmtpSettingsPage;
