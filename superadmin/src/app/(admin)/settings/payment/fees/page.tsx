'use client';

import React from 'react';
import { Row, Col, Card, CardHeader, CardBody, Alert, Table, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import TextFormInput from '@/components/from/TextFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';

// Hooks
import usePaymentFeeSettings, { PaymentFeeSettings } from '@/hooks/usePaymentFeeSettings';

const schema = yup.object({
  // Transaction Fees
  credit_card_fee_percentage: yup.number().min(0).max(10),
  credit_card_fee_fixed: yup.number().min(0),
  debit_card_fee_percentage: yup.number().min(0).max(10),
  debit_card_fee_fixed: yup.number().min(0),
  expresspay_fee_percentage: yup.number().min(0).max(10),
  expresspay_fee_fixed: yup.number().min(0),
  net_banking_fee_percentage: yup.number().min(0).max(10),
  net_banking_fee_fixed: yup.number().min(0),
  wallet_fee_percentage: yup.number().min(0).max(10),
  wallet_fee_fixed: yup.number().min(0),

  // Processing Fees
  processing_fee_enabled: yup.boolean(),
  processing_fee_percentage: yup.number().min(0).max(10),
  processing_fee_fixed: yup.number().min(0),
  processing_fee_max_amount: yup.number().min(0),

  // Convenience Fees
  convenience_fee_enabled: yup.boolean(),
  convenience_fee_percentage: yup.number().min(0).max(10),
  convenience_fee_fixed: yup.number().min(0),

  // Late Payment Fees
  late_payment_fee_enabled: yup.boolean(),
  late_payment_fee_percentage: yup.number().min(0).max(50),
  late_payment_fee_fixed: yup.number().min(0),
  late_payment_grace_period: yup.number().min(0).max(30),

  // Fee Settings
  fee_bearer: yup.string().required('Fee bearer is required'),
  fee_calculation_method: yup.string().required('Fee calculation method is required'),
  minimum_fee_amount: yup.number().min(0),
  maximum_fee_amount: yup.number().min(0),
});

const PaymentFeesPage = () => {
  const { 
    paymentFeeSettings: settings, 
    isLoadingData: loadingSettings,
    updateSettings,
    isUpdating: updatingSettings,
    loadError,
    updateError,
    updateSuccess,
  } = usePaymentFeeSettings();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PaymentFeeSettings>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      // Transaction Fees
      credit_card_fee_percentage: settings?.credit_card_fee_percentage ?? 2.5,
      credit_card_fee_fixed: settings?.credit_card_fee_fixed ?? 0,
      debit_card_fee_percentage: settings?.debit_card_fee_percentage ?? 1.5,
      debit_card_fee_fixed: settings?.debit_card_fee_fixed ?? 0,
      expresspay_fee_percentage: settings?.expresspay_fee_percentage ?? 0,
      expresspay_fee_fixed: settings?.expresspay_fee_fixed ?? 0,
      net_banking_fee_percentage: settings?.net_banking_fee_percentage ?? 1.0,
      net_banking_fee_fixed: settings?.net_banking_fee_fixed ?? 0,
      wallet_fee_percentage: settings?.wallet_fee_percentage ?? 0,
      wallet_fee_fixed: settings?.wallet_fee_fixed ?? 0,

      // Processing Fees
      processing_fee_enabled: settings?.processing_fee_enabled ?? false,
      processing_fee_percentage: settings?.processing_fee_percentage ?? 1.0,
      processing_fee_fixed: settings?.processing_fee_fixed ?? 5,
      processing_fee_max_amount: settings?.processing_fee_max_amount ?? 100,

      // Convenience Fees
      convenience_fee_enabled: settings?.convenience_fee_enabled ?? false,
      convenience_fee_percentage: settings?.convenience_fee_percentage ?? 1.0,
      convenience_fee_fixed: settings?.convenience_fee_fixed ?? 10,

      // Late Payment Fees
      late_payment_fee_enabled: settings?.late_payment_fee_enabled ?? true,
      late_payment_fee_percentage: settings?.late_payment_fee_percentage ?? 2.0,
      late_payment_fee_fixed: settings?.late_payment_fee_fixed ?? 50,
      late_payment_grace_period: settings?.late_payment_grace_period ?? 7,

      // Fee Settings
      fee_bearer: settings?.fee_bearer ?? 'customer',
      fee_calculation_method: settings?.fee_calculation_method ?? 'percentage_plus_fixed',
      minimum_fee_amount: settings?.minimum_fee_amount ?? 1,
      maximum_fee_amount: settings?.maximum_fee_amount ?? 500,
    },
  });

  const watchedSettings = watch([
    'processing_fee_enabled', 
    'convenience_fee_enabled', 
    'late_payment_fee_enabled'
  ]);

  React.useEffect(() => {
    if (settings) {
      reset({
        // Transaction Fees
        credit_card_fee_percentage: settings.credit_card_fee_percentage ?? 2.5,
        credit_card_fee_fixed: settings.credit_card_fee_fixed ?? 0,
        debit_card_fee_percentage: settings.debit_card_fee_percentage ?? 1.5,
        debit_card_fee_fixed: settings.debit_card_fee_fixed ?? 0,
        expresspay_fee_percentage: settings.expresspay_fee_percentage ?? 0,
        expresspay_fee_fixed: settings.expresspay_fee_fixed ?? 0,
        net_banking_fee_percentage: settings.net_banking_fee_percentage ?? 1.0,
        net_banking_fee_fixed: settings.net_banking_fee_fixed ?? 0,
        wallet_fee_percentage: settings.wallet_fee_percentage ?? 0,
        wallet_fee_fixed: settings.wallet_fee_fixed ?? 0,

        // Processing Fees
        processing_fee_enabled: settings.processing_fee_enabled ?? false,
        processing_fee_percentage: settings.processing_fee_percentage ?? 1.0,
        processing_fee_fixed: settings.processing_fee_fixed ?? 5,
        processing_fee_max_amount: settings.processing_fee_max_amount ?? 100,

        // Convenience Fees
        convenience_fee_enabled: settings.convenience_fee_enabled ?? false,
        convenience_fee_percentage: settings.convenience_fee_percentage ?? 1.0,
        convenience_fee_fixed: settings.convenience_fee_fixed ?? 10,

        // Late Payment Fees
        late_payment_fee_enabled: settings.late_payment_fee_enabled ?? true,
        late_payment_fee_percentage: settings.late_payment_fee_percentage ?? 2.0,
        late_payment_fee_fixed: settings.late_payment_fee_fixed ?? 50,
        late_payment_grace_period: settings.late_payment_grace_period ?? 7,

        // Fee Settings
        fee_bearer: settings.fee_bearer ?? 'customer',
        fee_calculation_method: settings.fee_calculation_method ?? 'percentage_plus_fixed',
        minimum_fee_amount: settings.minimum_fee_amount ?? 1,
        maximum_fee_amount: settings.maximum_fee_amount ?? 500,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: PaymentFeeSettings) => {
    updateSettings(data);
  };

  const feeBearerOptions = [
    { label: 'Customer (User pays fees)', value: 'customer' },
    { label: 'Merchant (Community absorbs fees)', value: 'merchant' },
    { label: 'Split (Shared between customer and community)', value: 'split' },
  ];

  const calculationMethodOptions = [
    { label: 'Percentage Only', value: 'percentage_only' },
    { label: 'Fixed Amount Only', value: 'fixed_only' },
    { label: 'Percentage + Fixed Amount', value: 'percentage_plus_fixed' },
    { label: 'Higher of Percentage or Fixed', value: 'higher_of_both' },
  ];

  const paymentMethods = [
    {
      name: 'Card Payments',
      percentageField: 'credit_card_fee_percentage' as const,
      fixedField: 'credit_card_fee_fixed' as const,
      icon: 'ri-bank-card-line'
    },
    {
      name: 'Debit Card (Reserved)',
      percentageField: 'debit_card_fee_percentage' as const,
      fixedField: 'debit_card_fee_fixed' as const,
      icon: 'ri-bank-card-2-line'
    },
    {
      name: 'ExpressPay',
      percentageField: 'expresspay_fee_percentage' as const,
      fixedField: 'expresspay_fee_fixed' as const,
      icon: 'ri-money-dollar-circle-line'
    },
    {
      name: 'Online Banking (Reserved)',
      percentageField: 'net_banking_fee_percentage' as const,
      fixedField: 'net_banking_fee_fixed' as const,
      icon: 'ri-bank-line'
    },
    {
      name: 'PayPal (Deferred)',
      percentageField: 'wallet_fee_percentage' as const,
      fixedField: 'wallet_fee_fixed' as const,
      icon: 'ri-wallet-line'
    },
  ];

  if (loadingSettings) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <>
        <Row>
          <Col xs={12}>
            <div className="page-title-box">
              <h4 className="page-title">Payment Fees & Charges</h4>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Alert variant="danger">
              <i className="ri-alert-line me-2"></i>
              Failed to load payment fee settings: {loadError.message}
            </Alert>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Payment Fees & Charges</h4>
          </div>
        </Col>
      </Row>

      <form onSubmit={handleSubmit(onSubmit)}>
        {updateSuccess && !updatingSettings && (
          <Row>
            <Col xs={12}>
              <Alert variant="success">
                <i className="ri-checkbox-circle-line me-2"></i>
                Payment fee settings updated successfully.
              </Alert>
            </Col>
          </Row>
        )}

        {updateError && (
          <Row>
            <Col xs={12}>
              <Alert variant="danger">
                <i className="ri-alert-line me-2"></i>
                Failed to update payment fee settings: {updateError.message}
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col xs={12}>
            <Alert variant="info">
              <i className="ri-information-line me-2"></i>
              Card Payments and Mobile Money (ExpressPay) are the live checkout methods today. Fees for the remaining reserved methods are stored here for later rollout and do not affect the current user checkout flow.
            </Alert>
          </Col>
        </Row>

        <Row>
          {/* Transaction Fees */}
          <Col lg={12}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-money-dollar-circle-line me-2"></i>
                  Transaction Fees by Payment Method
                </h5>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <Table className="table table-hover table-nowrap mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Payment Method</th>
                        <th>Percentage Fee (%)</th>
                        <th>Fixed Fee (GH₵)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentMethods.map((method, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className={`${method.icon} me-2 text-muted`}></i>
                              {method.name}
                            </div>
                          </td>
                          <td>
                            <TextFormInput
                              name={method.percentageField}
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              placeholder="0.0"
                              control={control}
                              containerClassName="mb-0"
                            />
                          </td>
                          <td>
                            <TextFormInput
                              name={method.fixedField}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              control={control}
                              containerClassName="mb-0"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Processing Fees */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-settings-3-line me-2"></i>
                  Processing Fees
                </h5>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="processing_fee_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="processing_fee_enabled"
                        label="Enable Processing Fees"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {watchedSettings[0] && (
                  <>
                    <TextFormInput
                      name="processing_fee_percentage"
                      label="Processing Fee (%)"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="1.0"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="processing_fee_fixed"
                      label="Fixed Processing Fee (GH₵)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5.00"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="processing_fee_max_amount"
                      label="Maximum Processing Fee (GH₵)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="100.00"
                      control={control}
                      containerClassName="mb-0"
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Convenience Fees */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-price-tag-3-line me-2"></i>
                  Convenience Fees
                </h5>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="convenience_fee_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="convenience_fee_enabled"
                        label="Enable Convenience Fees"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {watchedSettings[1] && (
                  <>
                    <TextFormInput
                      name="convenience_fee_percentage"
                      label="Convenience Fee (%)"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="1.0"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="convenience_fee_fixed"
                      label="Fixed Convenience Fee (GH₵)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="10.00"
                      control={control}
                      containerClassName="mb-0"
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Late Payment Fees */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-time-line me-2"></i>
                  Late Payment Fees
                </h5>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Controller
                    name="late_payment_fee_enabled"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="late_payment_fee_enabled"
                        label="Enable Late Payment Fees"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                {watchedSettings[2] && (
                  <>
                    <TextFormInput
                      name="late_payment_fee_percentage"
                      label="Late Payment Fee (%)"
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      placeholder="2.0"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="late_payment_fee_fixed"
                      label="Fixed Late Fee (GH₵)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="50.00"
                      control={control}
                      containerClassName="mb-3"
                    />

                    <TextFormInput
                      name="late_payment_grace_period"
                      label="Grace Period (days)"
                      type="number"
                      min="0"
                      max="30"
                      placeholder="7"
                      control={control}
                      containerClassName="mb-0"
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Fee Configuration */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-calculator-line me-2"></i>
                  Fee Configuration
                </h5>
              </CardHeader>
              <CardBody>
                <SelectFormInput
                  name="fee_bearer"
                  label="Fee Bearer"
                  control={control}
                  options={feeBearerOptions}
                  containerClassName="mb-3"
                />

                <SelectFormInput
                  name="fee_calculation_method"
                  label="Calculation Method"
                  control={control}
                  options={calculationMethodOptions}
                  containerClassName="mb-3"
                />

                <TextFormInput
                  name="minimum_fee_amount"
                  label="Minimum Fee Amount (GH₵)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1.00"
                  control={control}
                  containerClassName="mb-3"
                />

                <TextFormInput
                  name="maximum_fee_amount"
                  label="Maximum Fee Amount (GH₵)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="500.00"
                  control={control}
                  containerClassName="mb-0"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Alert variant="warning" className="mb-3">
                  <i className="ri-alert-line me-2"></i>
                  <strong>Important:</strong> Fee changes will apply to new transactions only. 
                  Review all fee settings carefully as they directly impact user experience and revenue.
                </Alert>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => reset()}
                    disabled={updatingSettings}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updatingSettings}
                  >
                    {updatingSettings ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Fee Settings'
                    )}
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

export default PaymentFeesPage;
