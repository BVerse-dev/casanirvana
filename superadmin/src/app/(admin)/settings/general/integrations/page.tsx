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
  Alert,
  Badge,
  Nav,
  Tab,
  Modal,
  InputGroup,
  Spinner
} from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { toast } from 'react-hot-toast';
import { useIntegrationSettings, IntegrationSettingsData } from '@/hooks/useIntegrationSettings';

// Form validation schema
const integrationConfigSchema = yup.object({
  // AI Services
  openai_api_key: yup.string().default(''),
  openai_organization_id: yup.string().default(''),
  anthropic_api_key: yup.string().default(''),
  google_ai_api_key: yup.string().default(''),
  azure_openai_endpoint: yup.string().default(''),
  azure_openai_key: yup.string().default(''),
  huggingface_api_key: yup.string().default(''),
  
  // Communication Services
  sms_provider: yup.string().default('twilio'),
  sms_api_key: yup.string().default(''),
  email_provider: yup.string().default('sendgrid'),
  email_api_key: yup.string().default(''),
  whatsapp_business_api_key: yup.string().default(''),
  telegram_bot_token: yup.string().default(''),
  slack_webhook_url: yup.string().default(''),
  
  // Payment Gateways
  razorpay_key_id: yup.string().default(''),
  razorpay_key_secret: yup.string().default(''),
  stripe_public_key: yup.string().default(''),
  stripe_secret_key: yup.string().default(''),
  paypal_client_id: yup.string().default(''),
  paypal_client_secret: yup.string().default(''),
  
  // Cloud Storage
  aws_access_key: yup.string().default(''),
  aws_secret_key: yup.string().default(''),
  aws_region: yup.string().default('us-east-1'),
  aws_bucket_name: yup.string().default(''),
  google_cloud_key: yup.string().default(''),
  azure_storage_key: yup.string().default(''),
  
  // Other Services
  firebase_config: yup.string().default(''),
  pusher_app_id: yup.string().default(''),
  pusher_key: yup.string().default(''),
  pusher_secret: yup.string().default(''),
  
  // Feature Toggles
  ai_chat_enabled: yup.boolean().default(false),
  ai_maintenance_predictions: yup.boolean().default(false),
  ai_document_processing: yup.boolean().default(false),
  smart_notifications: yup.boolean().default(false),
  automated_billing: yup.boolean().default(false),
  real_time_analytics: yup.boolean().default(false)
});

type IntegrationConfigFormData = IntegrationSettingsData;

