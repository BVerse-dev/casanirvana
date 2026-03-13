'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Alert, Row, Col, Form, Image } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import { useAdminSettingsAssetDelete, useAdminSettingsAssetUpload } from '@/hooks/useAdminSettingsAssets';
import { useSettingsCategory } from '@/hooks/useSettingsCategory';

// Comprehensive form validation schema
const splashSettingsSchema = yup.object({
  splash_enabled: yup.boolean().required('Splash screen enable/disable is required'),
  splash_duration: yup.number()
    .min(1000, 'Duration must be at least 1000ms')
    .max(10000, 'Duration must not exceed 10000ms')
    .required('Duration is required'),
  splash_title: yup.string().required('Title is required'),
  splash_subtitle: yup.string().required('Subtitle is required'),
  splash_background_color: yup.string().required('Background color is required'),
  splash_text_color: yup.string().required('Text color is required'),
  splash_animation_type: yup.string().required('Animation type is required'),
  splash_logo_enabled: yup.boolean().required('Logo setting is required'),
  splash_loading_indicator: yup.boolean().required('Loading indicator setting is required'),
  splash_image_url: yup.string().nullable(),
  splash_image_path: yup.string().nullable(),
});

type SplashSettingsFormData = yup.InferType<typeof splashSettingsSchema>;

// Animation type options
const animationOptions = [
  { label: 'Fade In', value: 'fadeIn' },
  { label: 'Slide Up', value: 'slideUp' },
  { label: 'Slide Down', value: 'slideDown' },
  { label: 'Scale', value: 'scale' },
  { label: 'None', value: 'none' },
];

