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
import { useBusinessConfig, useUpdateBusinessConfig } from '@/hooks/useBusinessConfig';

// Form validation schema
const businessConfigSchema = yup.object({
  default_currency: yup.string().required('Default currency is required'),
  maintenance_fee: yup.number().min(0, 'Must be positive').required('Maintenance fee is required'),
  late_payment_penalty_percentage: yup.number().min(0, 'Must be positive').max(100, 'Cannot exceed 100%'),
  payment_reminder_days: yup.number().min(1, 'Must be at least 1 day').max(30, 'Cannot exceed 30 days').required('Payment reminder days is required'),
  payment_due_grace_period_days: yup.number().min(0, 'Must be positive').max(30, 'Cannot exceed 30 days'),
  visitor_pass_expiry_hours: yup.number().min(1, 'Must be at least 1 hour').max(168, 'Cannot exceed 7 days').required('Visitor pass expiry hours is required'),
  max_visitors_per_unit: yup.number().min(1, 'Must be at least 1').max(20, 'Cannot exceed 20'),
  visitor_pre_approval_required: yup.boolean(),
  maintenance_request_auto_approve: yup.boolean(),
  amenity_booking_enabled: yup.boolean(),
  complaint_system_enabled: yup.boolean(),
  emergency_contacts_enabled: yup.boolean(),
  digital_notice_board_enabled: yup.boolean(),
});

interface BusinessConfigFormData {
  default_currency: string;
  maintenance_fee: number;
  late_payment_penalty_percentage?: number;
  payment_reminder_days: number;
  payment_due_grace_period_days?: number;
  visitor_pass_expiry_hours: number;
  max_visitors_per_unit?: number;
  visitor_pre_approval_required?: boolean;
  maintenance_request_auto_approve?: boolean;
  amenity_booking_enabled?: boolean;
  complaint_system_enabled?: boolean;
  emergency_contacts_enabled?: boolean;
  digital_notice_board_enabled?: boolean;
}

