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
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useSettingsCategory } from '@/hooks/useSettingsCategory';

// Validation schema for extensions
const extensionSchema = yup.object({
  name: yup.string().required('Extension name is required'),
  description: yup.string().nullable(),
  version: yup.string().required('Version is required'),
  author: yup.string().nullable(),
  enabled: yup.boolean().required(),
  settings: yup.object().nullable(),
  dependencies: yup.array().of(yup.string()).nullable(),
});

// Comprehensive form validation schema
const extensionsSettingsSchema = yup.object({
  // Global Extension Settings
  allow_third_party_extensions: yup.boolean().required(),
  auto_update_extensions: yup.boolean().required(),
  extension_security_scan: yup.boolean().required(),
  
  // Marketplace Settings
  marketplace_enabled: yup.boolean().required(),
  marketplace_url: yup.string().url('Must be a valid URL').nullable(),
  api_key_required: yup.boolean().required(),
  
  // Developer Settings
  debug_mode: yup.boolean().required(),
  allow_custom_extensions: yup.boolean().required(),
  extension_logging: yup.boolean().required(),
  
  // Installed Extensions
  installed_extensions: yup.array().of(extensionSchema),
});

type ExtensionsSettingsFormData = yup.InferType<typeof extensionsSettingsSchema>;

const defaultInstalledExtensions: NonNullable<ExtensionsSettingsFormData['installed_extensions']> = [
  {
    name: 'ExpressPay Gateway Connector',
    description: 'Official ExpressPay checkout and settlement connector',
    version: '1.0.0',
    author: 'Casa Nirvana Team',
    enabled: true,
    settings: {
      mode: 'test',
      provider: 'expresspay',
    },
    dependencies: ['payment-core'],
  },
  {
    name: 'Notification Router',
    description: 'Routes in-app, email, and SMS notifications through the platform pipeline',
    version: '1.4.0',
    author: 'Casa Nirvana Team',
    enabled: true,
    settings: {
      channels: ['in_app', 'email', 'sms'],
      priority: 'high',
    },
    dependencies: ['notification-core'],
  },
  {
    name: 'Backup & Restore',
    description: 'Automated daily backups to cloud storage',
    version: '1.1.5',
    author: 'Casa Nirvana Team',
    enabled: false,
    settings: {
      backup_frequency: 'daily',
      storage_provider: 'aws-s3',
    },
    dependencies: [],
  },
];

const defaultExtensionsSettings: ExtensionsSettingsFormData = {
  allow_third_party_extensions: true,
  auto_update_extensions: false,
  extension_security_scan: true,
  marketplace_enabled: true,
  marketplace_url: 'https://marketplace.casanirvana.com',
  api_key_required: true,
  debug_mode: false,
  allow_custom_extensions: false,
  extension_logging: true,
  installed_extensions: defaultInstalledExtensions,
};

const extensionSettingDescriptions = {
  allow_third_party_extensions: 'Allow installation of approved third-party extensions from trusted sources.',
  auto_update_extensions: 'Automatically apply vetted extension updates during maintenance windows.',
  extension_security_scan: 'Run automated security checks before enabling extension changes.',
  marketplace_enabled: 'Enable the managed extension marketplace within the platform.',
  marketplace_url: 'Marketplace endpoint used by the superadmin dashboard.',
  api_key_required: 'Require authenticated API access for extension integrations.',
  debug_mode: 'Expose additional extension diagnostic logging for administrators.',
  allow_custom_extensions: 'Permit custom in-house extensions in addition to marketplace packages.',
  extension_logging: 'Persist extension activity logs for support and audit purposes.',
  installed_extensions: 'Installed extension inventory and enablement state.',
};

