'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, FormCheck } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import TextFormInput from '@/components/from/TextFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import CheckFormInput from '@/components/from/CheckFormInput';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Animation type as const to fix TypeScript inference
const ANIMATION_TYPES = ['fadeIn', 'slideUp', 'slideDown', 'zoomIn', 'none'] as const;
type AnimationType = typeof ANIMATION_TYPES[number];

// Type definitions
interface SplashSettingsFormData {
  splash_enabled: boolean;
  splash_duration: number;
  splash_animation_type: AnimationType;
  splash_background_color: string;
  splash_text_color: string;
  splash_title: string;
  splash_subtitle: string;
  splash_logo_url: string;
  splash_logo_width: number;
  splash_logo_height: number;
  splash_show_loading: boolean;
  splash_loading_text: string;
}

// Form validation schema
const splashSettingsSchema = yup.object({
  splash_enabled: yup.boolean().required('Splash screen enable/disable is required'),
  splash_duration: yup.number()
    .min(1000, 'Duration must be at least 1000ms')
    .max(10000, 'Duration must not exceed 10000ms')
    .required('Duration is required'),
  splash_animation_type: yup.mixed<AnimationType>()
    .oneOf(ANIMATION_TYPES, 'Invalid animation type')
    .required('Animation type is required'),
  splash_background_color: yup.string().required('Background color is required'),
  splash_text_color: yup.string().required('Text color is required'),
  splash_title: yup.string().required('Title is required'),
  splash_subtitle: yup.string().required('Subtitle is required'),
  splash_logo_url: yup.string().url('Must be a valid URL').nullable(),
  splash_logo_width: yup.number().min(1, 'Width must be positive').required('Logo width is required'),
  splash_logo_height: yup.number().min(1, 'Height must be positive').required('Logo height is required'),
  splash_show_loading: yup.boolean().required('Show loading indicator setting is required'),
  splash_loading_text: yup.string().required('Loading text is required'),
});

const animationOptions = [
  { label: 'Fade In', value: 'fadeIn' },
  { label: 'Slide Up', value: 'slideUp' },
  { label: 'Slide Down', value: 'slideDown' },
  { label: 'Zoom In', value: 'zoomIn' },
  { label: 'None', value: 'none' },
] as const;

