'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardBody, Row, Col, Button, Alert } from 'reactstrap';
import { CardTitle } from '@/components/ui/CardTitle';
import { TextFormInput } from '@/components/from/TextFormInput';
import { ChoicesFormInput } from '@/components/from/ChoicesFormInput';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';

// Validation schema
const splashSettingsSchema = yup.object({
  enabled: yup.boolean().required(),
  duration: yup.number().min(1000).max(10000).required(),
  animationType: yup.string().oneOf(['fadeIn', 'slideUp', 'slideDown', 'zoomIn', 'none']).required(),
  backgroundColor: yup.string().required(),
  textColor: yup.string().required(),
  title: yup.string().max(100).required(),
  subtitle: yup.string().max(200).required(),
  logoUrl: yup.string().url().nullable(),
  logoWidth: yup.number().min(50).max(400).required(),
  logoHeight: yup.number().min(50).max(400).required(),
  showLoadingIndicator: yup.boolean().required(),
  loadingText: yup.string().max(50).required(),
});

type SplashSettingsForm = yup.InferType<typeof splashSettingsSchema>;

export default function SplashSettingsPage() {
  const [showPreview, setShowPreview] = useState(false);
  const { data: settingsData, isLoading } = useSettings();
  const { mutate: updateSettings, isPending, isSuccess, error } = useUpdateSettings();

  const defaultValues: SplashSettingsForm = {
    enabled: true,
    duration: 3000,
    animationType: 'fadeIn',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    title: 'Casa Nirvana',
    subtitle: 'Your Smart Community Management',
    logoUrl: '/logo.png',
    logoWidth: 120,
    logoHeight: 120,
    showLoadingIndicator: true,
    loadingText: 'Loading...',
  };

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<SplashSettingsForm>({
    resolver: yupResolver(splashSettingsSchema),
    defaultValues,
  });

  const watchedValues = watch();

  // Load settings data when available
  useEffect(() => {
    if (settingsData?.settings?.splash) {
      reset({
        ...defaultValues,
        ...settingsData.settings.splash,
      });
    }
  }, [settingsData, reset]);

  const onSubmit = (data: SplashSettingsForm) => {
    updateSettings({
      splash: data,
    });
  };

  const handleToggle = (field: 'enabled' | 'showLoadingIndicator', value: boolean) => {
    reset({
      ...watchedValues,
      [field]: value,
    });
  };

  const handleColorChange = (field: 'backgroundColor' | 'textColor', value: string) => {
    reset({
      ...watchedValues,
      [field]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Row>
        <Col lg={8}>
          <Card>
            <CardBody>
              <CardTitle as="h4" className="mb-4">
                Splash Screen Settings
              </CardTitle>

              {isSuccess && (
                <Alert color="success" className="mb-4">
                  Splash screen settings updated successfully!
                </Alert>
              )}

              {error && (
                <Alert color="danger" className="mb-4">
                  Error updating settings: {error.message}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Enable Splash Screen</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="enabledSwitch"
                          checked={watchedValues.enabled}
                          onChange={(e) => handleToggle('enabled', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="enabledSwitch">
                          Show splash screen on app load
                        </label>
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <TextFormInput
                      label="Duration (ms)"
                      name="duration"
                      control={control}
                      type="number"
                      placeholder="3000"
                      errors={errors}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <ChoicesFormInput
                      label="Animation Type"
                      name="animationType"
                      control={control}
                      errors={errors}
                    >
                      <option value="fadeIn">Fade In</option>
                      <option value="slideUp">Slide Up</option>
                      <option value="slideDown">Slide Down</option>
                      <option value="zoomIn">Zoom In</option>
                      <option value="none">No Animation</option>
                    </ChoicesFormInput>
                  </Col>

                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Show Loading Indicator</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="loadingSwitch"
                          checked={watchedValues.showLoadingIndicator}
                          onChange={(e) => handleToggle('showLoadingIndicator', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="loadingSwitch">
                          Display loading animation
                        </label>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Background Color</label>
                      <div className="input-group">
                        <input
                          className="form-control"
                          type="color"
                          value={watchedValues.backgroundColor}
                          onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                        />
                        <input
                          className="form-control"
                          type="text"
                          value={watchedValues.backgroundColor}
                          onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Text Color</label>
                      <div className="input-group">
                        <input
                          className="form-control"
                          type="color"
                          value={watchedValues.textColor}
                          onChange={(e) => handleColorChange('textColor', e.target.value)}
                        />
                        <input
                          className="form-control"
                          type="text"
                          value={watchedValues.textColor}
                          onChange={(e) => handleColorChange('textColor', e.target.value)}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <TextFormInput
                      label="Title"
                      name="title"
                      control={control}
                      placeholder="Casa Nirvana"
                      errors={errors}
                    />
                  </Col>

                  <Col md={6}>
                    <TextFormInput
                      label="Subtitle"
                      name="subtitle"
                      control={control}
                      placeholder="Your Smart Community Management"
                      errors={errors}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <TextFormInput
                      label="Logo URL"
                      name="logoUrl"
                      control={control}
                      placeholder="/logo.png"
                      errors={errors}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <TextFormInput
                      label="Logo Width (px)"
                      name="logoWidth"
                      control={control}
                      type="number"
                      placeholder="120"
                      errors={errors}
                    />
                  </Col>

                  <Col md={6}>
                    <TextFormInput
                      label="Logo Height (px)"
                      name="logoHeight"
                      control={control}
                      type="number"
                      placeholder="120"
                      errors={errors}
                    />
                  </Col>
                </Row>

                {watchedValues.showLoadingIndicator && (
                  <Row>
                    <Col md={6}>
                      <TextFormInput
                        label="Loading Text"
                        name="loadingText"
                        control={control}
                        placeholder="Loading..."
                        errors={errors}
                      />
                    </Col>
                  </Row>
                )}

                <div className="d-flex gap-2 mt-4">
                  <Button type="submit" color="primary" disabled={isPending}>
                    {isPending ? 'Updating...' : 'Update Settings'}
                  </Button>
                  <Button 
                    type="button" 
                    color="outline-secondary" 
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          {showPreview && (
            <Card>
              <CardBody>
                <CardTitle as="h6" className="mb-3">
                  Preview
                </CardTitle>
                <div 
                  className="border rounded p-4 text-center position-relative"
                  style={{
                    backgroundColor: watchedValues.backgroundColor,
                    color: watchedValues.textColor,
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {watchedValues.logoUrl && (
                    <img
                      src={watchedValues.logoUrl}
                      alt="Logo"
                      style={{
                        width: `${watchedValues.logoWidth}px`,
                        height: `${watchedValues.logoHeight}px`,
                        objectFit: 'contain',
                        marginBottom: '1rem'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {watchedValues.title && (
                    <h4 className="mb-2" style={{ color: watchedValues.textColor }}>
                      {watchedValues.title}
                    </h4>
                  )}
                  
                  {watchedValues.subtitle && (
                    <p className="mb-3" style={{ color: watchedValues.textColor }}>
                      {watchedValues.subtitle}
                    </p>
                  )}
                  
                  {watchedValues.showLoadingIndicator && (
                    <div className="mt-3">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <small style={{ color: watchedValues.textColor }}>
                        {watchedValues.loadingText}
                      </small>
                    </div>
                  )}
                  
                  <small className="position-absolute bottom-0 end-0 me-2 mb-2 text-muted">
                    Duration: {watchedValues.duration}ms
                  </small>
                </div>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
