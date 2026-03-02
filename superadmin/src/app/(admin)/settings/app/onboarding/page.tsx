'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Form, Table, Badge } from 'react-bootstrap';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import { useUploadFile, StorageBucket } from '@/hooks/useFileUpload';
import { useSettingsCategory } from '@/hooks/useSettingsCategory';

// Onboarding step validation schema
const onboardingStepSchema = yup.object({
  title: yup.string().required('Title is required'),
  subtitle: yup.string().required('Subtitle is required'),
  description: yup.string().required('Description is required'),
  image_url: yup.string().nullable(),
  animation_type: yup.string().required('Animation type is required'),
  order: yup.number().required('Order is required'),
  enabled: yup.boolean().required(),
});

// Main form validation schema
const onboardingSettingsSchema = yup.object({
  onboarding_enabled: yup.boolean().required('Onboarding enable/disable is required'),
  skip_enabled: yup.boolean().required('Skip option setting is required'),
  steps: yup.array().of(onboardingStepSchema).min(1, 'At least one step is required'),
});

type OnboardingSettingsFormData = yup.InferType<typeof onboardingSettingsSchema>;

// Animation type options
const animationOptions = [
  { label: 'Fade In', value: 'fadeIn' },
  { label: 'Slide Left', value: 'slideLeft' },
  { label: 'Slide Right', value: 'slideRight' },
  { label: 'Slide Up', value: 'slideUp' },
  { label: 'Scale', value: 'scale' },
  { label: 'None', value: 'none' },
];