export default function SplashSettingsPage() {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data: splashSettings,
    isLoading,
    error,
    saveSettingsAsync,
    isSaving,
  } = useSettingsCategory<SplashSettingsFormData>({
    queryKey: ['application-settings', 'splash'],
    category: 'application',
    subcategory: 'splash',
    defaults: {
      splash_enabled: true,
      splash_duration: 3000,
      splash_title: 'Casa Nirvana',
      splash_subtitle: 'Your Smart Community Management',
      splash_background_color: '#ffffff',
      splash_text_color: '#000000',
      splash_animation_type: 'fadeIn',
      splash_logo_enabled: true,
      splash_loading_indicator: true,
      splash_image_url: null,
      splash_image_path: null,
    },
  });

  const uploadAssetMutation = useAdminSettingsAssetUpload();
  const deleteAssetMutation = useAdminSettingsAssetDelete();

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<SplashSettingsFormData>({
    resolver: yupResolver(splashSettingsSchema),
    defaultValues: splashSettings,
  });

  const watchedValues = watch();

  useEffect(() => {
    if (!splashSettings) return;
    reset(splashSettings);
    setUploadedImageUrl(splashSettings.splash_image_url || null);
    setCurrentImagePath(splashSettings.splash_image_path || null);
  }, [splashSettings, reset]);

  useEffect(() => {
    if (error) {
      setShowAlert({ type: 'danger', message: 'Failed to load splash settings. Please refresh the page.' });
    }
  }, [error]);

  // Handle image file selection
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setShowAlert({ type: 'danger', message: 'Please select a valid image file.' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setShowAlert({ type: 'danger', message: 'Image file size must be less than 5MB.' });
      return;
    }

    try {
      // Delete previous image if exists
      if (currentImagePath) {
        await deleteAssetMutation.mutateAsync({
          assetType: 'splash',
          path: currentImagePath,
        });
      }

      const result = await uploadAssetMutation.mutateAsync({
        assetType: 'splash',
        file,
      });

      setUploadedImageUrl(result.url);
      setCurrentImagePath(result.path);
      setValue('splash_image_url', result.url);
      setValue('splash_image_path', result.path);
      setShowAlert({ type: 'success', message: 'Image uploaded successfully!' });
      setTimeout(() => setShowAlert(null), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setShowAlert({ type: 'danger', message: 'Failed to upload image. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  // Handle image removal
  const handleRemoveImage = async () => {
    if (!currentImagePath) return;

    try {
      await deleteAssetMutation.mutateAsync({
        assetType: 'splash',
        path: currentImagePath,
      });

      setUploadedImageUrl(null);
      setCurrentImagePath(null);
      setValue('splash_image_url', null);
      setValue('splash_image_path', null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowAlert({ type: 'success', message: 'Image removed successfully!' });
      setTimeout(() => setShowAlert(null), 3000);
    } catch (error) {
      console.error('Error removing image:', error);
      setShowAlert({ type: 'danger', message: 'Failed to remove image. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  const onSubmit = async (data: SplashSettingsFormData) => {
    try {
      const settingsData = {
        ...data,
        splash_image_url: uploadedImageUrl || data.splash_image_url,
        splash_image_path: currentImagePath,
      };
      await saveSettingsAsync(settingsData);
      
      setShowAlert({ type: 'success', message: 'Splash screen settings updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error updating splash settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update splash screen settings. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  return (
    <>
      <PageTitle subName="Settings" title="Splash Screen" />

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
          <p className="mt-3 text-muted">Loading splash settings...</p>
        </div>
      ) : (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xl={8}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">Basic Settings</CardTitle>
              </CardHeader>
              <CardBody>
                <Controller
                  name="splash_enabled"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="splash_enabled"
                        label="Enable Splash Screen"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      {errors.splash_enabled && (
                        <Form.Text className="text-danger">
                          {errors.splash_enabled.message}
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}
                />

                <Controller
                  name="splash_duration"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Duration (milliseconds)</Form.Label>
                      <Form.Control
                        type="number"
                        {...field}
                        placeholder="3000"
                        isInvalid={!!errors.splash_duration}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.splash_duration?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}
                />

                <Controller
                  name="splash_title"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Title Text</Form.Label>
                      <Form.Control
                        type="text"
                        {...field}
                        placeholder="Casa Nirvana"
                        isInvalid={!!errors.splash_title}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.splash_title?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}
                />

                <Controller
                  name="splash_subtitle"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Subtitle Text</Form.Label>
                      <Form.Control
                        type="text"
                        {...field}
                        placeholder="Your Smart Community Management"
                        isInvalid={!!errors.splash_subtitle}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.splash_subtitle?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}
                />
              </CardBody>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle as="h4">Visual Settings</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <Controller
                      name="splash_background_color"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label>Background Color</Form.Label>
                          <Form.Control
                            type="color"
                            {...field}
                            isInvalid={!!errors.splash_background_color}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.splash_background_color?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={6}>
                    <Controller
                      name="splash_text_color"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label>Text Color</Form.Label>
                          <Form.Control
                            type="color"
                            {...field}
                            isInvalid={!!errors.splash_text_color}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.splash_text_color?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      )}
                    />
                  </Col>
                </Row>

                <Controller
                  name="splash_animation_type"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Animation Type</Form.Label>
                      <Form.Select
                        {...field}
                        isInvalid={!!errors.splash_animation_type}
                      >
                        {animationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.splash_animation_type?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}
                />

                <Controller
                  name="splash_logo_enabled"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="splash_logo_enabled"
                        label="Show Logo"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      {errors.splash_logo_enabled && (
                        <Form.Text className="text-danger">
                          {errors.splash_logo_enabled.message}
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}
                />

                <Controller
                  name="splash_loading_indicator"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="splash_loading_indicator"
                        label="Show Loading Indicator"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      {errors.splash_loading_indicator && (
                        <Form.Text className="text-danger">
                          {errors.splash_loading_indicator.message}
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}
                />
              </CardBody>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle as="h4">Splash Image</CardTitle>
              </CardHeader>
              <CardBody>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Splash Image</Form.Label>
                  <Form.Control
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadAssetMutation.isPending}
                  />
                  <Form.Text className="text-muted">
                    Recommended size: 414x896 pixels (mobile screen size). Max file size: 5MB.
                  </Form.Text>
                </Form.Group>

                {uploadAssetMutation.isPending && (
                  <div className="d-flex align-items-center mb-3">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Uploading...</span>
                    </div>
                    <span>Uploading image...</span>
                  </div>
                )}

                {uploadedImageUrl && (
                  <div className="mb-3">
                    <Form.Label>Current Image Preview</Form.Label>
                    <div className="d-flex align-items-start gap-3">
                      <Image
                        src={uploadedImageUrl}
                        alt="Splash Image Preview"
                        thumbnail
                        style={{ maxWidth: '200px', maxHeight: '300px' }}
                      />
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={deleteAssetMutation.isPending}
                      >
                        {deleteAssetMutation.isPending ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-1" role="status">
                              <span className="visually-hidden">Removing...</span>
                            </div>
                            Removing...
                          </>
                        ) : (
                          <>
                            <i className="mdi mdi-delete me-1"></i>
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col xl={4}>
            <Card>
              <CardHeader>
                <CardTitle as="h4">Live Preview</CardTitle>
              </CardHeader>
              <CardBody>
                <div 
                  className="text-center p-4 rounded position-relative"
                  style={{
                    backgroundColor: watchedValues.splash_background_color || '#ffffff',
                    color: watchedValues.splash_text_color || '#000000',
                    border: '2px solid #dee2e6',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundImage: uploadedImageUrl ? `url(${uploadedImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Overlay for text readability when image is present */}
                  {uploadedImageUrl && (
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 'inherit',
                      }}
                    />
                  )}
                  
                  <div className="position-relative" style={{ zIndex: 1 }}>
                    {watchedValues.splash_logo_enabled && !uploadedImageUrl && (
                      <div className="mb-3">
                        <i className="mdi mdi-home-city" style={{ fontSize: '3rem' }}></i>
                      </div>
                    )}
                    
                    <h4 className="mb-2" style={{ 
                      color: uploadedImageUrl ? '#ffffff' : watchedValues.splash_text_color,
                      textShadow: uploadedImageUrl ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                    }}>
                      {watchedValues.splash_title || 'Casa Nirvana'}
                    </h4>
                    
                    <p className="mb-4" style={{ 
                      color: uploadedImageUrl ? '#ffffff' : watchedValues.splash_text_color,
                      opacity: uploadedImageUrl ? 1 : 0.8,
                      textShadow: uploadedImageUrl ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                    }}>
                      {watchedValues.splash_subtitle || 'Your Smart Community Management'}
                    </p>
                    
                    {watchedValues.splash_loading_indicator && (
                      <div className="mt-auto">
                        <div 
                          className="spinner-border" 
                          style={{ 
                            color: uploadedImageUrl ? '#ffffff' : watchedValues.splash_text_color 
                          }} 
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <small 
                    className="text-muted position-absolute bottom-0 end-0 m-2"
                    style={{ 
                      color: uploadedImageUrl ? '#ffffff' : undefined,
                      textShadow: uploadedImageUrl ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                    }}
                  >
                    Duration: {watchedValues.splash_duration}ms
                  </small>
                  
                  <small 
                    className="text-muted position-absolute bottom-0 start-0 m-2"
                    style={{ 
                      color: uploadedImageUrl ? '#ffffff' : undefined,
                      textShadow: uploadedImageUrl ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                    }}
                  >
                    Animation: {animationOptions.find(opt => opt.value === watchedValues.splash_animation_type)?.label}
                  </small>
                </div>
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