// Available extension categories
const extensionCategories = [
  { label: 'All', value: 'all' },
  { label: 'Payment Gateway', value: 'payment' },
  { label: 'Communication', value: 'communication' },
  { label: 'Security', value: 'security' },
  { label: 'Analytics', value: 'analytics' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Integrations', value: 'integrations' },
];

// Sample marketplace extensions
const marketplaceExtensions = [
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business Integration',
    description: 'Send automated messages and notifications via WhatsApp Business API',
    version: '2.1.0',
    author: 'Casa Nirvana Team',
    category: 'communication',
    price: 'Free',
    rating: 4.8,
    downloads: 1250,
    installed: false,
  },
  {
    id: 'expresspay-toolkit',
    name: 'ExpressPay Gateway Toolkit',
    description: 'Managed ExpressPay checkout, webhooks, and payout tooling for community billing',
    version: '1.0.0',
    author: 'Casa Nirvana Team',
    category: 'payment',
    price: 'Free',
    rating: 4.9,
    downloads: 1340,
    installed: true,
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics Integration',
    description: 'Track user behavior and app performance with Google Analytics',
    version: '3.0.1',
    author: 'Google',
    category: 'analytics',
    price: 'Free',
    rating: 4.9,
    downloads: 2100,
    installed: false,
  },
  {
    id: 'visitor-face-verification',
    name: 'Visitor Face Verification',
    description: 'Face verification add-on for gated visitor and access workflows',
    version: '1.2.0',
    author: 'SecureVision',
    category: 'security',
    price: 'Contact Sales',
    rating: 4.6,
    downloads: 340,
    installed: false,
  },
];