export default function OnboardingSettingsPage() {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const {
    data: onboardingSettings,
    isLoading,
    error,
    saveSettingsAsync,
    isSaving,
  } = useSettingsCategory<OnboardingSettingsFormData>({
    queryKey: ['application-settings', 'onboarding'],
    category: 'application',
    subcategory: 'onboarding',
    defaults: {
      onboarding_enabled: true,
      skip_enabled: true,
      steps: [
        {
          title: 'Welcome to Casa Nirvana',
          subtitle: 'Your Smart Community App',
          description:
            'Manage your community life with ease. Connect with community members, book amenities, and stay updated.',
          image_url: null,
          animation_type: 'fadeIn',
          order: 1,
          enabled: true,
        },
        {
          title: 'Stay Connected',
          subtitle: 'Community Features',
          description: 'Chat with neighbors, join community groups, and participate in community events.',
          image_url: null,
          animation_type: 'slideLeft',
          order: 2,
          enabled: true,
        },
        {
          title: 'Easy Bookings',
          subtitle: 'Amenity Management',
          description: 'Book amenities, request maintenance, and manage payments all in one place.',
          image_url: null,
          animation_type: 'slideRight',
          order: 3,
          enabled: true,
        },
      ],
    },
  });

  // File upload hooks
  const uploadFileMutation = useUploadFile();

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<OnboardingSettingsFormData>({
    resolver: yupResolver(onboardingSettingsSchema),
    defaultValues: onboardingSettings,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps',
  });

  const watchedValues = watch();

  useEffect(() => {
    if (onboardingSettings) {
      reset(onboardingSettings);
    }
  }, [onboardingSettings, reset]);

  useEffect(() => {
    if (error) {
      setShowAlert({ type: 'danger', message: 'Failed to load onboarding settings. Please refresh the page.' });
    }
  }, [error]);

  const handleImageUpload = async (stepIndex: number, file: File) => {
    try {
      const result = await uploadFileMutation.mutateAsync({
        file,
        bucket: StorageBucket.SPLASH_IMAGES,
        path: `onboarding/step-${stepIndex + 1}-${Date.now()}.${file.name.split('.').pop()}`,
      });
      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const addNewStep = () => {
    append({
      title: 'New Step',
      subtitle: 'Step Subtitle',
      description: 'Step description goes here.',
      image_url: null,
      animation_type: 'fadeIn',
      order: fields.length + 1,
      enabled: true,
    });
  };

  const onSubmit = async (data: OnboardingSettingsFormData) => {
    try {
      await saveSettingsAsync(data);
      setShowAlert({ type: 'success', message: 'Onboarding settings updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error updating onboarding settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update onboarding settings. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  return (
    <>
      <PageTitle subName="Settings" title="Onboarding Screen" />

      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          {showAlert.message}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading onboarding settings...</p>
        </div>
      ) : (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xl={8}>
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle as="h4">Basic Settings</CardTitle>
              </CardHeader>
              <CardBody>
                <Controller
                  name="onboarding_enabled"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="onboarding_enabled"
                        label="Enable Onboarding Flow"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      {errors.onboarding_enabled && (
                        <Form.Text className="text-danger">
                          {errors.onboarding_enabled.message}
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}
                />

                <Controller
                  name="skip_enabled"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="skip_enabled"
                        label="Allow Users to Skip Onboarding"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      {errors.skip_enabled && (
                        <Form.Text className="text-danger">
                          {errors.skip_enabled.message}
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}
                />
              </CardBody>
            </Card>

            {/* Onboarding Steps */}
            <Card className="mt-4">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle as="h4">Onboarding Steps</CardTitle>
                <Button variant="primary" size="sm" onClick={addNewStep}>
                  <i className="ri-add-line me-1"></i>
                  Add Step
                </Button>
              </CardHeader>
              <CardBody>
                {fields.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="ri-file-list-3-line display-4 text-muted"></i>
                    <h5 className="mt-3">No Steps Added</h5>
                    <p className="text-muted">Add your first onboarding step to get started.</p>
                    <Button variant="primary" onClick={addNewStep}>
                      Add First Step
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border">
                        <CardHeader className="bg-light">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                              Step {index + 1}
                              {!watchedValues.steps?.[index]?.enabled && (
                                <Badge bg="secondary" className="ms-2">Disabled</Badge>
                              )}
                            </h6>
                            <div className="d-flex gap-2">
                              {index > 0 && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => move(index, index - 1)}
                                >
                                  <i className="ri-arrow-up-line"></i>
                                </Button>
                              )}
                              {index < fields.length - 1 && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => move(index, index + 1)}
                                >
                                  <i className="ri-arrow-down-line"></i>
                                </Button>
                              )}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <i className="ri-delete-bin-line"></i>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <Row>
                            <Col md={6}>
                              <Controller
                                name={`steps.${index}.title`}
                                control={control}
                                render={({ field }) => (
                                  <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                      type="text"
                                      {...field}
                                      isInvalid={!!errors.steps?.[index]?.title}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {errors.steps?.[index]?.title?.message}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                )}
                              />
                            </Col>
                            <Col md={6}>
                              <Controller
                                name={`steps.${index}.subtitle`}
                                control={control}
                                render={({ field }) => (
                                  <Form.Group className="mb-3">
                                    <Form.Label>Subtitle</Form.Label>
                                    <Form.Control
                                      type="text"
                                      {...field}
                                      isInvalid={!!errors.steps?.[index]?.subtitle}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {errors.steps?.[index]?.subtitle?.message}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                )}
                              />
                            </Col>
                          </Row>

                          <Controller
                            name={`steps.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  {...field}
                                  isInvalid={!!errors.steps?.[index]?.description}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.steps?.[index]?.description?.message}
                                </Form.Control.Feedback>
                              </Form.Group>
                            )}
                          />

                          <Row>
                            <Col md={6}>
                              <Controller
                                name={`steps.${index}.animation_type`}
                                control={control}
                                render={({ field }) => (
                                  <Form.Group className="mb-3">
                                    <Form.Label>Animation Type</Form.Label>
                                    <Form.Select
                                      {...field}
                                      isInvalid={!!errors.steps?.[index]?.animation_type}
                                    >
                                      {animationOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                      {errors.steps?.[index]?.animation_type?.message}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                )}
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Step Image</Form.Label>
                                <Form.Control
                                  type="file"
                                  accept="image/*"
                                  onChange={async (event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const imageUrl = await handleImageUpload(index, file);
                                      setValue(`steps.${index}.image_url`, imageUrl, { shouldDirty: true });
                                    } catch {
                                      setShowAlert({
                                        type: 'danger',
                                        message: `Failed to upload image for Step ${index + 1}. Please try again.`,
                                      });
                                      setTimeout(() => setShowAlert(null), 5000);
                                    } finally {
                                      event.target.value = '';
                                    }
                                  }}
                                />
                                <Form.Text className="text-muted">
                                  Recommended size: 300x300 pixels
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Controller
                            name={`steps.${index}.enabled`}
                            control={control}
                            render={({ field }) => (
                              <Form.Group className="mb-0">
                                <Form.Check
                                  type="switch"
                                  id={`step_enabled_${index}`}
                                  label="Enable this step"
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              </Form.Group>
                            )}
                          />
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col xl={4}>
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle as="h4">Preview</CardTitle>
              </CardHeader>
              <CardBody>
                {watchedValues.onboarding_enabled ? (
                  <div className="text-center">
                    <div className="mb-3">
                      <Badge bg="primary">
                        {watchedValues.steps?.filter(step => step.enabled).length || 0} Active Steps
                      </Badge>
                    </div>
                    
                    {watchedValues.steps?.filter(step => step.enabled).map((step, index) => (
                      <div key={index} className="border rounded p-3 mb-3">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <i className="ri-file-image-line" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                        </div>
                        <h6 className="mb-1">{step.title}</h6>
                        <small className="text-muted d-block mb-2">{step.subtitle}</small>
                        <p className="small mb-2">{step.description}</p>
                        <small className="text-primary">
                          Animation: {animationOptions.find(opt => opt.value === step.animation_type)?.label}
                        </small>
                      </div>
                    ))}

                    {watchedValues.skip_enabled && (
                      <div className="mt-3">
                        <small className="text-muted">✓ Skip button enabled</small>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="ri-eye-off-line display-4 text-muted"></i>
                    <h6 className="mt-2">Onboarding Disabled</h6>
                    <p className="text-muted small">Enable onboarding to see preview</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Steps Summary */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle as="h4">Steps Summary</CardTitle>
              </CardHeader>
              <CardBody>
                <Table size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Title</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchedValues.steps?.map((step, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="text-truncate" style={{ maxWidth: '120px' }}>
                          {step.title}
                        </td>
                        <td>
                          <Badge bg={step.enabled ? 'success' : 'secondary'}>
                            {step.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-4">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSaving}
          >
            {isSaving && (
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
            Save Settings
          </Button>
        </div>
      </form>
      )}
    </>
  );
}
