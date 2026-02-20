'use client';

import React from 'react';
import { Row, Col, Card, CardHeader, CardBody, Alert, Badge, Table, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';

// Hooks
import usePaymentMethodSettings from '@/hooks/usePaymentMethodSettings';

const schema = yup.object({
  // Payment Methods
  credit_card_enabled: yup.boolean(),
  debit_card_enabled: yup.boolean(),
  net_banking_enabled: yup.boolean(),
  expresspay_enabled: yup.boolean(),
  wallet_enabled: yup.boolean(),
  bank_transfer_enabled: yup.boolean(),
  cash_enabled: yup.boolean(),
  cheque_enabled: yup.boolean(),

  // Payment Method Limits
  min_payment_amount: yup.number().min(1).required('Minimum payment amount is required'),
  max_payment_amount: yup.number().min(1).required('Maximum payment amount is required'),
  daily_payment_limit: yup.number().min(1),
  monthly_payment_limit: yup.number().min(1),

  // Payment Processing
  auto_capture_enabled: yup.boolean(),
  partial_payments_enabled: yup.boolean(),
  recurring_payments_enabled: yup.boolean(),
  refund_enabled: yup.boolean(),
  
  // Payment Notes
  payment_instructions: yup.string(),
  payment_terms: yup.string(),
});

const PaymentMethodsPage = () => {
  const { 
    paymentMethodSettings: settings, 
    isLoadingData: loadingSettings,
    updateSettings,
    isUpdating: updatingSettings 
  } = usePaymentMethodSettings();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      // Payment Methods
      credit_card_enabled: settings?.credit_card_enabled ?? true,
      debit_card_enabled: settings?.debit_card_enabled ?? true,
      net_banking_enabled: settings?.net_banking_enabled ?? true,
      upi_enabled: settings?.upi_enabled ?? true,
      wallet_enabled: settings?.wallet_enabled ?? true,
      bank_transfer_enabled: settings?.bank_transfer_enabled ?? true,
      cash_enabled: settings?.cash_enabled ?? true,
      cheque_enabled: settings?.cheque_enabled ?? true,

      // Payment Method Limits
      min_payment_amount: settings?.min_payment_amount ?? 1,
      max_payment_amount: settings?.max_payment_amount ?? 100000,
      daily_payment_limit: settings?.daily_payment_limit ?? 50000,
      monthly_payment_limit: settings?.monthly_payment_limit ?? 500000,

      // Payment Processing
      auto_capture_enabled: settings?.auto_capture_enabled ?? true,
      partial_payments_enabled: settings?.partial_payments_enabled ?? false,
      recurring_payments_enabled: settings?.recurring_payments_enabled ?? true,
      refund_enabled: settings?.refund_enabled ?? true,
      
      // Payment Notes
      payment_instructions: settings?.payment_instructions ?? '',
      payment_terms: settings?.payment_terms ?? '',
    },
  });

  const watchedMethods = watch([
    'credit_card_enabled',
    'debit_card_enabled', 
    'net_banking_enabled',
    'expresspay_enabled',
    'wallet_enabled',
    'bank_transfer_enabled',
    'cash_enabled',
    'cheque_enabled'
  ]);

  React.useEffect(() => {
    if (settings) {
      reset({
        // Payment Methods
        credit_card_enabled: settings.credit_card_enabled ?? true,
        debit_card_enabled: settings.debit_card_enabled ?? true,
        net_banking_enabled: settings.net_banking_enabled ?? true,
        expresspay_enabled: settings.expresspay_enabled ?? true,
        wallet_enabled: settings.wallet_enabled ?? true,
        bank_transfer_enabled: settings.bank_transfer_enabled ?? true,
        cash_enabled: settings.cash_enabled ?? true,
        cheque_enabled: settings.cheque_enabled ?? true,

        // Payment Method Limits
        min_payment_amount: settings.min_payment_amount ?? 1,
        max_payment_amount: settings.max_payment_amount ?? 100000,
        daily_payment_limit: settings.daily_payment_limit ?? 50000,
        monthly_payment_limit: settings.monthly_payment_limit ?? 500000,

        // Payment Processing
        auto_capture_enabled: settings.auto_capture_enabled ?? true,
        partial_payments_enabled: settings.partial_payments_enabled ?? false,
        recurring_payments_enabled: settings.recurring_payments_enabled ?? true,
        refund_enabled: settings.refund_enabled ?? true,
        
        // Payment Notes
        payment_instructions: settings.payment_instructions ?? '',
        payment_terms: settings.payment_terms ?? '',
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    updateSettings(data);
  };

  const paymentMethods = [
    { key: 'credit_card', name: 'Credit Card', icon: 'ri-bank-card-line', enabled: watchedMethods[0], fieldName: 'credit_card_enabled' as const },
    { key: 'debit_card', name: 'Debit Card', icon: 'ri-bank-card-2-line', enabled: watchedMethods[1], fieldName: 'debit_card_enabled' as const },
    { key: 'net_banking', name: 'Net Banking', icon: 'ri-bank-line', enabled: watchedMethods[2], fieldName: 'net_banking_enabled' as const },
    { key: 'expresspay', name: 'ExpressPay', icon: 'ri-money-dollar-circle-line', enabled: watchedMethods[3], fieldName: 'expresspay_enabled' as const },
    { key: 'wallet', name: 'Digital Wallet', icon: 'ri-wallet-line', enabled: watchedMethods[4], fieldName: 'wallet_enabled' as const },
    { key: 'bank_transfer', name: 'Bank Transfer', icon: 'ri-exchange-line', enabled: watchedMethods[5], fieldName: 'bank_transfer_enabled' as const },
    { key: 'cash', name: 'Cash', icon: 'ri-money-rupee-circle-line', enabled: watchedMethods[6], fieldName: 'cash_enabled' as const },
    { key: 'cheque', name: 'Cheque', icon: 'ri-file-text-line', enabled: watchedMethods[7], fieldName: 'cheque_enabled' as const },
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

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Payment Methods</h4>
          </div>
        </Col>
      </Row>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          {/* Available Payment Methods */}
          <Col lg={8}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-bank-card-line me-2"></i>
                  Available Payment Methods
                </h5>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <Table className="table table-hover table-nowrap mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th className="text-center">Enable/Disable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentMethods.map((method) => (
                        <tr key={method.key}>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className={`${method.icon} me-2 text-muted`}></i>
                              {method.name}
                            </div>
                          </td>
                          <td>
                            <Badge bg={method.enabled ? 'success' : 'secondary'}>
                              {method.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Controller
                              name={method.fieldName}
                              control={control}
                              render={({ field }) => (
                                <Form.Check
                                  type="switch"
                                  id={method.fieldName}
                                  checked={Boolean(field.value)}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                />
                              )}
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

          {/* Payment Limits */}
          <Col lg={4}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-money-rupee-circle-line me-2"></i>
                  Payment Limits
                </h5>
              </CardHeader>
              <CardBody>
                <TextFormInput
                  name="min_payment_amount"
                  label="Minimum Amount ($)"
                  type="number"
                  placeholder="1"
                  control={control}
                  containerClassName="mb-3"
                />

                <TextFormInput
                  name="max_payment_amount"
                  label="Maximum Amount ($)"
                  type="number"
                  placeholder="100000"
                  control={control}
                  containerClassName="mb-3"
                />

                <TextFormInput
                  name="daily_payment_limit"
                  label="Daily Limit ($)"
                  type="number"
                  placeholder="50000"
                  control={control}
                  containerClassName="mb-3"
                />

                <TextFormInput
                  name="monthly_payment_limit"
                  label="Monthly Limit ($)"
                  type="number"
                  placeholder="500000"
                  control={control}
                  containerClassName="mb-0"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Payment Processing Options */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-settings-3-line me-2"></i>
                  Payment Processing
                </h5>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <div className="form-check form-switch mb-3">
                    <Controller
                      name="auto_capture_enabled"
                      control={control}
                      render={({ field }) => (
                        <Form.Check
                          type="switch"
                          id="auto_capture_enabled"
                          label="Auto Capture Payments"
                          checked={Boolean(field.value)}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                    <small className="text-muted">Automatically capture authorized payments</small>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <Controller
                      name="partial_payments_enabled"
                      control={control}
                      render={({ field }) => (
                        <Form.Check
                          type="switch"
                          id="partial_payments_enabled"
                          label="Allow Partial Payments"
                          checked={Boolean(field.value)}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                    <small className="text-muted">Allow users to pay in installments</small>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <Controller
                      name="recurring_payments_enabled"
                      control={control}
                      render={({ field }) => (
                        <Form.Check
                          type="switch"
                          id="recurring_payments_enabled"
                          label="Enable Recurring Payments"
                          checked={Boolean(field.value)}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                    <small className="text-muted">Support monthly maintenance and other recurring charges</small>
                  </div>

                  <div className="form-check form-switch mb-0">
                    <Controller
                      name="refund_enabled"
                      control={control}
                      render={({ field }) => (
                        <Form.Check
                          type="switch"
                          id="refund_enabled"
                          label="Enable Refunds"
                          checked={Boolean(field.value)}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                    <small className="text-muted">Allow processing refunds through the system</small>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Payment Instructions */}
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  <i className="ri-file-text-line me-2"></i>
                  Payment Instructions & Terms
                </h5>
              </CardHeader>
              <CardBody>
                <TextAreaFormInput
                  name="payment_instructions"
                  label="Payment Instructions"
                  placeholder="Enter instructions to be shown to users during payment..."
                  rows={4}
                  control={control}
                  containerClassName="mb-3"
                />

                <TextAreaFormInput
                  name="payment_terms"
                  label="Payment Terms & Conditions"
                  placeholder="Enter payment terms and conditions..."
                  rows={4}
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
                <Alert variant="info" className="mb-3">
                  <i className="ri-information-line me-2"></i>
                  <strong>Note:</strong> Disabling a payment method will hide it from users during checkout. 
                  Ensure at least one payment method is enabled at all times.
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
                      'Save Payment Methods'
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

export default PaymentMethodsPage;