// Options for select inputs
const currencyOptions = [
  { value: 'GHS', label: 'Ghana Cedi (GH₵)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
];

const BusinessConfigPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Hooks for real Supabase data
  const { data: businessConfig, isLoading: isLoadingConfig, error: configError } = useBusinessConfig();
  const updateBusinessConfig = useUpdateBusinessConfig();

  const { register, control, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<BusinessConfigFormData>({
    resolver: yupResolver(businessConfigSchema),
    defaultValues: {
      default_currency: 'GHS',
      maintenance_fee: 250,
      late_payment_penalty_percentage: 5,
      payment_reminder_days: 5,
      payment_due_grace_period_days: 3,
      visitor_pass_expiry_hours: 24,
      max_visitors_per_unit: 5,
      visitor_pre_approval_required: true,
      maintenance_request_auto_approve: false,
      amenity_booking_enabled: true,
      complaint_system_enabled: true,
      emergency_contacts_enabled: true,
      digital_notice_board_enabled: true,
    },
  });

  // Load data from Supabase when available
  useEffect(() => {
    if (businessConfig) {
      reset(businessConfig);
    }
  }, [businessConfig, reset]);

  // Show error if config loading failed
  useEffect(() => {
    if (configError) {
      console.error('Error loading business config:', configError);
      setShowAlert({ 
        type: 'danger', 
        message: 'Failed to load business configuration. Please refresh the page.' 
      });
    }
  }, [configError]);

  const onSubmit = async (data: BusinessConfigFormData) => {
    try {
      await updateBusinessConfig.mutateAsync(data);
      
      toast.success('Business configuration updated successfully!');
      setShowAlert({ type: 'success', message: 'Business configuration has been updated successfully.' });
    } catch (error) {
      console.error('Error updating business config:', error);
      toast.error('Failed to update business configuration');
      setShowAlert({ type: 'danger', message: 'Failed to update business configuration. Please try again.' });
    }
  };

  return (
    <>
      <PageTitle title="Business Configuration" subName="General Settings" />
      
      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          {showAlert.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <CardTitle as="h5" className="mb-1">Business Configuration</CardTitle>
              <p className="text-muted mb-0">
                Configure financial settings, payment rules, and business policies
              </p>
            </div>
            <IconifyIcon icon="material-symbols:business-center" className="text-success fs-2" />
          </div>
        </CardHeader>
        <CardBody>
          {isLoadingConfig ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading business configuration...</p>
              </div>
            </div>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Financial Settings */}
            <div className="mb-4">
              <h6 className="mb-3 text-primary">
                <IconifyIcon icon="material-symbols:payments" className="me-2" />
                Financial Settings
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <SelectFormInput
                    name="default_currency"
                    label="Default Currency"
                    control={control}
                    options={currencyOptions}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="maintenance_fee"
                    label="Monthly Maintenance Fee"
                    type="number"
                    placeholder="2500"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="late_payment_penalty_percentage"
                    label="Late Payment Penalty (%)"
                    type="number"
                    placeholder="5"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="payment_reminder_days"
                    label="Payment Reminder (days before due)"
                    type="number"
                    placeholder="5"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="payment_due_grace_period_days"
                    label="Grace Period (days after due)"
                    type="number"
                    placeholder="3"
                    control={control}
                  />
                </Col>
              </Row>
            </div>

            {/* Visitor Management */}
            <div className="mb-4">
              <h6 className="mb-3 text-success">
                <IconifyIcon icon="material-symbols:group" className="me-2" />
                Visitor Management
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <TextFormInput
                    name="visitor_pass_expiry_hours"
                    label="Visitor Pass Expiry (hours)"
                    type="number"
                    placeholder="24"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="max_visitors_per_unit"
                    label="Max Visitors per Unit"
                    type="number"
                    placeholder="5"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("visitor_pre_approval_required")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:approval" className="me-2" />
                      Visitor Pre-approval Required
                    </label>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Feature Configuration */}
            <div className="mb-4">
              <h6 className="mb-3 text-info">
                <IconifyIcon icon="material-symbols:settings" className="me-2" />
                Feature Configuration
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("maintenance_request_auto_approve")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:home-repair-service" className="me-2" />
                      Auto-approve Maintenance Requests
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("amenity_booking_enabled")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:event-available" className="me-2" />
                      Amenity Booking System
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("complaint_system_enabled")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:report" className="me-2" />
                      Complaint Management System
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("emergency_contacts_enabled")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:emergency" className="me-2" />
                      Emergency Contacts Module
                    </label>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register("digital_notice_board_enabled")}
                    />
                    <label className="form-check-label">
                      <IconifyIcon icon="material-symbols:dashboard" className="me-2" />
                      Digital Notice Board
                    </label>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Business Insights */}
            <div className="mb-4">
              <h6 className="mb-3 text-warning">
                <IconifyIcon icon="material-symbols:analytics" className="me-2" />
                Business Insights
              </h6>
              <Row className="g-3">
                <Col md={3}>
                  <Card className="bg-primary-subtle border-primary border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:account-balance-wallet" className="text-primary fs-2 mb-2" />
                      <h6 className="mb-1">Monthly Revenue</h6>
                      <span className="text-primary fw-medium">$2,45,000</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-success-subtle border-success border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:payments" className="text-success fs-2 mb-2" />
                      <h6 className="mb-1">Collection Rate</h6>
                      <span className="text-success fw-medium">94%</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-info-subtle border-info border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:group" className="text-info fs-2 mb-2" />
                      <h6 className="mb-1">Active Visitors</h6>
                      <span className="text-info fw-medium">156</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="bg-warning-subtle border-warning border-opacity-25">
                    <CardBody className="p-3 text-center">
                      <IconifyIcon icon="material-symbols:pending-actions" className="text-warning fs-2 mb-2" />
                      <h6 className="mb-1">Pending Requests</h6>
                      <span className="text-warning fw-medium">23</span>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => businessConfig && reset(businessConfig)}
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

export default BusinessConfigPage;
