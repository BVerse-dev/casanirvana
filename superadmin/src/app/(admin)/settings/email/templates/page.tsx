'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useEmailTemplateSettings, { EmailTemplateSettings } from '@/hooks/useEmailTemplateSettings';

// Form validation schema
const templateSettingsSchema = yup.object({
  welcome_email_subject: yup.string().required('Welcome email subject is required'),
  welcome_email_content: yup.string().required('Welcome email content is required'),
  reset_password_subject: yup.string().required('Reset password subject is required'),
  reset_password_content: yup.string().required('Reset password content is required'),
  maintenance_request_subject: yup.string().required('Maintenance request subject is required'),
  maintenance_request_content: yup.string().required('Maintenance request content is required'),
  payment_reminder_subject: yup.string().required('Payment reminder subject is required'),
  payment_reminder_content: yup.string().required('Payment reminder content is required'),
  visitor_approval_subject: yup.string().required('Visitor approval subject is required'),
  visitor_approval_content: yup.string().required('Visitor approval content is required'),
  email_footer: yup.string().default(''),
  email_signature: yup.string().default(''),
  enable_email_templates: yup.boolean().default(true),
  template_language: yup.string().default('en'),
});

interface TemplateSettingsFormData extends EmailTemplateSettings {}

const EmailTemplatesPage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Use the email template settings hook
  const { 
    emailTemplateSettings,
    isLoadingData,
    loadError,
    updateSettings,
    isUpdating
  } = useEmailTemplateSettings();

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<TemplateSettingsFormData>({
    resolver: yupResolver(templateSettingsSchema),
    defaultValues: {
      welcome_email_subject: '',
      welcome_email_content: '',
      reset_password_subject: '',
      reset_password_content: '',
      maintenance_request_subject: '',
      maintenance_request_content: '',
      payment_reminder_subject: '',
      payment_reminder_content: '',
      visitor_approval_subject: '',
      visitor_approval_content: '',
      email_footer: '',
      email_signature: '',
      enable_email_templates: true,
      template_language: 'en',
    },
  });

  // Update form when settings data loads
  useEffect(() => {
    if (emailTemplateSettings) {
      reset(emailTemplateSettings);
    }
  }, [emailTemplateSettings, reset]);

  const onSubmit = async (data: TemplateSettingsFormData) => {
    updateSettings(data, {
      onSuccess: () => {
        setShowAlert({ type: 'success', message: 'Email templates updated successfully!' });
        setTimeout(() => setShowAlert(null), 5000);
      },
      onError: (error: any) => {
        console.error('Error updating email templates:', error);
        setShowAlert({ type: 'danger', message: 'Failed to update email templates. Please try again.' });
        setTimeout(() => setShowAlert(null), 5000);
      }
    });
  };

  // Show loading state
  if (isLoadingData) {
    return (
      <>
        <PageTitle subName="Email Settings" title="Email Templates" />
        <div className="d-flex justify-content-center py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading email templates...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <>
        <PageTitle subName="Email Settings" title="Email Templates" />
        <Alert variant="danger">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Failed to load email templates. Please refresh the page to try again.
        </Alert>
      </>
    );
  }



  return (
    <>
      <PageTitle subName="Email Settings" title="Email Templates" />

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
          <Col xl={12}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                  Template Configuration
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="enable_email_templates"
                        {...control.register('enable_email_templates')}
                      />
                      <label className="form-check-label" htmlFor="enable_email_templates">
                        Enable Email Templates
                      </label>
                      <small className="form-text text-muted d-block">
                        Use custom email templates for automated emails
                      </small>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <SelectFormInput
                      control={control}
                      name="template_language"
                      label="Template Language"
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'hi', label: 'Hindi' },
                        { value: 'mr', label: 'Marathi' },
                        { value: 'gu', label: 'Gujarati' },
                        { value: 'ta', label: 'Tamil' },
                        { value: 'te', label: 'Telugu' },
                      ]}
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:mail-line" className="me-2" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Tabs defaultActiveKey="welcome" className="mb-3">
                  <Tab eventKey="welcome" title="Welcome Email">
                    <Row>
                      <Col lg={12}>
                        <TextFormInput
                          control={control}
                          name="welcome_email_subject"
                          label="Subject"
                          placeholder="Welcome to Casa Nirvana"
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col lg={12}>
                        <TextAreaFormInput
                          control={control}
                          name="welcome_email_content"
                          label="Email Content"
                          rows={8}
                          containerClassName="mb-3"
                          placeholder="Enter email content with variables like {{user_name}}, {{user_email}}, {{temp_password}}"
                        />
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="reset-password" title="Password Reset">
                    <Row>
                      <Col lg={12}>
                        <TextFormInput
                          control={control}
                          name="reset_password_subject"
                          label="Subject"
                          placeholder="Password Reset Request"
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col lg={12}>
                        <TextAreaFormInput
                          control={control}
                          name="reset_password_content"
                          label="Email Content"
                          rows={8}
                          containerClassName="mb-3"
                          placeholder="Enter email content with variables like {{user_name}}, {{reset_link}}"
                        />
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="maintenance" title="Maintenance Request">
                    <Row>
                      <Col lg={12}>
                        <TextFormInput
                          control={control}
                          name="maintenance_request_subject"
                          label="Subject"
                          placeholder="New Maintenance Request - {{request_id}}"
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col lg={12}>
                        <TextAreaFormInput
                          control={control}
                          name="maintenance_request_content"
                          label="Email Content"
                          rows={8}
                          containerClassName="mb-3"
                          placeholder="Enter email content with variables like {{request_id}}, {{unit_number}}, {{category}}, {{description}}"
                        />
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="payment" title="Payment Reminder">
                    <Row>
                      <Col lg={12}>
                        <TextFormInput
                          control={control}
                          name="payment_reminder_subject"
                          label="Subject"
                          placeholder="Payment Reminder - {{due_date}}"
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col lg={12}>
                        <TextAreaFormInput
                          control={control}
                          name="payment_reminder_content"
                          label="Email Content"
                          rows={8}
                          containerClassName="mb-3"
                          placeholder="Enter email content with variables like {{amount}}, {{due_date}}, {{description}}"
                        />
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="visitor" title="Visitor Approval">
                    <Row>
                      <Col lg={12}>
                        <TextFormInput
                          control={control}
                          name="visitor_approval_subject"
                          label="Subject"
                          placeholder="Visitor Approved - {{visitor_name}}"
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col lg={12}>
                        <TextAreaFormInput
                          control={control}
                          name="visitor_approval_content"
                          label="Email Content"
                          rows={8}
                          containerClassName="mb-3"
                          placeholder="Enter email content with variables like {{visitor_name}}, {{visitor_phone}}, {{valid_until}}, {{otp}}"
                        />
                      </Col>
                    </Row>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:edit-line" className="me-2" />
                  Email Signature
                </CardTitle>
              </CardHeader>
              <CardBody>
                <TextAreaFormInput
                  control={control}
                  name="email_signature"
                  label="Default Signature"
                  rows={4}
                  containerClassName="mb-3"
                  placeholder="Best regards,\nCasa Nirvana Team\nwww.casanirvana.com"
                />
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">
                  <IconifyIcon icon="ri:text" className="me-2" />
                  Email Footer
                </CardTitle>
              </CardHeader>
              <CardBody>
                <TextAreaFormInput
                  control={control}
                  name="email_footer"
                  label="Default Footer"
                  rows={4}
                  containerClassName="mb-3"
                  placeholder="Casa Nirvana - Complete Community Management System\nThis is an automated email, please do not reply."
                />
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
                  Available Variables
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={3}>
                    <div className="mb-3">
                      <h6 className="fw-bold">User Variables</h6>
                      <small className="text-muted">
                        {'{{user_name}}'}<br />
                        {'{{user_email}}'}<br />
                        {'{{user_phone}}'}<br />
                        {'{{unit_number}}'}
                      </small>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="mb-3">
                      <h6 className="fw-bold">System Variables</h6>
                      <small className="text-muted">
                        {'{{app_name}}'}<br />
                        {'{{company_name}}'}<br />
                        {'{{current_date}}'}<br />
                        {'{{current_time}}'}
                      </small>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="mb-3">
                      <h6 className="fw-bold">Request Variables</h6>
                      <small className="text-muted">
                        {'{{request_id}}'}<br />
                        {'{{category}}'}<br />
                        {'{{description}}'}<br />
                        {'{{status}}'}
                      </small>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="mb-3">
                      <h6 className="fw-bold">Payment Variables</h6>
                      <small className="text-muted">
                        {'{{amount}}'}<br />
                        {'{{due_date}}'}<br />
                        {'{{payment_id}}'}<br />
                        {'{{payment_method}}'}
                      </small>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2">
          <Button 
            variant="outline-secondary" 
            type="button" 
            onClick={() => reset(emailTemplateSettings)}
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
                Save Templates
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
};

export default EmailTemplatesPage;
