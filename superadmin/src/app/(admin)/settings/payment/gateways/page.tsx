'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardHeader, CardBody, Alert, Badge, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import PasswordFormInput from '@/components/from/PasswordFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import usePaymentGatewaySettings, {
  PaymentGatewaySettings,
  PaymentGatewayTestTarget,
  useTestPaymentGatewaySettings,
} from '@/hooks/usePaymentGatewaySettings';
import {
  useExpressPayGatewayConfig,
  useTestExpressPayGatewayConnection,
  useUpdateExpressPayGatewayConfig,
} from '@/hooks/useExpressPayGatewayConfig';

const schema = yup.object({
  // Razorpay
  razorpay_enabled: yup.boolean(),
  razorpay_key_id: yup.string().when('razorpay_enabled', {
    is: true,
    then: (schema) => schema.required('Razorpay Key ID is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  razorpay_key_secret: yup.string().when('razorpay_enabled', {
    is: true,
    then: (schema) => schema.required('Razorpay Key Secret is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  razorpay_webhook_secret: yup.string(),
  razorpay_mode: yup.string(),

  // Stripe
  stripe_enabled: yup.boolean(),
  stripe_publishable_key: yup.string().when('stripe_enabled', {
    is: true,
    then: (schema) => schema.required('Stripe Publishable Key is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  stripe_secret_key: yup.string().when('stripe_enabled', {
    is: true,
    then: (schema) => schema.required('Stripe Secret Key is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  stripe_webhook_secret: yup.string(),
  stripe_mode: yup.string(),

  // PayPal
  paypal_enabled: yup.boolean(),
  paypal_client_id: yup.string().when('paypal_enabled', {
    is: true,
    then: (schema) => schema.required('PayPal Client ID is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  paypal_client_secret: yup.string().when('paypal_enabled', {
    is: true,
    then: (schema) => schema.required('PayPal Client Secret is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  paypal_webhook_id: yup.string(),
  paypal_mode: yup.string(),

  // Paytm
  paytm_enabled: yup.boolean(),
  paytm_merchant_id: yup.string().when('paytm_enabled', {
    is: true,
    then: (schema) => schema.required('Paytm Merchant ID is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  paytm_merchant_key: yup.string().when('paytm_enabled', {
    is: true,
    then: (schema) => schema.required('Paytm Merchant Key is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  paytm_website: yup.string(),
  paytm_mode: yup.string(),

  // ExpressPay
  expresspay_enabled: yup.boolean(),
  expresspay_merchant_id: yup.string(),
  expresspay_api_key: yup.string(),
  expresspay_webhook_url: yup
    .string()
    .transform((value) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
    .url('Webhook URL must be a valid URL')
    .notRequired(),
  expresspay_mode: yup.string(),

  // Bank Transfer
  bank_transfer_enabled: yup.boolean(),
  bank_name: yup.string(),
  account_number: yup.string(),
  ifsc_code: yup.string(),
  account_holder_name: yup.string(),

  // Payment Settings
  payment_currency: yup.string(),
  payment_timeout: yup.number(),
  auto_refund_enabled: yup.boolean(),
  partial_payment_enabled: yup.boolean(),
});

const PaymentGatewaysPage = () => {
  const [activeGatewayTest, setActiveGatewayTest] = useState<string | null>(null);
  const [gatewayTestFeedback, setGatewayTestFeedback] = useState<{
    variant: 'success' | 'danger' | 'info';
    message: string;
  } | null>(null);

  // Supabase hook for payment gateway settings
  const {
    paymentGatewaySettings,
    isLoadingData,
    isUpdating,
    loadError,
    updateError,
    updateSuccess,
    updateSettings,
  } = usePaymentGatewaySettings();

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<PaymentGatewaySettings>({
    resolver: yupResolver(schema),
  });

  const razorpayEnabled = watch('razorpay_enabled');
  const stripeEnabled = watch('stripe_enabled');
  const paypalEnabled = watch('paypal_enabled');
  const paytmEnabled = watch('paytm_enabled');
  const expresspayEnabled = watch('expresspay_enabled');
  const bankTransferEnabled = watch('bank_transfer_enabled');
  const expresspayMode = watch('expresspay_mode') === 'live' ? 'live' : 'test';

  const {
    data: expressPayConfig,
    isLoading: isLoadingExpressPayConfig,
    error: expressPayConfigError,
  } = useExpressPayGatewayConfig(expresspayMode, 'global');
  const updateExpressPayConfig = useUpdateExpressPayGatewayConfig();
  const testExpressPayConnection = useTestExpressPayGatewayConnection();
  const testGatewaySettings = useTestPaymentGatewaySettings();

  // Reset form when settings are loaded, while keeping ExpressPay sourced from secure config.
  useEffect(() => {
    if (paymentGatewaySettings) {
      reset({
        ...paymentGatewaySettings,
        expresspay_enabled: expressPayConfig?.is_enabled ?? getValues('expresspay_enabled') ?? false,
        expresspay_mode:
          expressPayConfig?.mode ??
          (paymentGatewaySettings.expresspay_mode === 'live' ? 'live' : 'test'),
        expresspay_webhook_url:
          expressPayConfig?.webhook_url ??
          paymentGatewaySettings.expresspay_webhook_url ??
          '',
        expresspay_merchant_id: '',
        expresspay_api_key: '',
      });
    }
  }, [expressPayConfig, getValues, paymentGatewaySettings, reset]);

  useEffect(() => {
    if (!expressPayConfig) return;

    setValue('expresspay_enabled', expressPayConfig.is_enabled);
    setValue('expresspay_mode', expressPayConfig.mode);
    setValue('expresspay_webhook_url', expressPayConfig.webhook_url || '');
    // Never rehydrate secrets from DB/Vault into the form.
    setValue('expresspay_merchant_id', '');
    setValue('expresspay_api_key', '');
  }, [expressPayConfig, setValue]);

  const onSubmit = async (data: PaymentGatewaySettings) => {
    const legacyPayload: PaymentGatewaySettings = { ...data };
    delete legacyPayload.expresspay_enabled;
    delete legacyPayload.expresspay_merchant_id;
    delete legacyPayload.expresspay_api_key;
    delete legacyPayload.expresspay_webhook_url;
    delete legacyPayload.expresspay_mode;

    updateSettings(legacyPayload);

    await updateExpressPayConfig.mutateAsync({
      mode: data.expresspay_mode === 'live' ? 'live' : 'test',
      scope: 'global',
      is_enabled: Boolean(data.expresspay_enabled),
      currency: data.payment_currency || 'GHS',
      callback_path: '/payments/expresspay/callback',
      webhook_url: data.expresspay_webhook_url || null,
      merchant_id: data.expresspay_merchant_id || null,
      api_key: data.expresspay_api_key || null,
    });
  };

  const testPaymentGateway = async (gateway: PaymentGatewayTestTarget | 'expresspay', label: string) => {
    if (gateway !== 'expresspay') {
      setActiveGatewayTest(gateway);
      try {
        const result = await testGatewaySettings.mutateAsync({
          gateway,
          settings: getValues(),
        });

        setGatewayTestFeedback({
          variant: result.success ? 'success' : 'danger',
          message: result.message,
        });
      } catch (error) {
        setGatewayTestFeedback({
          variant: 'danger',
          message: error instanceof Error ? error.message : `${label} validation failed.`,
        });
      } finally {
        setActiveGatewayTest(null);
      }
      return;
    }

    try {
      const result = await testExpressPayConnection.mutateAsync({
        mode: expresspayMode,
        scope: 'global',
      });

      setGatewayTestFeedback({
        variant: result.passed ? 'success' : 'danger',
        message: result.message,
      });
    } catch (error) {
      setGatewayTestFeedback({
        variant: 'danger',
        message: error instanceof Error ? error.message : `${label} connection test failed.`,
      });
    }
  };

  const renderGatewayValidationButton = (
    gateway: PaymentGatewayTestTarget | 'expresspay',
    label: string,
    disabled = false
  ) => {
    const isPending =
      gateway === 'expresspay'
        ? testExpressPayConnection.isPending
        : testGatewaySettings.isPending && activeGatewayTest === gateway;

    return (
      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={() => testPaymentGateway(gateway, label)}
        disabled={disabled || isPending}
      >
        {isPending ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Validating...
          </>
        ) : (
          <>
            <i className="ri-shield-check-line me-1"></i>
            Validate Config
          </>
        )}
      </button>
    );
  };

  // Loading state
  if (isLoadingData) {
    return (
      <>
        <PageTitle subName="Payment" title="Payment Gateways" />
        <Alert variant="info">
          <IconifyIcon icon="solar:loading-line-duotone" className="fs-18 me-2" />
          Loading payment gateway settings...
        </Alert>
      </>
    );
  }

  // Error state
  if (loadError) {
    return (
      <>
        <PageTitle subName="Payment" title="Payment Gateways" />
        <Alert variant="danger">
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error loading payment gateway settings: {loadError.message}
        </Alert>
      </>
    );
  }

  const modeOptions = [
    { value: 'test', label: 'Test Mode' },
    { value: 'live', label: 'Live Mode' },
  ];

  const sandboxModeOptions = [
    { value: 'sandbox', label: 'Sandbox Mode' },
    { value: 'live', label: 'Live Mode' },
  ];

  const currencyOptions = [
    { value: 'GHS', label: 'Ghana Cedi (GH₵)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'NGN', label: 'Nigerian Naira (₦)' },
    { value: 'INR', label: 'INR (₹)' },
  ];

  return (
    <>
      <PageTitle subName="Payment" title="Payment Gateways" />

      {updateSuccess && (
        <Alert variant="success" dismissible>
          <IconifyIcon icon="solar:check-circle-line-duotone" className="fs-18 me-2" />
          Payment gateway settings updated successfully!
        </Alert>
      )}

      {updateError && (
        <Alert variant="danger" dismissible>
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error updating payment gateway settings: {updateError.message}
        </Alert>
      )}

      {updateExpressPayConfig.isSuccess && (
        <Alert variant="success" dismissible>
          <IconifyIcon icon="solar:check-circle-line-duotone" className="fs-18 me-2" />
          ExpressPay gateway settings updated successfully.
        </Alert>
      )}

      {updateExpressPayConfig.error && (
        <Alert variant="danger" dismissible>
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error updating ExpressPay settings: {updateExpressPayConfig.error.message}
        </Alert>
      )}

      {expressPayConfigError && (
        <Alert variant="danger" dismissible>
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Failed to load ExpressPay secure config: {expressPayConfigError.message}
        </Alert>
      )}

      {gatewayTestFeedback && (
        <Alert variant={gatewayTestFeedback.variant} dismissible onClose={() => setGatewayTestFeedback(null)}>
          <IconifyIcon icon="solar:test-tube-line-duotone" className="fs-18 me-2" />
          {gatewayTestFeedback.message}
        </Alert>
      )}

      <Alert variant="info">
        <IconifyIcon icon="solar:shield-check-line-duotone" className="fs-18 me-2" />
        Validation checks configuration completeness and secret availability for each gateway. Live payment processing
        still depends on each provider account, webhook configuration, and runtime callbacks.
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          {/* Razorpay */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="ri-bank-card-line me-2"></i>
                    Razorpay
                  </h5>
                  <Badge bg={razorpayEnabled ? 'success' : 'secondary'}>
                    {razorpayEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="razorpay_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="razorpay_enabled"
                        label="Enable Razorpay"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {razorpayEnabled && (
                  <>
                    <SelectFormInput
                      name="razorpay_mode"
                      label="Mode"
                      control={control}
                      options={modeOptions}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="razorpay_key_id"
                      label="Key ID"
                      placeholder="rzp_test_xxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <PasswordFormInput
                      name="razorpay_key_secret"
                      label="Key Secret"
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <PasswordFormInput
                      name="razorpay_webhook_secret"
                      label="Webhook Secret"
                      placeholder="whsec_xxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    {renderGatewayValidationButton('razorpay', 'Razorpay')}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Stripe */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="ri-stripe-line me-2"></i>
                    Stripe
                  </h5>
                  <Badge bg={stripeEnabled ? 'success' : 'secondary'}>
                    {stripeEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="stripe_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="stripe_enabled"
                        label="Enable Stripe"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {stripeEnabled && (
                  <>
                    <SelectFormInput
                      name="stripe_mode"
                      label="Mode"
                      control={control}
                      options={modeOptions}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="stripe_publishable_key"
                      label="Publishable Key"
                      placeholder="pk_test_xxxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <PasswordFormInput
                      name="stripe_secret_key"
                      label="Secret Key"
                      placeholder="sk_test_xxxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <PasswordFormInput
                      name="stripe_webhook_secret"
                      label="Webhook Secret"
                      placeholder="whsec_xxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    {renderGatewayValidationButton('stripe', 'Stripe')}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* PayPal */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="ri-paypal-line me-2"></i>
                    PayPal
                  </h5>
                  <Badge bg={paypalEnabled ? 'success' : 'secondary'}>
                    {paypalEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="paypal_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="paypal_enabled"
                        label="Enable PayPal"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {paypalEnabled && (
                  <>
                    <SelectFormInput
                      name="paypal_mode"
                      label="Mode"
                      control={control}
                      options={sandboxModeOptions}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="paypal_client_id"
                      label="Client ID"
                      placeholder="AXxxxxxxxxxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <PasswordFormInput
                      name="paypal_client_secret"
                      label="Client Secret"
                      placeholder="EXxxxxxxxxxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="paypal_webhook_id"
                      label="Webhook ID"
                      placeholder="5Wxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    {renderGatewayValidationButton('paypal', 'PayPal')}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Paytm */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="ri-smartphone-line me-2"></i>
                    Paytm
                  </h5>
                  <Badge bg={paytmEnabled ? 'success' : 'secondary'}>
                    {paytmEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="paytm_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="paytm_enabled"
                        label="Enable Paytm"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {paytmEnabled && (
                  <>
                    <SelectFormInput
                      name="paytm_mode"
                      label="Mode"
                      control={control}
                      options={modeOptions}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="paytm_merchant_id"
                      label="Merchant ID"
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <PasswordFormInput
                      name="paytm_merchant_key"
                      label="Merchant Key"
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="paytm_website"
                      label="Website"
                      placeholder="WEBSTAGING"
                      control={control}
                      containerClassName="mb-3"
                    />

                    {renderGatewayValidationButton('paytm', 'Paytm')}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* ExpressPay */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="ri-money-dollar-circle-line me-2"></i>
                    ExpressPay
                  </h5>
                  <Badge bg={expresspayEnabled ? 'success' : 'secondary'}>
                    {expresspayEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="expresspay_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="expresspay_enabled"
                        label="Enable ExpressPay Gateway"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {expresspayEnabled && (
                  <>
                    <TextFormInput
                      name="expresspay_merchant_id"
                      label="Merchant ID"
                      placeholder="EXPR_MERCHANT_123"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="expresspay_api_key"
                      label="API Key"
                      placeholder="expr_api_key_123456789"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="expresspay_webhook_url"
                      label="Webhook URL (Optional)"
                      placeholder="https://your-backend-domain/payments/expresspay/callback"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <SelectFormInput
                      name="expresspay_mode"
                      label="Environment"
                      control={control}
                      containerClassName="mb-3"
                      options={[
                        { value: 'test', label: 'Sandbox (Test)' },
                        { value: 'live', label: 'Live (Production)' }
                      ]}
                    />

                    <Alert variant="info" className="mb-3">
                      <i className="ri-information-line me-2"></i>
                      ExpressPay requires Merchant ID and API Key. Secret key is not required for this integration mode.
                    </Alert>

                    {renderGatewayValidationButton('expresspay', 'ExpressPay', isLoadingExpressPayConfig)}

                    <div className="mt-3 small text-muted">
                      Merchant ID configured: {expressPayConfig?.merchant_id_configured ? 'Yes' : 'No'} | API Key configured:{' '}
                      {expressPayConfig?.api_key_configured ? 'Yes' : 'No'}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Bank Transfer */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="ri-bank-line me-2"></i>
                    Bank Transfer
                  </h5>
                  <Badge bg={bankTransferEnabled ? 'success' : 'secondary'}>
                    {bankTransferEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="bank_transfer_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="bank_transfer_enabled"
                        label="Enable Bank Transfer"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {bankTransferEnabled && (
                  <>
                    <TextFormInput
                      name="bank_name"
                      label="Bank Name"
                      placeholder="Example Bank Ghana"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="account_number"
                      label="Account Number"
                      placeholder="1234567890123456"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="ifsc_code"
                      label="Routing / Branch Code"
                      placeholder="BRANCH-001"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="account_holder_name"
                      label="Account Holder Name"
                      placeholder="Casa Nirvana Community"
                      control={control}
                      containerClassName="mb-3"
                    />

                    {renderGatewayValidationButton('bank_transfer', 'Bank Transfer')}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Payment Settings */}
          <Col lg={12}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-settings-3-line me-2"></i>
                  Payment Settings
                </h5>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={3}>
                    <SelectFormInput
                      name="payment_currency"
                      label="Default Currency"
                      control={control}
                      options={currencyOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={3}>
                    <TextFormInput
                      name="payment_timeout"
                      label="Payment Timeout (minutes)"
                      type="number"
                      placeholder="15"
                      control={control}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={3}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="auto_refund_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="auto_refund_enabled"
                            label="Enable Auto Refund"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="form-check form-switch mb-3">
                      <Controller
                        name="partial_payment_enabled"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="switch"
                            id="partial_payment_enabled"
                            label="Allow Partial Payments"
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>

                <Alert variant="warning" className="mb-3">
                  <i className="ri-alert-line me-2"></i>
                  <strong>Security Note:</strong> Always use test mode while setting up payment gateways. 
                  Switch to live mode only after thorough testing.
                </Alert>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdating || updateExpressPayConfig.isPending || !isDirty}
                  >
                    {isUpdating || updateExpressPayConfig.isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="solar:diskette-line-duotone" className="me-1" />
                        Save Payment Settings
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => reset()}
                    disabled={isUpdating || !isDirty}
                  >
                    <IconifyIcon icon="solar:refresh-line-duotone" className="me-1" />
                    Reset
                  </button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </form>
    </>
  );
};

export default PaymentGatewaysPage;
