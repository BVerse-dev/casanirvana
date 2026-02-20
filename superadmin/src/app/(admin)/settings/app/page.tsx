'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Form validation schema
const appSettingsSchema = yup.object({
  app_name: yup.string().required('App name is required'),
  app_description: yup.string().required('App description is required'),
  app_version: yup.string().required('App version is required'),
  company_name: yup.string().required('Company name is required'),
  company_address: yup.string().required('Company address is required'),
  company_phone: yup.string().required('Company phone is required'),
  company_email: yup.string().email('Invalid email').required('Company email is required'),
  timezone: yup.string().required('Timezone is required'),
  date_format: yup.string().required('Date format is required'),
  time_format: yup.string().required('Time format is required'),
  currency_code: yup.string().required('Currency code is required'),
  currency_symbol: yup.string().required('Currency symbol is required'),
  enable_analytics: yup.boolean().optional(),
  enable_error_reporting: yup.boolean().optional(),
  maintenance_mode: yup.boolean().optional(),
  debug_mode: yup.boolean().optional(),
});

interface AppSettingsFormData {
  app_name: string;
  app_description: string;
  app_version: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  timezone: string;
  date_format: string;
  time_format: string;
  currency_code: string;
  currency_symbol: string;
  enable_analytics?: boolean;
  enable_error_reporting?: boolean;
  maintenance_mode?: boolean;
  debug_mode?: boolean;
}

const AppSettingsPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const { control, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<AppSettingsFormData>({
    resolver: yupResolver(appSettingsSchema),
    defaultValues: {
      app_name: 'Casa Nirvana',
      app_description: 'Complete Society Management System',
      app_version: '1.0.0',
      company_name: 'Casa Nirvana Technologies',
      company_address: '123 Tech Park, Bangalore, Karnataka 560001',
      company_phone: '+91 80 1234 5678',
      company_email: 'admin@casanirvana.com',
      timezone: 'Asia/Kolkata',
      date_format: 'dd/MM/yyyy',
      time_format: '24h',
      currency_code: 'INR',
      currency_symbol: '$',
      enable_analytics: true,
      enable_error_reporting: true,
      maintenance_mode: false,
      debug_mode: false,
    },
  });

  const onSubmit = async (data: AppSettingsFormData) => {
    try {
      // Mock save operation - replace with actual Supabase call later
      console.log('Saving app settings:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setShowAlert({ type: 'success', message: 'App settings updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error updating app settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update app settings. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  ];

  const dateFormatOptions = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
    { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
  ];

  const timeFormatOptions = [
    { value: '12h', label: '12 Hour (AM/PM)' },
    { value: '24h', label: '24 Hour' },
  ];

  const currencyOptions = [
    { value: 'INR', label: 'Indian Rupee ($)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'AED', label: 'UAE Dirham (د.إ)' },
  ];

  return (
    <>
      <PageTitle subName="Settings" title="App Settings" />

      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          <IconifyIcon 
            icon={showAlert.type === 'success' ? 'ri:check-line' : 'ri:error-warning-line'} 
            className="me-2" 
          />
          {showAlert.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:apps-line" className="me-2" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <TextFormInput
                      control={control}
                      name="app_name"
                      label="Application Name"
                      placeholder="Casa Nirvana"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={12}>
                    <TextAreaFormInput
                      control={control}
                      name="app_description"
                      label="Application Description"
                      placeholder="Complete Society Management System"
                      rows={3}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={12}>
                    <TextFormInput
                      control={control}
                      name="app_version"
                      label="Application Version"
                      placeholder="1.0.0"
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
                  <IconifyIcon icon="ri:building-line" className="me-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <TextFormInput
                      control={control}
                      name="company_name"
                      label="Company Name"
                      placeholder="Casa Nirvana Technologies"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={12}>
                    <TextAreaFormInput
                      control={control}
                      name="company_address"
                      label="Company Address"
                      placeholder="123 Tech Park, Bangalore, Karnataka 560001"
                      rows={3}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <TextFormInput
                      control={control}
                      name="company_phone"
                      label="Company Phone"
                      placeholder="+91 80 1234 5678"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <TextFormInput
                      control={control}
                      name="company_email"
                      label="Company Email"
                      placeholder="admin@casanirvana.com"
                      type="email"
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:global-line" className="me-2" />
                  Localization Settings
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <SelectFormInput
                      control={control}
                      name="timezone"
                      label="Timezone"
                      options={timezoneOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <SelectFormInput
                      control={control}
                      name="date_format"
                      label="Date Format"
                      options={dateFormatOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <SelectFormInput
                      control={control}
                      name="time_format"
                      label="Time Format"
                      options={timeFormatOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <SelectFormInput
                      control={control}
                      name="currency_code"
                      label="Currency Code"
                      options={currencyOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col lg={6}>
                    <TextFormInput
                      control={control}
                      name="currency_symbol"
                      label="Currency Symbol"
                      placeholder="$"
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
                  <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="enable_analytics"
                        label="Enable Analytics"
                        {...control.register('enable_analytics')}
                      />
                      <Form.Text className="text-muted">
                        Collect anonymous usage statistics to improve the application
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="enable_error_reporting"
                        label="Enable Error Reporting"
                        {...control.register('enable_error_reporting')}
                      />
                      <Form.Text className="text-muted">
                        Automatically report errors to help improve stability
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="maintenance_mode"
                        label="Maintenance Mode"
                        {...control.register('maintenance_mode')}
                      />
                      <Form.Text className="text-muted">
                        <strong className="text-warning">Caution:</strong> This will make the app unavailable to users
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="debug_mode"
                        label="Debug Mode"
                        {...control.register('debug_mode')}
                      />
                      <Form.Text className="text-muted">
                        Enable detailed logging for troubleshooting (affects performance)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => reset()}
                    disabled={!isDirty || isSubmitting}
                  >
                    <IconifyIcon icon="ri:refresh-line" className="me-1" />
                    Reset
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
                        <IconifyIcon icon="ri:save-line" className="me-1" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </form>
    </>
  );
};

export default AppSettingsPage;
