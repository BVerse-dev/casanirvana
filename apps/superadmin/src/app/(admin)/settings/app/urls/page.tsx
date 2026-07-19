
'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Form,
  Button,
  Alert,
  Table,
} from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { useSettingsCategory } from '@/hooks/useSettingsCategory';

// Validation schema for URL redirects
const urlRedirectSchema = yup.object({
  name: yup.string().required('Name is required'),
  source_url: yup.string().url('Must be a valid URL').required('Source URL is required'),
  target_url: yup.string().url('Must be a valid URL').required('Target URL is required'),
  status_code: yup.number().oneOf([301, 302, 307, 308], 'Invalid status code').required(),
  enabled: yup.boolean().required(),
  description: yup.string().nullable(),
});

// Validation schema for deep links
const deepLinkSchema = yup.object({
  name: yup.string().required('Name is required'),
  url_pattern: yup.string().required('URL pattern is required'),
  screen: yup.string().required('Target screen is required'),
  params: yup.string().nullable(),
  enabled: yup.boolean().required(),
  description: yup.string().nullable(),
});

// Comprehensive form validation schema
const urlSettingsSchema = yup.object({
  base_url: yup.string().url('Must be a valid URL').required('Base URL is required'),
  api_url: yup.string().url('Must be a valid URL').required('API URL is required'),
  websocket_url: yup.string().url('Must be a valid URL').required('WebSocket URL is required'),
  
  // Deep linking
  deep_linking_enabled: yup.boolean().required(),
  url_scheme: yup.string().required('URL scheme is required'),
  universal_links_enabled: yup.boolean().required(),
  
  // App store links
  ios_app_store_url: yup.string().url('Must be a valid URL').nullable(),
  android_play_store_url: yup.string().url('Must be a valid URL').nullable(),
  
  // Social sharing
  share_base_url: yup.string().url('Must be a valid URL').nullable(),
  
  // Redirects and deep links
  url_redirects: yup.array().of(urlRedirectSchema),
  deep_links: yup.array().of(deepLinkSchema),
});

type UrlSettingsFormData = yup.InferType<typeof urlSettingsSchema>;

// Status code options
const statusCodeOptions = [
  { label: '301 - Permanent Redirect', value: 301 },
  { label: '302 - Temporary Redirect', value: 302 },
  { label: '307 - Temporary Redirect (POST preserved)', value: 307 },
  { label: '308 - Permanent Redirect (POST preserved)', value: 308 },
];

// Available screens for deep linking
const availableScreens = [
  { label: 'Home Dashboard', value: 'dashboard' },
  { label: 'Unit Details', value: 'unit-details' },
  { label: 'Visitor Management', value: 'visitors' },
  { label: 'Maintenance Requests', value: 'maintenance' },
  { label: 'Payments', value: 'payments' },
  { label: 'Complaints', value: 'complaints' },
  { label: 'Amenity Booking', value: 'amenity-booking' },
  { label: 'Service Requests', value: 'service-requests' },
  { label: 'Messages', value: 'messages' },
  { label: 'Emergency Alerts', value: 'emergency-alerts' },
  { label: 'User Profile', value: 'profile' },
  { label: 'Settings', value: 'settings' },
];

