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
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { toast } from 'react-hot-toast';
import { useApplicationConfig, useUpdateApplicationConfig } from '@/hooks/useApplicationConfig';

// Form validation schema
const applicationConfigSchema = yup.object({
  application_name: yup.string().required('Application name is required'),
  application_tagline: yup.string().required('Application tagline is required'),
  organization_name: yup.string().required('Organization name is required'),
  contact_email: yup.string().email('Invalid email').required('Contact email is required'),
  support_email: yup.string().email('Invalid email').required('Support email is required'),
  contact_phone: yup.string().required('Contact phone is required'),
  website_url: yup.string().url('Invalid URL'),
  address: yup.string().required('Address is required'),
  description: yup.string(),
});

interface ApplicationConfigFormData {
  application_name: string;
  application_tagline: string;
  organization_name: string;
  contact_email: string;
  support_email: string;
  contact_phone: string;
  website_url?: string;
  address: string;
  description?: string;
}

const ApplicationConfigPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const { data: applicationConfig, isLoading: isLoadingConfig, error: configError } = useApplicationConfig();
  const updateApplicationConfig = useUpdateApplicationConfig();

  const { control, handleSubmit, reset, watch, formState: { isDirty, isSubmitting } } = useForm<ApplicationConfigFormData>({
    resolver: yupResolver(applicationConfigSchema),
    defaultValues: {
      application_name: '',
      application_tagline: '',
      organization_name: '',
      contact_email: '',
      support_email: '',
      contact_phone: '',
      website_url: '',
      address: '',
      description: '',
    },
  });

  // Load data from Supabase when available
  useEffect(() => {
    if (applicationConfig) {
      reset(applicationConfig);
    }
  }, [applicationConfig, reset]);

  const onSubmit = async (data: ApplicationConfigFormData) => {
    try {
      await updateApplicationConfig.mutateAsync(data);
      
      toast.success('Application configuration updated successfully!');
      setShowAlert({ type: 'success', message: 'Application configuration has been updated successfully.' });
    } catch (error) {
      console.error('Error updating application config:', error);
      toast.error('Failed to update application configuration');
      setShowAlert({ type: 'danger', message: 'Failed to update application configuration. Please try again.' });
    }
  };

  const watchedValues = watch();
  const supportChannels = [
    watchedValues.contact_email,
    watchedValues.support_email,
    watchedValues.contact_phone,
  ].filter((value) => typeof value === 'string' && value.trim().length > 0).length;
  const publicWebsiteConfigured =
    typeof watchedValues.website_url === 'string' && watchedValues.website_url.trim().length > 0;

  if (configError && !applicationConfig) {
    return (
      <>
        <PageTitle title="Application Configuration" subName="General Settings" />
        <Card>
          <CardBody>
            <Alert variant="danger" className="mb-0">
              <IconifyIcon icon="material-symbols:error" className="me-2" />
              Failed to load application configuration. Fix the backend connection and reload this page before making changes.
            </Alert>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Application Configuration" subName="General Settings" />
      
      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          {showAlert.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <CardTitle as="h5" className="mb-1">Application Configuration</CardTitle>
              <p className="text-muted mb-0">
                Configure basic application information and branding
              </p>
            </div>
            <IconifyIcon icon="material-symbols:settings-applications" className="text-primary fs-2" />
          </div>
        </CardHeader>
        <CardBody>
          {isLoadingConfig ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading application configuration...</p>
              </div>
            </div>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information Section */}
            <div className="mb-4">
              <h6 className="mb-3 text-primary">
                <IconifyIcon icon="material-symbols:info" className="me-2" />
                Basic Information
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <TextFormInput
                    name="application_name"
                    label="Application Name"
                    placeholder="Casa Nirvana"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="application_tagline"
                    label="Application Tagline"
                    placeholder="Smart Community Management Platform"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="organization_name"
                    label="Organization Name"
                    placeholder="BVerse Ltd"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="website_url"
                    label="Website URL"
                    placeholder="https://casanirvana.app"
                    control={control}
                  />
                </Col>
                <Col md={12}>
                  <TextAreaFormInput
                    name="description"
                    label="Description"
                    placeholder="Brief description of your organization..."
                    rows={3}
                    control={control}
                  />
                </Col>
              </Row>
            </div>

            {/* Contact Information Section */}
            <div className="mb-4">
              <h6 className="mb-3 text-success">
                <IconifyIcon icon="material-symbols:contact-mail" className="me-2" />
                Contact Information
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <TextFormInput
                    name="contact_email"
                    label="Contact Email"
                    type="email"
                    placeholder="contact@casanirvana.com"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="support_email"
                    label="Support Email"
                    type="email"
                    placeholder="support@casanirvana.com"
                    control={control}
                  />
                </Col>
                <Col md={6}>
                  <TextFormInput
                    name="contact_phone"
                    label="Contact Phone"
                    placeholder="+233 20 000 0000"
                    control={control}
                  />
                </Col>
                <Col md={12}>
                  <TextAreaFormInput
                    name="address"
                    label="Address"
                    placeholder="Complete organization address..."
                    rows={3}
                    control={control}
                  />
                </Col>
              </Row>
            </div>

            {/* App-specific Settings Preview */}
            <div className="mb-4">
              <h6 className="mb-3 text-info">
                <IconifyIcon icon="material-symbols:apps" className="me-2" />
                Configuration Coverage
              </h6>
              <Row className="g-3">
                <Col md={4}>
                  <Card className="bg-light border-0">
                    <CardBody className="p-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <IconifyIcon icon="material-symbols:smartphone" className="text-primary fs-2" />
                        </div>
                        <div>
                          <h6 className="mb-1">Public Website</h6>
                          <span className={`badge ${publicWebsiteConfigured ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {publicWebsiteConfigured ? 'Configured' : 'Needs URL'}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="bg-light border-0">
                    <CardBody className="p-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <IconifyIcon icon="material-symbols:security" className="text-warning fs-2" />
                        </div>
                        <div>
                          <h6 className="mb-1">Support Channels</h6>
                          <span className="badge bg-success-subtle text-success">{supportChannels} Configured</span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="bg-light border-0">
                    <CardBody className="p-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <IconifyIcon icon="material-symbols:admin-panel-settings" className="text-danger fs-2" />
                        </div>
                        <div>
                          <h6 className="mb-1">Organization Profile</h6>
                          <span className={`badge ${watchedValues.organization_name ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {watchedValues.organization_name ? 'Configured' : 'Needs Review'}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => applicationConfig && reset(applicationConfig)}
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

export default ApplicationConfigPage;