// Service definitions organized by category
const serviceCategories = {
  ai: {
    title: 'AI Services',
    icon: 'solar:cpu-bolt-line-duotone',
    services: [
      {
        name: 'openai_api_key',
        label: 'OpenAI',
        description: 'GPT models for chat and content generation',
        icon: 'simple-icons:openai',
        testable: true,
        docs: 'https://platform.openai.com/docs'
      },
      {
        name: 'anthropic_api_key',
        label: 'Anthropic Claude',
        description: 'Advanced AI assistant for complex tasks',
        icon: 'simple-icons:anthropic',
        testable: true,
        docs: 'https://docs.anthropic.com'
      },
      {
        name: 'google_ai_api_key',
        label: 'Google AI Studio',
        description: 'Gemini models and AI services',
        icon: 'simple-icons:google',
        testable: true,
        docs: 'https://ai.google.dev'
      },
      {
        name: 'azure_openai_key',
        label: 'Azure OpenAI',
        description: 'Enterprise OpenAI via Microsoft Azure',
        icon: 'simple-icons:microsoftazure',
        testable: true,
        docs: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service'
      },
      {
        name: 'huggingface_api_key',
        label: 'Hugging Face',
        description: 'Open-source AI models and datasets',
        icon: 'simple-icons:huggingface',
        testable: true,
        docs: 'https://huggingface.co/docs'
      }
    ]
  },
  communication: {
    title: 'Communication',
    icon: 'solar:chat-round-dots-line-duotone',
    services: [
      {
        name: 'sms_api_key',
        label: 'SMS Service',
        description: 'Send SMS notifications to community members',
        icon: 'solar:phone-line-duotone',
        testable: true,
        docs: '#'
      },
      {
        name: 'email_api_key',
        label: 'Email Service',
        description: 'Transactional and marketing emails',
        icon: 'solar:letter-line-duotone',
        testable: true,
        docs: '#'
      },
      {
        name: 'whatsapp_business_api_key',
        label: 'WhatsApp Business',
        description: 'WhatsApp messaging for community members',
        icon: 'simple-icons:whatsapp',
        testable: true,
        docs: 'https://developers.facebook.com/docs/whatsapp'
      },
      {
        name: 'telegram_bot_token',
        label: 'Telegram Bot',
        description: 'Telegram notifications and bot interactions',
        icon: 'simple-icons:telegram',
        testable: true,
        docs: 'https://core.telegram.org/bots'
      },
      {
        name: 'slack_webhook_url',
        label: 'Slack Integration',
        description: 'Team notifications and alerts',
        icon: 'simple-icons:slack',
        testable: true,
        docs: 'https://api.slack.com/messaging/webhooks'
      }
    ]
  },
  payment: {
    title: 'Payment Gateways',
    icon: 'solar:card-line-duotone',
    services: [
      {
        name: 'razorpay_key_id',
        label: 'Razorpay',
        description: 'Indian payment gateway for fees and bills',
        icon: 'simple-icons:razorpay',
        testable: true,
        docs: 'https://razorpay.com/docs'
      },
      {
        name: 'stripe_public_key',
        label: 'Stripe',
        description: 'Global payment processing',
        icon: 'simple-icons:stripe',
        testable: true,
        docs: 'https://stripe.com/docs'
      },
      {
        name: 'paypal_client_id',
        label: 'PayPal',
        description: 'PayPal payment integration',
        icon: 'simple-icons:paypal',
        testable: true,
        docs: 'https://developer.paypal.com'
      }
    ]
  },
  cloud: {
    title: 'Cloud Storage',
    icon: 'solar:cloud-storage-line-duotone',
    services: [
      {
        name: 'aws_access_key',
        label: 'Amazon S3',
        description: 'AWS cloud storage for documents and media',
        icon: 'simple-icons:amazons3',
        testable: true,
        docs: 'https://docs.aws.amazon.com/s3'
      },
      {
        name: 'google_cloud_key',
        label: 'Google Cloud Storage',
        description: 'Google Cloud storage services',
        icon: 'simple-icons:googlecloud',
        testable: true,
        docs: 'https://cloud.google.com/storage/docs'
      },
      {
        name: 'azure_storage_key',
        label: 'Azure Storage',
        description: 'Microsoft Azure storage services',
        icon: 'simple-icons:microsoftazure',
        testable: true,
        docs: 'https://docs.microsoft.com/en-us/azure/storage'
      }
    ]
  },
  other: {
    title: 'Other Services',
    icon: 'solar:settings-line-duotone',
    services: [
      {
        name: 'firebase_config',
        label: 'Firebase',
        description: 'Real-time database and authentication',
        icon: 'simple-icons:firebase',
        testable: true,
        docs: 'https://firebase.google.com/docs'
      },
      {
        name: 'pusher_key',
        label: 'Pusher',
        description: 'Real-time messaging and notifications',
        icon: 'simple-icons:pusher',
        testable: true,
        docs: 'https://pusher.com/docs'
      }
    ]
  }
};

// AI Feature toggles
const aiFeatures = [
  {
    name: 'ai_chat_enabled',
    label: 'AI Chat Assistant',
    description: 'Enable AI-powered chat support for community members'
  },
  {
    name: 'ai_maintenance_predictions',
    label: 'Predictive Maintenance',
    description: 'AI-powered maintenance scheduling and predictions'
  },
  {
    name: 'ai_document_processing',
    label: 'Document Processing',
    description: 'Automatic document classification and data extraction'
  },
  {
    name: 'smart_notifications',
    label: 'Smart Notifications',
    description: 'AI-optimized notification timing and content'
  },
  {
    name: 'automated_billing',
    label: 'Automated Billing',
    description: 'AI-assisted bill generation and payment reminders'
  },
  {
    name: 'real_time_analytics',
    label: 'Real-time Analytics',
    description: 'AI-powered insights and analytics dashboard'
  }
];