export default function AppUrlsSettingsPage() {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const {
    data: urlSettings,
    isLoading,
    error,
    saveSettingsAsync,
    isSaving,
  } = useSettingsCategory<UrlSettingsFormData>({
    queryKey: ['application-settings', 'urls'],
    category: 'application',
    subcategory: 'urls',
    defaults: {
      base_url: 'https://app.casanirvana.com',
      api_url: 'https://api.casanirvana.com',
      websocket_url: 'wss://ws.casanirvana.com',
      deep_linking_enabled: true,
      url_scheme: 'casanirvana',
      universal_links_enabled: true,
      ios_app_store_url: null,
      android_play_store_url: null,
      share_base_url: null,
      url_redirects: [],
      deep_links: [],
    },
  });

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<UrlSettingsFormData>({
    resolver: yupResolver(urlSettingsSchema),
    defaultValues: urlSettings,
  });

  const {
    fields: redirectFields,
    append: appendRedirect,
    remove: removeRedirect,
  } = useFieldArray({
    control,
    name: 'url_redirects',
  });

  const {
    fields: deepLinkFields,
    append: appendDeepLink,
    remove: removeDeepLink,
  } = useFieldArray({
    control,
    name: 'deep_links',
  });

  const watchedValues = watch();

  useEffect(() => {
    if (urlSettings) {
      reset(urlSettings);
    }
  }, [urlSettings, reset]);

  useEffect(() => {
    if (error) {
      setShowAlert({ type: 'danger', message: 'Failed to load URL settings. Please refresh the page.' });
    }
  }, [error]);

  const onSubmit = async (data: UrlSettingsFormData) => {
    try {
      await saveSettingsAsync(data);
      setShowAlert({ type: 'success', message: 'URL settings updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error updating URL settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update URL settings. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  const addNewRedirect = () => {
    appendRedirect({
      name: 'New Redirect',
      source_url: '',
      target_url: '',
      status_code: 301,
      enabled: true,
      description: '',
    });
  };

  const addNewDeepLink = () => {
    appendDeepLink({
      name: 'New Deep Link',
      url_pattern: '',
      screen: 'dashboard',
      params: '{}',
      enabled: true,
      description: '',
    });
  };

  return (
    <>
      <PageTitle subName="Settings" title="App URLs & Redirects" />

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
          <p className="mt-3 text-muted">Loading URL settings...</p>
        </div>
      ) : (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xl={12}>
            {/* Basic URL Settings */}
            <Card>
              <CardHeader>
                <CardTitle as="h4">Basic URL Configuration</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={4}>
                    <Controller
                      name="base_url"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label>Base URL</Form.Label>
                          <Form.Control
                            type="url"
                            {...field}
                            placeholder="https://app.casanirvana.com"
                            isInvalid={!!errors.base_url}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.base_url?.message}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Main application URL
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="api_url"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label>API URL</Form.Label>
                          <Form.Control
                            type="url"
                            {...field}
                            placeholder="https://api.casanirvana.com"
                            isInvalid={!!errors.api_url}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.api_url?.message}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Backend API endpoint
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="websocket_url"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label>WebSocket URL</Form.Label>
                          <Form.Control
                            type="url"
                            {...field}
                            placeholder="wss://ws.casanirvana.com"
                            isInvalid={!!errors.websocket_url}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.websocket_url?.message}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Real-time communication endpoint
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Deep Linking Settings */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle as="h4">Deep Linking Configuration</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <Controller
                      name="deep_linking_enabled"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="deep_linking_enabled"
                            label="Enable Deep Linking"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={6}>
                    <Controller
                      name="universal_links_enabled"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="universal_links_enabled"
                            label="Enable Universal Links"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </Form.Group>
                      )}
                    />
                  </Col>
                </Row>

                <Controller
                  name="url_scheme"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>URL Scheme</Form.Label>
                      <Form.Control
                        type="text"
                        {...field}
                        placeholder="casanirvana"
                        isInvalid={!!errors.url_scheme}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.url_scheme?.message}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Custom URL scheme for deep linking (e.g., casanirvana://dashboard)
                      </Form.Text>
                    </Form.Group>
                  )}
                />
              </CardBody>
            </Card>

            {/* App Store Links */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle as="h4">App Store Links</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <Controller
                      name="ios_app_store_url"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label>iOS App Store URL</Form.Label>
                          <Form.Control
                            type="url"
                            {...field}
                            value={field.value || ''}
                            placeholder="https://apps.apple.com/app/casa-nirvana/id123456789"
                            isInvalid={!!errors.ios_app_store_url}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.ios_app_store_url?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={6}>
                    <Controller
                      name="android_play_store_url"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label>Android Play Store URL</Form.Label>
                          <Form.Control
                            type="url"
                            {...field}
                            value={field.value || ''}
                            placeholder="https://play.google.com/store/apps/details?id=com.casanirvana.app"
                            isInvalid={!!errors.android_play_store_url}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.android_play_store_url?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      )}
                    />
                  </Col>
                </Row>

                <Controller
                  name="share_base_url"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Share Base URL</Form.Label>
                      <Form.Control
                        type="url"
                        {...field}
                        value={field.value || ''}
                        placeholder="https://share.casanirvana.com"
                        isInvalid={!!errors.share_base_url}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.share_base_url?.message}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Base URL for generating shareable links
                      </Form.Text>
                    </Form.Group>
                  )}
                />
              </CardBody>
            </Card>

            {/* URL Redirects */}
            <Card className="mt-4">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle as="h4">URL Redirects</CardTitle>
                <Button variant="primary" size="sm" onClick={addNewRedirect}>
                  <i className="mdi mdi-plus me-1"></i>
                  Add Redirect
                </Button>
              </CardHeader>
              <CardBody>
                {redirectFields.length > 0 ? (
                  <Table responsive striped>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Source URL</th>
                        <th>Target URL</th>
                        <th>Status</th>
                        <th>Enabled</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redirectFields.map((field, index) => (
                        <tr key={field.id}>
                          <td>
                            <Controller
                              name={`url_redirects.${index}.name`}
                              control={control}
                              render={({ field }) => (
                                <Form.Control
                                  type="text"
                                  {...field}
                                  size="sm"
                                  isInvalid={!!errors.url_redirects?.[index]?.name}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`url_redirects.${index}.source_url`}
                              control={control}
                              render={({ field }) => (
                                <Form.Control
                                  type="url"
                                  {...field}
                                  size="sm"
                                  isInvalid={!!errors.url_redirects?.[index]?.source_url}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`url_redirects.${index}.target_url`}
                              control={control}
                              render={({ field }) => (
                                <Form.Control
                                  type="url"
                                  {...field}
                                  size="sm"
                                  isInvalid={!!errors.url_redirects?.[index]?.target_url}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`url_redirects.${index}.status_code`}
                              control={control}
                              render={({ field }) => (
                                <Form.Select {...field} size="sm">
                                  {statusCodeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.value}
                                    </option>
                                  ))}
                                </Form.Select>
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`url_redirects.${index}.enabled`}
                              control={control}
                              render={({ field }) => (
                                <Form.Check
                                  type="switch"
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeRedirect(index)}
                            >
                              <i className="mdi mdi-delete"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No URL redirects configured. Click &quot;Add Redirect&quot; to create one.
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Deep Links */}
            <Card className="mt-4">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle as="h4">Deep Link Patterns</CardTitle>
                <Button variant="primary" size="sm" onClick={addNewDeepLink}>
                  <i className="mdi mdi-plus me-1"></i>
                  Add Deep Link
                </Button>
              </CardHeader>
              <CardBody>
                {deepLinkFields.length > 0 ? (
                  <Table responsive striped>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>URL Pattern</th>
                        <th>Target Screen</th>
                        <th>Parameters</th>
                        <th>Enabled</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deepLinkFields.map((field, index) => (
                        <tr key={field.id}>
                          <td>
                            <Controller
                              name={`deep_links.${index}.name`}
                              control={control}
                              render={({ field }) => (
                                <Form.Control
                                  type="text"
                                  {...field}
                                  size="sm"
                                  isInvalid={!!errors.deep_links?.[index]?.name}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`deep_links.${index}.url_pattern`}
                              control={control}
                              render={({ field }) => (
                                <Form.Control
                                  type="text"
                                  {...field}
                                  size="sm"
                                  placeholder="/unit/:unitId"
                                  isInvalid={!!errors.deep_links?.[index]?.url_pattern}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`deep_links.${index}.screen`}
                              control={control}
                              render={({ field }) => (
                                <Form.Select {...field} size="sm">
                                  {availableScreens.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </Form.Select>
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`deep_links.${index}.params`}
                              control={control}
                              render={({ field }) => (
                                <Form.Control
                                  type="text"
                                  {...field}
                                  value={field.value || ''}
                                  size="sm"
                                  placeholder='{"key": "value"}'
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`deep_links.${index}.enabled`}
                              control={control}
                              render={({ field }) => (
                                <Form.Check
                                  type="switch"
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeDeepLink(index)}
                            >
                              <i className="mdi mdi-delete"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No deep links configured. Click &quot;Add Deep Link&quot; to create one.
                  </div>
                )}
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