export default function ExtensionsSettingsPage() {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<any>(null);

  const {
    data: settingsData,
    isLoading,
    saveSettingsAsync,
  } = useSettingsCategory<ExtensionsSettingsFormData>({
    queryKey: ['settings', 'application', 'extensions'],
    category: 'application',
    subcategory: 'extensions',
    defaults: defaultExtensionsSettings,
    descriptions: extensionSettingDescriptions,
  });

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ExtensionsSettingsFormData>({
    resolver: yupResolver(extensionsSettingsSchema),
    defaultValues: defaultExtensionsSettings,
  });

  const {
    fields: extensionFields,
    append: appendExtension,
    remove: removeExtension,
    update: updateExtension,
    replace: replaceExtensions,
  } = useFieldArray({
    control,
    name: 'installed_extensions',
  });

  const watchedValues = watch();
  const installedExtensions = watchedValues.installed_extensions || [];

  useEffect(() => {
    if (settingsData) {
      reset(settingsData);
    }
  }, [reset, settingsData]);

  const persistSettings = async (
    nextData: ExtensionsSettingsFormData,
    successMessage: string,
    failureMessage: string
  ) => {
    const previousData = {
      ...watchedValues,
      installed_extensions: installedExtensions,
    } as ExtensionsSettingsFormData;

    setIsSubmitting(true);
    try {
      await saveSettingsAsync(nextData);
      setShowAlert({ type: 'success', message: successMessage });
      setTimeout(() => setShowAlert(null), 4000);
    } catch (error) {
      console.error('Error updating extension settings:', error);
      replaceExtensions(previousData.installed_extensions || []);
      setShowAlert({ type: 'danger', message: failureMessage });
      setTimeout(() => setShowAlert(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: ExtensionsSettingsFormData) => {
    await persistSettings(
      {
        ...data,
        installed_extensions: installedExtensions,
      },
      'Extension settings updated successfully!',
      'Failed to update extension settings. Please try again.'
    );
  };

  const handleInstallExtension = async (extension: any) => {
    const alreadyInstalled = installedExtensions.some(
      (installedExtension) => installedExtension.name === extension.name
    );

    if (alreadyInstalled) {
      setShowAlert({ type: 'success', message: `${extension.name} is already installed.` });
      setTimeout(() => setShowAlert(null), 3000);
      return;
    }

    const nextExtension = {
      name: extension.name,
      description: extension.description,
      version: extension.version,
      author: extension.author,
      enabled: true,
      settings: {},
      dependencies: [],
    };

    appendExtension(nextExtension);

    const nextData: ExtensionsSettingsFormData = {
      ...watchedValues,
      installed_extensions: [...installedExtensions, nextExtension],
    } as ExtensionsSettingsFormData;

    await persistSettings(
      nextData,
      `${extension.name} installed successfully!`,
      `Failed to install ${extension.name}. Please try again.`
    );
  };

  const handleUninstallExtension = async (index: number) => {
    const extension = extensionFields[index];
    const nextInstalledExtensions = installedExtensions.filter((_, currentIndex) => currentIndex !== index);

    removeExtension(index);

    const nextData: ExtensionsSettingsFormData = {
      ...watchedValues,
      installed_extensions: nextInstalledExtensions,
    } as ExtensionsSettingsFormData;

    await persistSettings(
      nextData,
      `${extension.name} uninstalled successfully!`,
      `Failed to uninstall ${extension.name}. Please try again.`
    );
  };

  const handleToggleExtension = async (index: number) => {
    const extension = installedExtensions[index];
    const nextInstalledExtensions = installedExtensions.map((installedExtension, currentIndex) =>
      currentIndex === index
        ? {
            ...installedExtension,
            enabled: !installedExtension.enabled,
          }
        : installedExtension
    );

    updateExtension(index, {
      ...extension,
      enabled: !extension.enabled,
    });

    const nextData: ExtensionsSettingsFormData = {
      ...watchedValues,
      installed_extensions: nextInstalledExtensions,
    } as ExtensionsSettingsFormData;

    await persistSettings(
      nextData,
      `${extension.name} ${nextInstalledExtensions[index]?.enabled ? 'enabled' : 'disabled'} successfully!`,
      `Failed to update ${extension.name}. Please try again.`
    );
  };

  const handleViewExtension = (extension: any) => {
    setSelectedExtension(extension);
    setShowExtensionModal(true);
  };

  const filteredMarketplaceExtensions = (selectedCategory === 'all'
    ? marketplaceExtensions
    : marketplaceExtensions.filter((extension) => extension.category === selectedCategory)
  ).map((extension) => ({
    ...extension,
    installed: installedExtensions.some((installedExtension) => installedExtension.name === extension.name),
  }));

  return (
    <>
      <PageTitle subName="Settings" title="Extensions & Plugins" />

      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          {showAlert.message}
        </Alert>
      )}

      {isLoading && (
        <Alert variant="info">
          Loading extension settings...
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xl={12}>
            {/* Global Extension Settings */}
            <Card>
              <CardHeader>
                <CardTitle as="h4">Global Extension Settings</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={4}>
                    <Controller
                      name="allow_third_party_extensions"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="allow_third_party_extensions"
                            label="Allow Third-Party Extensions"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                          <Form.Text className="text-muted">
                            Enable installation of extensions from external sources
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="auto_update_extensions"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="auto_update_extensions"
                            label="Auto-Update Extensions"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                          <Form.Text className="text-muted">
                            Automatically update extensions when new versions are available
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="extension_security_scan"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="extension_security_scan"
                            label="Security Scanning"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                          <Form.Text className="text-muted">
                            Scan extensions for security vulnerabilities
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Marketplace Settings */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle as="h4">Extension Marketplace</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <Controller
                      name="marketplace_enabled"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="marketplace_enabled"
                            label="Enable Extension Marketplace"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={6}>
                    <Controller
                      name="api_key_required"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="api_key_required"
                            label="Require API Key for Extensions"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </Form.Group>
                      )}
                    />
                  </Col>
                </Row>

                <Controller
                  name="marketplace_url"
                  control={control}
                  render={({ field }) => (
                    <Form.Group className="mb-3">
                      <Form.Label>Marketplace URL</Form.Label>
                      <Form.Control
                        type="url"
                        {...field}
                        value={field.value || ''}
                        placeholder="https://marketplace.casanirvana.com"
                        isInvalid={!!errors.marketplace_url}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.marketplace_url?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}
                />
              </CardBody>
            </Card>

            {/* Developer Settings */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle as="h4">Developer Settings</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={4}>
                    <Controller
                      name="debug_mode"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="debug_mode"
                            label="Debug Mode"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                          <Form.Text className="text-muted">
                            Enable detailed extension debugging
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="allow_custom_extensions"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="allow_custom_extensions"
                            label="Allow Custom Extensions"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                          <Form.Text className="text-muted">
                            Allow installation of custom/development extensions
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="extension_logging"
                      control={control}
                      render={({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="extension_logging"
                            label="Extension Logging"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                          <Form.Text className="text-muted">
                            Log extension activities and errors
                          </Form.Text>
                        </Form.Group>
                      )}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Installed Extensions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle as="h4">Installed Extensions</CardTitle>
              </CardHeader>
              <CardBody>
                {extensionFields.length > 0 ? (
                  <Table responsive striped>
                    <thead>
                      <tr>
                        <th>Extension</th>
                        <th>Version</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extensionFields.map((field, index) => (
                        <tr key={field.id}>
                          <td>
                            <div>
                              <strong>{field.name}</strong>
                              <br />
                              <small className="text-muted">{field.description}</small>
                            </div>
                          </td>
                          <td>
                            <Badge bg="secondary">{field.version}</Badge>
                          </td>
                          <td>{field.author}</td>
                          <td>
                            <Controller
                              name={`installed_extensions.${index}.enabled`}
                              control={control}
                              render={({ field }) => (
                                <Form.Check
                                  type="switch"
                                  checked={field.value}
                                  onChange={() => {
                                    void handleToggleExtension(index);
                                  }}
                                  label={field.value ? 'Enabled' : 'Disabled'}
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleViewExtension(extensionFields[index])}
                            >
                              <IconifyIcon icon="ri:settings-3-line" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleUninstallExtension(index)}
                            >
                              <IconifyIcon icon="ri:delete-bin-line" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No extensions installed. Browse the marketplace below to install extensions.
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Extension Marketplace */}
            {watchedValues.marketplace_enabled && (
              <Card className="mt-4">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <CardTitle as="h4">Extension Marketplace</CardTitle>
                  <div className="d-flex gap-2">
                    {extensionCategories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    {filteredMarketplaceExtensions.map((extension) => (
                      <Col md={6} lg={4} key={extension.id} className="mb-4">
                        <Card className="h-100">
                          <CardBody>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-1">{extension.name}</h6>
                              <Badge bg={extension.installed ? 'success' : 'light'}>
                                {extension.installed ? 'Installed' : extension.price}
                              </Badge>
                            </div>
                            <p className="card-text small text-muted mb-2">
                              {extension.description}
                            </p>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div>
                                <small className="text-muted">
                                  <IconifyIcon icon="ri:star-fill" className="text-warning" />
                                  {extension.rating} ({extension.downloads})
                                </small>
                              </div>
                              <small className="text-muted">v{extension.version}</small>
                            </div>
                            <div className="d-flex gap-2">
                              {!extension.installed ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="flex-grow-1"
                                  onClick={() => {
                                    void handleInstallExtension(extension);
                                  }}
                                >
                                  Install
                                </Button>
                              ) : (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="flex-grow-1"
                                  disabled
                                >
                                  Installed
                                </Button>
                              )}
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleViewExtension(extension)}
                              >
                                <IconifyIcon icon="ri:eye-line" />
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-4">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting && (
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
            Save Settings
          </Button>
        </div>
      </form>

      {/* Extension Details Modal */}
      <Modal show={showExtensionModal} onHide={() => setShowExtensionModal(false)} size="lg">
        <ModalHeader closeButton>
          <Modal.Title>{selectedExtension?.name}</Modal.Title>
        </ModalHeader>
        <ModalBody>
          {selectedExtension && (
            <div>
              <p className="text-muted">{selectedExtension.description}</p>
              
              <Row className="mb-3">
                <Col sm={6}>
                  <strong>Version:</strong> {selectedExtension.version}
                </Col>
                <Col sm={6}>
                  <strong>Author:</strong> {selectedExtension.author}
                </Col>
              </Row>

              {selectedExtension.settings && (
                <div>
                  <h6>Extension Settings</h6>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(selectedExtension.settings, null, 2)}
                  </pre>
                </div>
              )}

              {selectedExtension.dependencies && selectedExtension.dependencies.length > 0 && (
                <div>
                  <h6>Dependencies</h6>
                  <ul>
                    {selectedExtension.dependencies.map((dep: string, index: number) => (
                      <li key={index}>{dep}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowExtensionModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