export default function SplashSettingsPage() {
  const [showPreview, setShowPreview] = useState(false);
  const { data: settingsData, isLoading: isLoadingSettings, error: settingsError } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<SplashSettingsFormData>({
    resolver: yupResolver(splashSettingsSchema),
    defaultValues: {
      splash_enabled: true,
      splash_duration: 3000,
      splash_animation_type: 'fadeIn',
      splash_background_color: '#ffffff',
      splash_text_color: '#000000',
      splash_title: 'Casa Nirvana',
      splash_subtitle: 'Your Smart Community Management',
      splash_logo_url: '',
      splash_logo_width: 120,
      splash_logo_height: 120,
      splash_show_loading: true,
      splash_loading_text: 'Loading...',
    },
  });

  // Watch enabled state to conditionally show/hide fields
  const splashEnabled = watch('splash_enabled');
  const showLoading = watch('splash_show_loading');
  const watchedValues = watch();

  // Update form when settings data loads
  useEffect(() => {
    if (settingsData?.settings) {
      const settings = settingsData.settings;
      reset({
        splash_enabled: settings.splash_enabled === 'true' || settings.splash_enabled === true,
        splash_duration: Number(settings.splash_duration) || 3000,
        splash_animation_type: (settings.splash_animation_type as AnimationType) || 'fadeIn',
        splash_background_color: settings.splash_background_color || '#ffffff',
        splash_text_color: settings.splash_text_color || '#000000',
        splash_title: settings.splash_title || 'Casa Nirvana',
        splash_subtitle: settings.splash_subtitle || 'Your Smart Community Management',
        splash_logo_url: settings.splash_logo_url || '',
        splash_logo_width: Number(settings.splash_logo_width) || 120,
        splash_logo_height: Number(settings.splash_logo_height) || 120,
        splash_show_loading: settings.splash_show_loading === 'true' || settings.splash_show_loading === true,
        splash_loading_text: settings.splash_loading_text || 'Loading...',
      });
    }
  }, [settingsData, reset]);

  const onSubmit = async (data: SplashSettingsFormData) => {
    try {
      await updateSettingsMutation.mutateAsync(data);
      setShowAlert({ type: 'success', message: 'Splash screen settings updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error updating splash settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update splash screen settings. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <Alert variant="danger">
        <IconifyIcon icon="ri:error-warning-line" className="me-2" />
        Error loading splash screen settings: {settingsError.message}
      </Alert>
    );
  }

  return (
    <>
      <PageTitle subName="Settings" title="Splash Screen" />

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
                  <IconifyIcon icon="ri:image-line" className="me-2" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardBody>
                <CheckFormInput
                  name="splash_enabled"
                  control={control}
                  type="switch"
                  label="Enable Splash Screen"
                  containerClassName="mb-3"
                />
                <small className="text-muted">Show splash screen when the app loads</small>

                {splashEnabled && (
                  <>
                    <TextFormInput
                      control={control}
                      type="number"
                      name="splash_duration"
                      label="Duration (milliseconds)"
                      placeholder="3000"
                      containerClassName="mb-3"
                    />
                    <small className="text-muted">How long to show the splash screen (1000-10000ms)</small>

                    <SelectFormInput
                      control={control}
                      name="splash_animation_type"
                      label="Animation Type"
                      containerClassName="mb-3"
                      options={animationOptions}
                    />
                    <small className="text-muted">Animation effect for splash screen</small>
                  </>
                )}
              </CardBody>
            </Card>

            {splashEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle as="h5" className="mb-0">
                    <IconifyIcon icon="ri:palette-line" className="me-2" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <label htmlFor="splash_background_color" className="form-label">
                      Background Color
                    </label>
                    <Controller
                      name="splash_background_color"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="color"
                          id="splash_background_color"
                          className="form-control form-control-color"
                        />
                      )}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="splash_text_color" className="form-label">
                      Text Color
                    </label>
                    <Controller
                      name="splash_text_color"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="color"
                          id="splash_text_color"
                          className="form-control form-control-color"
                        />
                      )}
                    />
                  </div>

                  <TextFormInput
                    name="splash_title"
                    control={control}
                    label="Title Text"
                    placeholder="Casa Nirvana"
                    containerClassName="mb-3"
                  />

                  <TextFormInput
                    name="splash_subtitle"
                    control={control}
                    label="Subtitle Text"
                    placeholder="Your Smart Community Management"
                    containerClassName="mb-3"
                  />
                </CardBody>
              </Card>
            )}
          </Col>

          <Col xl={6}>
            {splashEnabled && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle as="h5" className="mb-0">
                      <IconifyIcon icon="ri:image-2-line" className="me-2" />
                      Logo Settings
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <TextFormInput
                      name="splash_logo_url"
                      control={control}
                      label="Logo URL"
                      placeholder="https://example.com/logo.png"
                      containerClassName="mb-3"
                    />

                    <Row>
                      <Col md={6}>
                        <TextFormInput
                          type="number"
                          name="splash_logo_width"
                          control={control}
                          label="Logo Width (px)"
                          placeholder="120"
                          containerClassName="mb-3"
                        />
                      </Col>
                      <Col md={6}>
                        <TextFormInput
                          type="number"
                          name="splash_logo_height"
                          control={control}
                          label="Logo Height (px)"
                          placeholder="120"
                          containerClassName="mb-3"
                        />
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle as="h5" className="mb-0">
                      <IconifyIcon icon="ri:loader-4-line" className="me-2" />
                      Loading Indicator
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <CheckFormInput
                      name="splash_show_loading"
                      control={control}
                      type="switch"
                      label="Show Loading Indicator"
                      containerClassName="mb-3"
                    />

                    {showLoading && (
                      <TextFormInput
                        name="splash_loading_text"
                        control={control}
                        label="Loading Text"
                        placeholder="Loading..."
                        containerClassName="mb-3"
                      />
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle as="h5" className="mb-0">
                      <IconifyIcon icon="ri:eye-line" className="me-2" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div 
                      style={{
                        backgroundColor: watchedValues.splash_background_color,
                        color: watchedValues.splash_text_color,
                        padding: '40px 20px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #e3e6f0',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                      }}
                    >
                      {watchedValues.splash_logo_url ? (
                        <img
                          src={watchedValues.splash_logo_url}
                          alt="Logo"
                          style={{
                            width: `${watchedValues.splash_logo_width}px`,
                            height: `${watchedValues.splash_logo_height}px`,
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div 
                          style={{
                            width: `${watchedValues.splash_logo_width}px`,
                            height: `${watchedValues.splash_logo_height}px`,
                            backgroundColor: '#ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#666',
                            border: '1px dashed #999',
                          }}
                        >
                          Logo
                        </div>
                      )}
                      
                      {watchedValues.splash_title && (
                        <h5 style={{ margin: 0, color: watchedValues.splash_text_color }}>
                          {watchedValues.splash_title}
                        </h5>
                      )}
                      {watchedValues.splash_subtitle && (
                        <p style={{ margin: 0, fontSize: '14px', color: watchedValues.splash_text_color }}>
                          {watchedValues.splash_subtitle}
                        </p>
                      )}
                      {showLoading && (
                        <div style={{ marginTop: '16px' }}>
                          <div 
                            className="spinner-border spinner-border-sm me-2"
                            style={{ color: watchedValues.splash_text_color }}
                          />
                          <small style={{ color: watchedValues.splash_text_color }}>
                            {watchedValues.splash_loading_text}
                          </small>
                        </div>
                      )}
                    </div>
                    <small className="text-muted mt-2 d-block">
                      This is a preview of how your splash screen will appear
                    </small>
                  </CardBody>
                </Card>
              </>
            )}
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-4">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSubmitting || updateSettingsMutation.isPending}
          >
            {(isSubmitting || updateSettingsMutation.isPending) && (
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
            <IconifyIcon icon="ri:save-line" className="me-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </>
  );
}
