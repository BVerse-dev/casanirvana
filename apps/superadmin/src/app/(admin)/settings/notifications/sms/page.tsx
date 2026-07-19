'use client';

import { useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import PasswordFormInput from '@/components/from/PasswordFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useSmsNotificationSettings, { SmsNotificationSettings } from '@/hooks/useSmsNotificationSettings';

// Form validation schema
const smsSettingsSchema = yup.object({
  // Provider Selection
  sms_provider: yup.string().required('SMS provider is required'),
  
  // Twilio Configuration
  twilio_account_sid: yup.string().required(),
  twilio_auth_token: yup.string().required(),
  twilio_phone_number: yup.string().required(),
  
  // AWS SNS Configuration
  aws_access_key_id: yup.string().required(),
  aws_secret_access_key: yup.string().required(),
  aws_region: yup.string().required(),
  
  // TextLocal Configuration
  textlocal_api_key: yup.string().required(),
  textlocal_sender: yup.string().required(),
  
  // MSG91 Configuration
  msg91_api_key: yup.string().required(),
  msg91_sender_id: yup.string().required(),
  msg91_route: yup.string().required(),
  
  // General SMS Settings
  default_country_code: yup.string().required(),
  rate_limit_per_minute: yup.number().required(),
  sms_timeout: yup.number().required(),
  enable_delivery_reports: yup.boolean().required(),
  test_mode: yup.boolean().required(),
  
  // Notification Types
  enable_otp_sms: yup.boolean().required(),
  enable_alert_sms: yup.boolean().required(),
  enable_reminder_sms: yup.boolean().required(),
  enable_emergency_sms: yup.boolean().required(),
});

const SmsSettingsPage = () => {
  const {
    smsNotificationSettings,
    isLoadingData,
    isUpdating,
    loadError,
    updateError,
    updateSuccess,
    updateSettings,
    isTesting,
    testError,
    testResult,
    testSettingsAsync,
  } = useSmsNotificationSettings();

  const { control, handleSubmit, reset, getValues, watch, register, formState: { isDirty } } = useForm<SmsNotificationSettings>({
    resolver: yupResolver(smsSettingsSchema),
  });

  // Reset form when settings are loaded
  useEffect(() => {
    if (smsNotificationSettings) {
      reset(smsNotificationSettings);
    }
  }, [smsNotificationSettings, reset]);

  const selectedProvider = watch('sms_provider');

  const onSubmit = async (data: SmsNotificationSettings) => {
    updateSettings(data);
  };

  const testSms = async () => {
    await testSettingsAsync(getValues());
  };

  const renderProviderConfig = () => {
    switch (selectedProvider) {
      case 'twilio':
        return (
          <Card>
            <CardHeader>
              <CardTitle as="h4">
                <IconifyIcon icon="ri:phone-line" className="me-2" />
                Twilio Configuration
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <TextFormInput
                    control={control}
                    name="twilio_account_sid"
                    label="Account SID"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    containerClassName="mb-3"
                  />
                </Col>
                <Col lg={12}>
                  <PasswordFormInput
                    control={control}
                    name="twilio_auth_token"
                    label="Auth Token"
                    placeholder="Enter Twilio Auth Token"
                    containerClassName="mb-3"
                  />
                </Col>
                <Col lg={12}>
                  <TextFormInput
                    control={control}
                    name="twilio_phone_number"
                    label="Phone Number"
                    placeholder="+1234567890"
                    containerClassName="mb-3"
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        );

      case 'aws_sns':
        return (
          <Card>
            <CardHeader>
              <CardTitle as="h4">
                <IconifyIcon icon="ri:amazon-line" className="me-2" />
                AWS SNS Configuration
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <TextFormInput
                    control={control}
                    name="aws_access_key_id"
                    label="Access Key ID"
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    containerClassName="mb-3"
                  />
                </Col>
                <Col lg={12}>
                  <PasswordFormInput
                    control={control}
                    name="aws_secret_access_key"
                    label="Secret Access Key"
                    placeholder="Enter AWS Secret Access Key"
                    containerClassName="mb-3"
                  />
                </Col>
                <Col lg={12}>
                  <SelectFormInput
                    control={control}
                    name="aws_region"
                    label="AWS Region"
                    containerClassName="mb-3"
                    options={[
                      { value: 'us-east-1', label: 'US East (N. Virginia)' },
                      { value: 'us-west-2', label: 'US West (Oregon)' },
                      { value: 'eu-west-1', label: 'Europe (Ireland)' },
                      { value: 'ap-south-1', label: 'Asia Pacific (South Asia)' },
                      { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' }
                    ]}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        );

      case 'textlocal':
        return (
          <Card>
            <CardHeader>
              <CardTitle as="h4">
                <IconifyIcon icon="ri:message-3-line" className="me-2" />
                TextLocal Configuration
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <PasswordFormInput
                    control={control}
                    name="textlocal_api_key"
                    label="API Key"
                    placeholder="Enter TextLocal API Key"
                    containerClassName="mb-3"
                  />
                </Col>
                <Col lg={12}>
                  <TextFormInput
                    control={control}
                    name="textlocal_sender"
                    label="Sender Name"
                    placeholder="CASANV"
                    containerClassName="mb-3"
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        );

      case 'msg91':
        return (
          <Card>
            <CardHeader>
              <CardTitle as="h4">
                <IconifyIcon icon="ri:chat-3-line" className="me-2" />
                MSG91 Configuration
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <PasswordFormInput
                    control={control}
                    name="msg91_api_key"
                    label="API Key"
                    placeholder="Enter MSG91 API Key"
                    containerClassName="mb-3"
                  />
                </Col>
                <Col lg={6}>
                  <TextFormInput
                    control={control}
                    name="msg91_sender_id"
                    label="Sender ID"
                    placeholder="CASANV"
                    containerClassName="mb-3"
                  />
                </Col>
                <Col lg={6}>
                  <SelectFormInput
                    control={control}
                    name="msg91_route"
                    label="Route"
                    containerClassName="mb-3"
                    options={[
                      { value: '1', label: 'Promotional' },
                      { value: '4', label: 'Transactional' }
                    ]}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        );

      default:
        return null;
    }
  };

  if (isLoadingData) {
    return (
      <>
        <PageTitle subName="Notification Setup" title="SMS Notification Setup" />
        <Alert variant="info">
          <IconifyIcon icon="solar:loading-line-duotone" className="fs-18 me-2" />
          Loading SMS notification setup...
        </Alert>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <PageTitle subName="Notification Setup" title="SMS Notification Setup" />
        <Alert variant="danger">
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error loading SMS notification setup: {loadError.message}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Notification Setup" title="SMS Notification Setup" />

      {updateSuccess && (
        <Alert variant="success" dismissible>
          <IconifyIcon icon="solar:check-circle-line-duotone" className="fs-18 me-2" />
          SMS notification setup updated successfully!
        </Alert>
      )}

      {updateError && (
        <Alert variant="danger" dismissible>
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error updating SMS notification setup: {updateError.message}
        </Alert>
      )}

      {testResult && (
        <Alert variant={testResult.success ? 'success' : 'warning'} dismissible>
          <IconifyIcon icon="solar:shield-check-line-duotone" className="fs-18 me-2" />
          {testResult.message}
        </Alert>
      )}

      {testError && (
        <Alert variant="danger" dismissible>
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error testing SMS setup: {testError.message}
        </Alert>
      )}

      <Alert variant="info">
        <IconifyIcon icon="solar:shield-check-line-duotone" className="fs-18 me-2" />
        This page owns SMS provider credentials and delivery defaults only. Notification content and routing stay on their dedicated email, in-app, notice, and emergency settings pages.
      </Alert>

      <Alert variant="info">
        <IconifyIcon icon="solar:shield-check-line-duotone" className="fs-18 me-2" />
        Validate SMS Setup checks provider configuration completeness. Live delivery still depends on your SMS provider account, approved sender setup, and carrier acceptance.
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col xl={6}>
              <Card>
                <CardHeader>
                  <CardTitle as="h4">
                    <IconifyIcon icon="ri:settings-4-line" className="me-2" />
                    SMS Provider Selection
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <SelectFormInput
                        control={control}
                        name="sms_provider"
                        label="SMS Provider"
                        containerClassName="mb-3"
                        options={[
                          { value: 'twilio', label: 'Twilio' },
                          { value: 'aws_sns', label: 'AWS SNS' },
                          { value: 'textlocal', label: 'TextLocal' },
                          { value: 'msg91', label: 'MSG91' }
                        ]}
                      />
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {renderProviderConfig()}
            </Col>

            <Col xl={6}>
              <Card>
                <CardHeader>
                  <CardTitle as="h4">
                    <IconifyIcon icon="ri:global-line" className="me-2" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <TextFormInput
                        control={control}
                        name="default_country_code"
                        label="Default Country Code"
                        placeholder="+233"
                        containerClassName="mb-3"
                      />
                    </Col>
                    <Col lg={6}>
                      <TextFormInput
                        control={control}
                        name="rate_limit_per_minute"
                        type="number"
                        label="Rate Limit (per minute)"
                        placeholder="10"
                        containerClassName="mb-3"
                      />
                    </Col>
                    <Col lg={12}>
                      <TextFormInput
                        control={control}
                        name="sms_timeout"
                        type="number"
                        label="SMS Timeout (seconds)"
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
                    <IconifyIcon icon="ri:notification-3-line" className="me-2" />
                    Notification Types
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="enable_otp_sms"
                          {...register('enable_otp_sms')}
                        />
                        <label className="form-check-label" htmlFor="enable_otp_sms">
                          OTP SMS
                        </label>
                        <small className="form-text text-muted d-block">
                          One-time password messages
                        </small>
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="enable_alert_sms"
                          {...register('enable_alert_sms')}
                        />
                        <label className="form-check-label" htmlFor="enable_alert_sms">
                          Alert SMS
                        </label>
                        <small className="form-text text-muted d-block">
                          General alerts and notifications
                        </small>
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="enable_reminder_sms"
                          {...register('enable_reminder_sms')}
                        />
                        <label className="form-check-label" htmlFor="enable_reminder_sms">
                          Reminder SMS
                        </label>
                        <small className="form-text text-muted d-block">
                          Appointment and payment reminders
                        </small>
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="enable_emergency_sms"
                          {...register('enable_emergency_sms')}
                        />
                        <label className="form-check-label" htmlFor="enable_emergency_sms">
                          Emergency SMS
                        </label>
                        <small className="form-text text-muted d-block">
                          Critical emergency notifications
                        </small>
                      </div>
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
                          id="enable_delivery_reports"
                          {...register('enable_delivery_reports')}
                        />
                        <label className="form-check-label" htmlFor="enable_delivery_reports">
                          Delivery Reports
                        </label>
                        <small className="form-text text-muted d-block">
                          Track SMS delivery status
                        </small>
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="test_mode"
                          {...register('test_mode')}
                        />
                        <label className="form-check-label" htmlFor="test_mode">
                          Test Mode
                        </label>
                        <small className="form-text text-muted d-block">
                          Log SMS instead of sending (for development)
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
                    SMS Provider Information
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={3}>
                      <div className="mb-3">
                        <h6 className="fw-bold">Twilio</h6>
                        <small className="text-muted">
                          Global SMS delivery<br />
                          Reliable and scalable<br />
                          Premium pricing
                        </small>
                      </div>
                    </Col>
                    <Col lg={3}>
                      <div className="mb-3">
                        <h6 className="fw-bold">AWS SNS</h6>
                        <small className="text-muted">
                          Amazon&apos;s SMS service<br />
                          Pay-as-you-go pricing<br />
                          Global coverage
                        </small>
                      </div>
                    </Col>
                    <Col lg={3}>
                      <div className="mb-3">
                        <h6 className="fw-bold">TextLocal</h6>
                        <small className="text-muted">
                          Provider-specific regional coverage<br />
                          Competitive rates<br />
                          Easy integration
                        </small>
                      </div>
                    </Col>
                    <Col lg={3}>
                      <div className="mb-3">
                        <h6 className="fw-bold">MSG91</h6>
                        <small className="text-muted">
                          Provider-specific regional coverage<br />
                          Low-cost SMS<br />
                          Transactional & Promotional
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
              onClick={testSms}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Validating Setup...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:send-plane-line" className="me-1" />
                  Validate SMS Setup
                </>
              )}
            </Button>
            
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                type="button" 
                onClick={() => reset()}
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
          </div>
        </form>
    </>
  );
};

export default SmsSettingsPage;