const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'error' | null>>({});
  
  // Use the Supabase hook for real data
  const { 
    data: configData, 
    isLoading: isLoadingData, 
    error: dataError, 
    updateConfigAsync, 
    isUpdating,
    testIntegrationAsync,
  } = useIntegrationSettings();

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isDirty } } = useForm<IntegrationConfigFormData>({
    resolver: yupResolver(integrationConfigSchema),
    defaultValues: configData || {
      // AI Services
      openai_api_key: '',
      openai_organization_id: '',
      anthropic_api_key: '',
      google_ai_api_key: '',
      azure_openai_endpoint: '',
      azure_openai_key: '',
      huggingface_api_key: '',
      
      // Communication Services
      sms_provider: 'twilio',
      sms_api_key: '',
      email_provider: 'sendgrid',
      email_api_key: '',
      whatsapp_business_api_key: '',
      telegram_bot_token: '',
      slack_webhook_url: '',
      
      // Payment Gateways
      razorpay_key_id: '',
      razorpay_key_secret: '',
      stripe_public_key: '',
      stripe_secret_key: '',
      paypal_client_id: '',
      paypal_client_secret: '',
      
      // Cloud Storage
      aws_access_key: '',
      aws_secret_key: '',
      aws_region: 'us-east-1',
      aws_bucket_name: '',
      google_cloud_key: '',
      azure_storage_key: '',
      
      // Other Services
      firebase_config: '',
      pusher_app_id: '',
      pusher_key: '',
      pusher_secret: '',
      
      // Feature Toggles
      ai_chat_enabled: false,
      ai_maintenance_predictions: false,
      ai_document_processing: false,
      smart_notifications: false,
      automated_billing: false,
      real_time_analytics: false,
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (configData) {
      reset(configData);
    }
  }, [configData, reset]);

  // Show error alert if data loading fails
  useEffect(() => {
    if (dataError) {
      toast.error(`Failed to load integration settings: ${dataError.message}`);
    }
  }, [dataError]);

  const onSubmit = async (data: IntegrationConfigFormData) => {
    try {
      await updateConfigAsync(data);
    } catch (error: any) {
      console.error('Error updating integration config:', error);
    }
  };

  const testIntegrationConnection = async (service: string, configuredValue: string) => {
    if (!configuredValue) {
      toast.error('Please enter an API key first');
      return;
    }

    setTestResults(prev => ({ ...prev, [service]: 'testing' }));
    
    try {
      const result = await testIntegrationAsync({ service, value: configuredValue });
      if (result.success) {
        setTestResults(prev => ({ ...prev, [service]: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, [service]: 'error' }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: 'error' }));
    }
  };

  const getConnectionStatus = (service: string, apiKey?: string) => {
    if (testResults[service] === 'testing') return { status: 'testing', color: 'warning' };
    if (testResults[service] === 'success') return { status: 'connected', color: 'success' };
    if (testResults[service] === 'error') return { status: 'error', color: 'danger' };
    if (apiKey) return { status: 'not tested', color: 'secondary' };
    return { status: 'not configured', color: 'light' };
  };

  const showHelp = (service: string) => {
    setSelectedService(service);
    setShowHelpModal(true);
  };

  const renderServiceCard = (service: any) => (
    <Card key={service.name} className="mb-3 border-0 shadow-sm">
      <CardBody>
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <IconifyIcon icon={service.icon} className="fs-24 text-primary" />
            </div>
            <div>
              <h6 className="mb-1">{service.label}</h6>
              <small className="text-muted">{service.description}</small>
            </div>
          </div>
          {service.testable && watch(service.name) && (
            <Badge bg={getConnectionStatus(service.name, watch(service.name) as string).color} className="small">
              {getConnectionStatus(service.name, watch(service.name) as string).status}
            </Badge>
          )}
        </div>
        
        <Row className="align-items-end">
          <Col md={8}>
            <Controller
              name={service.name as keyof IntegrationConfigFormData}
              control={control}
              render={({ field }) => (
                <Form.Group>
                  <Form.Label className="small fw-medium">API Key</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="password"
                      placeholder={`Enter ${service.label} API key`}
                      {...field}
                      value={(field.value as string) || ''}
                      isInvalid={!!errors[service.name as keyof IntegrationConfigFormData]}
                    />
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => showHelp(service.name)}
                    >
                      <IconifyIcon icon="solar:question-circle-line-duotone" />
                    </Button>
                  </InputGroup>
                  {errors[service.name as keyof IntegrationConfigFormData] && (
                    <Form.Control.Feedback type="invalid">
                      {errors[service.name as keyof IntegrationConfigFormData]?.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              )}
            />
          </Col>
          <Col md={4}>
            {service.testable && (
              <Button
                variant="outline-primary"
                size="sm"
                className="w-100"
                onClick={() => testIntegrationConnection(service.name, watch(service.name) as string)}
                disabled={!watch(service.name) || testResults[service.name] === 'testing'}
              >
                {testResults[service.name] === 'testing' ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="solar:play-circle-line-duotone" className="me-2" />
                    Test Connection
                  </>
                )}
              </Button>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );

  if (isLoadingData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <PageTitle 
        title="API Integrations" 
        subName="Configure third-party services and AI capabilities for your property management system"
      />

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="border-bottom">
                <CardTitle>Integration Management</CardTitle>
              </CardHeader>
              <CardBody>
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'ai')}>
                  <Nav variant="pills" className="mb-4">
                    {Object.entries(serviceCategories).map(([key, category]) => (
                      <Nav.Item key={key}>
                        <Nav.Link eventKey={key} className="d-flex align-items-center">
                          <IconifyIcon icon={category.icon} className="me-2" />
                          {category.title}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                    <Nav.Item>
                      <Nav.Link eventKey="features" className="d-flex align-items-center">
                        <IconifyIcon icon="solar:magic-stick-3-line-duotone" className="me-2" />
                        AI Features
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    {Object.entries(serviceCategories).map(([key, category]) => (
                      <Tab.Pane key={key} eventKey={key}>
                        <div className="mb-4">
                          <h5 className="d-flex align-items-center mb-3">
                            <IconifyIcon icon={category.icon} className="me-2 text-primary" />
                            {category.title}
                          </h5>
                          {category.services.map(renderServiceCard)}
                        </div>
                      </Tab.Pane>
                    ))}

                    <Tab.Pane eventKey="features">
                      <div className="mb-4">
                        <h5 className="d-flex align-items-center mb-3">
                          <IconifyIcon icon="solar:magic-stick-3-line-duotone" className="me-2 text-primary" />
                          AI & Automation Features
                        </h5>
                        
                        <Alert variant="info" className="mb-4">
                          <IconifyIcon icon="solar:info-circle-line-duotone" className="me-2" />
                          These features require at least one AI service to be configured above.
                        </Alert>

                        <Row>
                          {aiFeatures.map((feature) => (
                            <Col md={6} key={feature.name} className="mb-3">
                              <Card className="h-100 border-0 shadow-sm">
                                <CardBody>
                                  <div className="d-flex align-items-start justify-content-between">
                                    <div className="flex-grow-1">
                                      <h6 className="mb-2">{feature.label}</h6>
                                      <p className="text-muted small mb-0">{feature.description}</p>
                                    </div>
                                    <Controller
                                      name={feature.name as keyof IntegrationConfigFormData}
                                      control={control}
                                      render={({ field }) => (
                                        <Form.Check
                                          type="switch"
                                          id={feature.name}
                                          checked={field.value as boolean}
                                          onChange={(e) => field.onChange(e.target.checked)}
                                          onBlur={field.onBlur}
                                          className="ms-3"
                                        />
                                      )}
                                    />
                                  </div>
                                </CardBody>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>

                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                  <Button variant="primary" type="submit" disabled={isUpdating || !isDirty}>
                    {isUpdating ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="solar:diskette-line-duotone" className="me-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Help Modal */}
      <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Integration Setup Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <IconifyIcon icon="solar:question-circle-line-duotone" className="fs-48 text-primary" />
          </div>
          <h6>How to get your API key for {selectedService.replace('_', ' ')}:</h6>
          <ol className="mt-3">
            <li>Visit the service provider&apos;s developer portal</li>
            <li>Sign up or log in to your account</li>
            <li>Navigate to API keys or credentials section</li>
            <li>Generate a new API key</li>
            <li>Copy and paste it here</li>
          </ol>
          <Alert variant="warning" className="mt-3">
            <IconifyIcon icon="solar:shield-warning-line-duotone" className="me-2" />
            Keep your API keys secure and never share them publicly.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHelpModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default IntegrationsPage;
