'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Modal,
  Nav,
  Row,
  Spinner,
  Tab,
} from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { IntegrationSettingsData, useIntegrationSettings } from '@/hooks/useIntegrationSettings';

const integrationConfigSchema = yup.object({
  openai_api_key: yup.string().default(''),
  openai_organization_id: yup.string().default(''),
  anthropic_api_key: yup.string().default(''),
  google_ai_api_key: yup.string().default(''),
  azure_openai_endpoint: yup.string().default(''),
  azure_openai_key: yup.string().default(''),
  huggingface_api_key: yup.string().default(''),
  sms_provider: yup.string().default('twilio'),
  sms_api_key: yup.string().default(''),
  email_provider: yup.string().default('sendgrid'),
  email_api_key: yup.string().default(''),
  whatsapp_business_api_key: yup.string().default(''),
  telegram_bot_token: yup.string().default(''),
  slack_webhook_url: yup.string().default(''),
  razorpay_key_id: yup.string().default(''),
  razorpay_key_secret: yup.string().default(''),
  stripe_public_key: yup.string().default(''),
  stripe_secret_key: yup.string().default(''),
  paypal_client_id: yup.string().default(''),
  paypal_client_secret: yup.string().default(''),
  aws_access_key: yup.string().default(''),
  aws_secret_key: yup.string().default(''),
  aws_region: yup.string().default('us-east-1'),
  aws_bucket_name: yup.string().default(''),
  google_cloud_key: yup.string().default(''),
  azure_storage_key: yup.string().default(''),
  firebase_config: yup.string().default(''),
  pusher_app_id: yup.string().default(''),
  pusher_key: yup.string().default(''),
  pusher_secret: yup.string().default(''),
  ai_chat_enabled: yup.boolean().default(false),
  ai_maintenance_predictions: yup.boolean().default(false),
  ai_document_processing: yup.boolean().default(false),
  smart_notifications: yup.boolean().default(false),
  automated_billing: yup.boolean().default(false),
  real_time_analytics: yup.boolean().default(false),
});

type IntegrationConfigFormData = IntegrationSettingsData;
type IntegrationFieldName = keyof IntegrationConfigFormData;

type DirectIntegrationField = {
  name: IntegrationFieldName;
  label: string;
  placeholder: string;
  type?: 'text' | 'password' | 'url' | 'textarea';
  rows?: number;
  helpText?: string;
};

type DirectIntegrationService = {
  id: string;
  label: string;
  description: string;
  icon: string;
  testTarget: string;
  docs?: string;
  note?: string;
  fields: DirectIntegrationField[];
};

type ManagedIntegrationService = {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  cta: string;
  note?: string;
};

type IntegrationTab = {
  key: string;
  title: string;
  icon: string;
  directServices?: DirectIntegrationService[];
  managedServices?: ManagedIntegrationService[];
  note?: string;
};

const directAiServices: DirectIntegrationService[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'GPT models for assistant, summarization, and launch-ready AI workflows.',
    icon: 'simple-icons:openai',
    testTarget: 'openai_api_key',
    docs: 'https://platform.openai.com/docs',
    fields: [
      {
        name: 'openai_api_key',
        label: 'API Key',
        placeholder: 'sk-...',
        type: 'password',
      },
      {
        name: 'openai_organization_id',
        label: 'Organization ID',
        placeholder: 'org_...',
      },
    ],
  },
  {
    id: 'anthropic',
    label: 'Anthropic Claude',
    description: 'Alternative LLM provider for reasoning-heavy assistant workloads.',
    icon: 'simple-icons:anthropic',
    testTarget: 'anthropic_api_key',
    docs: 'https://docs.anthropic.com',
    fields: [
      {
        name: 'anthropic_api_key',
        label: 'API Key',
        placeholder: 'sk-ant-...',
        type: 'password',
      },
    ],
  },
  {
    id: 'google-ai',
    label: 'Google AI Studio',
    description: 'Gemini-based AI configuration for supported internal workflows.',
    icon: 'simple-icons:google',
    testTarget: 'google_ai_api_key',
    docs: 'https://ai.google.dev',
    fields: [
      {
        name: 'google_ai_api_key',
        label: 'API Key',
        placeholder: 'AIza...',
        type: 'password',
      },
    ],
  },
  {
    id: 'azure-openai',
    label: 'Azure OpenAI',
    description: 'Enterprise-hosted OpenAI deployment with endpoint-scoped credentials.',
    icon: 'simple-icons:microsoftazure',
    testTarget: 'azure_openai_key',
    docs: 'https://azure.microsoft.com/products/ai-services/openai-service',
    fields: [
      {
        name: 'azure_openai_endpoint',
        label: 'Endpoint URL',
        placeholder: 'https://example.openai.azure.com/',
        type: 'url',
      },
      {
        name: 'azure_openai_key',
        label: 'Access Key',
        placeholder: 'Azure OpenAI key',
        type: 'password',
      },
    ],
  },
  {
    id: 'hugging-face',
    label: 'Hugging Face',
    description: 'Model hub access for fallback or specialist model integrations.',
    icon: 'simple-icons:huggingface',
    testTarget: 'huggingface_api_key',
    docs: 'https://huggingface.co/docs',
    fields: [
      {
        name: 'huggingface_api_key',
        label: 'Access Token',
        placeholder: 'hf_...',
        type: 'password',
      },
    ],
  },
];

const directCommunicationServices: DirectIntegrationService[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp Business',
    description: 'Direct WhatsApp business messaging integration for community workflows.',
    icon: 'simple-icons:whatsapp',
    testTarget: 'whatsapp_business_api_key',
    docs: 'https://developers.facebook.com/docs/whatsapp',
    fields: [
      {
        name: 'whatsapp_business_api_key',
        label: 'Business API Key',
        placeholder: 'WhatsApp Business API key',
        type: 'password',
      },
    ],
  },
  {
    id: 'telegram',
    label: 'Telegram Bot',
    description: 'Telegram notifications and bot-based engagement flows.',
    icon: 'simple-icons:telegram',
    testTarget: 'telegram_bot_token',
    docs: 'https://core.telegram.org/bots',
    fields: [
      {
        name: 'telegram_bot_token',
        label: 'Bot Token',
        placeholder: 'Telegram bot token',
        type: 'password',
      },
    ],
  },
  {
    id: 'slack',
    label: 'Slack Webhook',
    description: 'Internal operations alerts delivered to Slack channels.',
    icon: 'simple-icons:slack',
    testTarget: 'slack_webhook_url',
    docs: 'https://api.slack.com/messaging/webhooks',
    fields: [
      {
        name: 'slack_webhook_url',
        label: 'Webhook URL',
        placeholder: 'https://hooks.slack.com/services/...',
        type: 'url',
      },
    ],
  },
];

const directPlatformServices: DirectIntegrationService[] = [
  {
    id: 'amazon-s3',
    label: 'Amazon S3',
    description: 'Object storage credentials for documents and media pipelines.',
    icon: 'simple-icons:amazons3',
    testTarget: 'aws_access_key',
    docs: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html',
    fields: [
      {
        name: 'aws_access_key',
        label: 'Access Key',
        placeholder: 'AWS access key',
        type: 'password',
      },
      {
        name: 'aws_secret_key',
        label: 'Secret Key',
        placeholder: 'AWS secret key',
        type: 'password',
      },
      {
        name: 'aws_region',
        label: 'Region',
        placeholder: 'us-east-1',
      },
      {
        name: 'aws_bucket_name',
        label: 'Bucket Name',
        placeholder: 'casa-nirvana-assets',
      },
    ],
  },
  {
    id: 'google-cloud-storage',
    label: 'Google Cloud Storage',
    description: 'Service account credential material for Google Cloud storage access.',
    icon: 'simple-icons:googlecloud',
    testTarget: 'google_cloud_key',
    docs: 'https://cloud.google.com/storage/docs',
    fields: [
      {
        name: 'google_cloud_key',
        label: 'Service Key / JSON',
        placeholder: 'Paste the storage service key or JSON credential',
        type: 'textarea',
        rows: 5,
      },
    ],
  },
  {
    id: 'azure-storage',
    label: 'Azure Storage',
    description: 'Azure storage account key for file access and background jobs.',
    icon: 'simple-icons:microsoftazure',
    testTarget: 'azure_storage_key',
    docs: 'https://learn.microsoft.com/azure/storage',
    fields: [
      {
        name: 'azure_storage_key',
        label: 'Storage Key',
        placeholder: 'Azure storage key',
        type: 'password',
      },
    ],
  },
  {
    id: 'pusher',
    label: 'Pusher',
    description: 'Realtime event delivery for app-side live updates.',
    icon: 'simple-icons:pusher',
    testTarget: 'pusher_key',
    docs: 'https://pusher.com/docs',
    fields: [
      {
        name: 'pusher_app_id',
        label: 'App ID',
        placeholder: 'Pusher app id',
      },
      {
        name: 'pusher_key',
        label: 'Key',
        placeholder: 'Pusher key',
        type: 'password',
      },
      {
        name: 'pusher_secret',
        label: 'Secret',
        placeholder: 'Pusher secret',
        type: 'password',
      },
    ],
  },
];

const managedCommunicationServices: ManagedIntegrationService[] = [
  {
    id: 'smtp',
    label: 'SMTP Delivery',
    description: 'Transactional email transport is configured and validated on the SMTP settings page.',
    icon: 'solar:letter-line-duotone',
    href: '/settings/email/smtp',
    cta: 'Open SMTP Settings',
  },
  {
    id: 'sms',
    label: 'SMS Delivery',
    description: 'Provider credentials and delivery validation live on the SMS settings page.',
    icon: 'solar:phone-line-duotone',
    href: '/settings/notifications/sms',
    cta: 'Open SMS Settings',
  },
  {
    id: 'push',
    label: 'Push Notifications',
    description: 'Firebase push credentials belong to the dedicated push-notification setup page.',
    icon: 'solar:bell-line-duotone',
    href: '/settings/notifications/push',
    cta: 'Open Push Settings',
    note: 'Firebase config is intentionally not duplicated here to avoid conflicting credential ownership.',
  },
];

const managedPaymentServices: ManagedIntegrationService[] = [
  {
    id: 'payment-gateways',
    label: 'Payment Gateways',
    description: 'Provider credentials and validation for Razorpay, Stripe, PayPal, Paytm, ExpressPay, and bank transfer.',
    icon: 'solar:card-line-duotone',
    href: '/settings/payment/gateways',
    cta: 'Open Gateways',
  },
  {
    id: 'payment-methods',
    label: 'Payment Methods',
    description: 'Checkout method enablement and payment acceptance rules.',
    icon: 'solar:wallet-money-line-duotone',
    href: '/settings/payment/methods',
    cta: 'Open Methods',
  },
  {
    id: 'payment-fees',
    label: 'Payment Fees',
    description: 'Fee schedules, payer-bearer rules, and charge calculation settings.',
    icon: 'solar:tag-price-line-duotone',
    href: '/settings/payment/fees',
    cta: 'Open Fees',
  },
];

const aiFeatures = [
  {
    name: 'ai_chat_enabled',
    label: 'AI Chat Assistant',
    description: 'Enable AI-powered assistant experiences for support and guided workflows.',
  },
  {
    name: 'ai_maintenance_predictions',
    label: 'Predictive Maintenance',
    description: 'Enable maintenance forecasting and issue-pattern analysis.',
  },
  {
    name: 'ai_document_processing',
    label: 'Document Processing',
    description: 'Allow AI-powered extraction and classification of uploaded documents.',
  },
  {
    name: 'smart_notifications',
    label: 'Smart Notifications',
    description: 'Allow AI-assisted notification timing and targeting features.',
  },
  {
    name: 'automated_billing',
    label: 'Automated Billing',
    description: 'Enable AI-assisted billing workflows and reminder orchestration.',
  },
  {
    name: 'real_time_analytics',
    label: 'Real-Time Analytics',
    description: 'Enable AI-assisted analytics features that depend on configured providers.',
  },
] satisfies Array<{
  name: keyof IntegrationConfigFormData;
  label: string;
  description: string;
}>;

const integrationTabs: IntegrationTab[] = [
  {
    key: 'ai',
    title: 'AI Services',
    icon: 'solar:cpu-bolt-line-duotone',
    directServices: directAiServices,
    note: 'These providers are owned by this page because their credentials are not managed elsewhere in Settings.',
  },
  {
    key: 'communication',
    title: 'Communication',
    icon: 'solar:chat-round-dots-line-duotone',
    managedServices: managedCommunicationServices,
    directServices: directCommunicationServices,
    note: 'Email, SMS, and push credentials are managed on their dedicated settings pages. This page only owns direct chat and webhook connectors.',
  },
  {
    key: 'payment',
    title: 'Payment',
    icon: 'solar:card-line-duotone',
    managedServices: managedPaymentServices,
    note: 'Payment credentials and validation are intentionally centralized on the dedicated payment settings pages.',
  },
  {
    key: 'platform',
    title: 'Storage & Realtime',
    icon: 'solar:cloud-storage-line-duotone',
    directServices: directPlatformServices,
    note: 'These connectors are used by platform-side file, asset, and realtime workflows.',
  },
];

const defaultValues: IntegrationConfigFormData = {
  openai_api_key: '',
  openai_organization_id: '',
  anthropic_api_key: '',
  google_ai_api_key: '',
  azure_openai_endpoint: '',
  azure_openai_key: '',
  huggingface_api_key: '',
  sms_provider: 'twilio',
  sms_api_key: '',
  email_provider: 'sendgrid',
  email_api_key: '',
  whatsapp_business_api_key: '',
  telegram_bot_token: '',
  slack_webhook_url: '',
  razorpay_key_id: '',
  razorpay_key_secret: '',
  stripe_public_key: '',
  stripe_secret_key: '',
  paypal_client_id: '',
  paypal_client_secret: '',
  aws_access_key: '',
  aws_secret_key: '',
  aws_region: 'us-east-1',
  aws_bucket_name: '',
  google_cloud_key: '',
  azure_storage_key: '',
  firebase_config: '',
  pusher_app_id: '',
  pusher_key: '',
  pusher_secret: '',
  ai_chat_enabled: false,
  ai_maintenance_predictions: false,
  ai_document_processing: false,
  smart_notifications: false,
  automated_billing: false,
  real_time_analytics: false,
};

const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'error' | null>>({});

  const {
    data: configData,
    isLoading: isLoadingData,
    error: dataError,
    updateConfigAsync,
    isUpdating,
    testIntegrationAsync,
  } = useIntegrationSettings();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { isDirty },
  } = useForm<IntegrationConfigFormData>({
    resolver: yupResolver(integrationConfigSchema),
    defaultValues,
  });

  useEffect(() => {
    if (configData) {
      reset(configData);
    }
  }, [configData, reset]);

  useEffect(() => {
    if (dataError) {
      toast.error(`Failed to load integration settings: ${dataError.message}`);
    }
  }, [dataError]);

  const allDirectServices = useMemo(
    () => integrationTabs.flatMap((tab) => tab.directServices || []),
    []
  );

  const selectedService = useMemo(
    () => allDirectServices.find((service) => service.id === selectedServiceId) || null,
    [allDirectServices, selectedServiceId]
  );

  const onSubmit = async (data: IntegrationConfigFormData) => {
    try {
      await updateConfigAsync(data);
    } catch (error) {
      console.error('Error updating integration config:', error);
    }
  };

  const getConfiguredFieldCount = (service: DirectIntegrationService) =>
    service.fields.filter((field) => {
      const value = getValues(field.name);
      return typeof value === 'string' && value.trim().length > 0;
    }).length;

  const getConnectionStatus = (service: DirectIntegrationService) => {
    if (testResults[service.id] === 'testing') {
      return { label: 'testing', variant: 'warning' as const };
    }
    if (testResults[service.id] === 'success') {
      return { label: 'validated', variant: 'success' as const };
    }
    if (testResults[service.id] === 'error') {
      return { label: 'invalid', variant: 'danger' as const };
    }

    const configured = getConfiguredFieldCount(service);
    if (configured === 0) {
      return { label: 'not configured', variant: 'secondary' as const };
    }
    if (configured < service.fields.length) {
      return { label: 'partial', variant: 'warning' as const };
    }

    return { label: 'configured', variant: 'info' as const };
  };

  const openHelp = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowHelpModal(true);
  };

  const testIntegrationConnection = async (service: DirectIntegrationService) => {
    if (getConfiguredFieldCount(service) === 0) {
      toast.error('Enter credentials or configuration values first.');
      return;
    }

    setTestResults((current) => ({ ...current, [service.id]: 'testing' }));

    try {
      const settings = getValues();
      const primaryField = service.fields[0]?.name;
      const result = await testIntegrationAsync({
        service: service.testTarget,
        value: primaryField ? String(settings[primaryField] || '') : undefined,
        settings,
      });

      setTestResults((current) => ({
        ...current,
        [service.id]: result.success ? 'success' : 'error',
      }));
    } catch (error) {
      setTestResults((current) => ({ ...current, [service.id]: 'error' }));
    }
  };

  const renderField = (service: DirectIntegrationService, fieldConfig: DirectIntegrationField) => (
    <Controller
      key={`${service.id}-${fieldConfig.name}`}
      name={fieldConfig.name}
      control={control}
      render={({ field, fieldState }) => (
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">{fieldConfig.label}</Form.Label>
          <Form.Control
            {...field}
            as={fieldConfig.type === 'textarea' ? 'textarea' : undefined}
            rows={fieldConfig.type === 'textarea' ? fieldConfig.rows || 4 : undefined}
            type={fieldConfig.type === 'textarea' ? undefined : fieldConfig.type || 'text'}
            placeholder={fieldConfig.placeholder}
            value={typeof field.value === 'string' ? field.value : ''}
            isInvalid={Boolean(fieldState.error)}
          />
          {fieldConfig.helpText ? <Form.Text className="text-muted">{fieldConfig.helpText}</Form.Text> : null}
          {fieldState.error ? (
            <Form.Control.Feedback type="invalid">{fieldState.error.message}</Form.Control.Feedback>
          ) : null}
        </Form.Group>
      )}
    />
  );

  const renderDirectServiceCard = (service: DirectIntegrationService) => {
    const status = getConnectionStatus(service);
    const isTesting = testResults[service.id] === 'testing';

    return (
      <Card key={service.id} className="mb-3 border-0 shadow-sm">
        <CardBody>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-start">
              <div className="me-3">
                <IconifyIcon icon={service.icon} className="fs-24 text-primary" />
              </div>
              <div>
                <h6 className="mb-1">{service.label}</h6>
                <small className="text-muted d-block">{service.description}</small>
              </div>
            </div>
            <Badge bg={status.variant}>{status.label}</Badge>
          </div>

          <Row>
            {service.fields.map((fieldConfig) => (
              <Col md={service.fields.length > 1 ? 6 : 12} key={`${service.id}-${fieldConfig.name}`}>
                {renderField(service, fieldConfig)}
              </Col>
            ))}
          </Row>

          {service.note ? (
            <Alert variant="light" className="border mb-3">
              <IconifyIcon icon="solar:info-circle-line-duotone" className="me-2" />
              {service.note}
            </Alert>
          ) : null}

          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => testIntegrationConnection(service)}
              disabled={isTesting || getConfiguredFieldCount(service) === 0}
            >
              {isTesting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Validating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="solar:shield-check-line-duotone" className="me-2" />
                  Validate Config
                </>
              )}
            </Button>

            {service.docs ? (
              <Button variant="outline-secondary" size="sm" as="a" href={service.docs} target="_blank" rel="noreferrer">
                <IconifyIcon icon="solar:link-line-duotone" className="me-2" />
                Provider Docs
              </Button>
            ) : null}

            <Button variant="outline-secondary" size="sm" onClick={() => openHelp(service.id)}>
              <IconifyIcon icon="solar:question-circle-line-duotone" className="me-2" />
              Setup Help
            </Button>
          </div>

          <small className="text-muted d-block mt-2">
            Validation checks required fields and basic format. Runtime connectivity and delivery are exercised by the
            app flows that use this provider.
          </small>
        </CardBody>
      </Card>
    );
  };

  const renderManagedServiceCard = (service: ManagedIntegrationService) => (
    <Card key={service.id} className="mb-3 border-0 shadow-sm bg-light">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="d-flex align-items-start">
            <div className="me-3">
              <IconifyIcon icon={service.icon} className="fs-24 text-primary" />
            </div>
            <div>
              <h6 className="mb-1">{service.label}</h6>
              <small className="text-muted d-block">{service.description}</small>
              {service.note ? <small className="text-muted d-block mt-2">{service.note}</small> : null}
            </div>
          </div>
          <Button variant="primary" size="sm" as="a" href={service.href}>
            {service.cta}
          </Button>
        </div>
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
        subName="Configure platform-owned connectors here and route provider-specific credentials to their dedicated settings pages."
      />

      <Alert variant="info" className="mb-4">
        <IconifyIcon icon="solar:shield-check-line-duotone" className="me-2" />
        This page is now the control center for integrations. It only owns connectors whose credentials are not managed
        elsewhere in Settings. Email, SMS, push, and payment credentials intentionally live on their dedicated settings
        pages to prevent conflicting configuration.
      </Alert>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="border-bottom">
            <CardTitle>Integration Management</CardTitle>
          </CardHeader>
          <CardBody>
            <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'ai')}>
              <Nav variant="pills" className="mb-4">
                {integrationTabs.map((tab) => (
                  <Nav.Item key={tab.key}>
                    <Nav.Link eventKey={tab.key} className="d-flex align-items-center">
                      <IconifyIcon icon={tab.icon} className="me-2" />
                      {tab.title}
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
                {integrationTabs.map((tab) => (
                  <Tab.Pane key={tab.key} eventKey={tab.key}>
                    <div className="mb-4">
                      <h5 className="d-flex align-items-center mb-3">
                        <IconifyIcon icon={tab.icon} className="me-2 text-primary" />
                        {tab.title}
                      </h5>

                      {tab.note ? (
                        <Alert variant="light" className="border mb-3">
                          <IconifyIcon icon="solar:info-circle-line-duotone" className="me-2" />
                          {tab.note}
                        </Alert>
                      ) : null}

                      {tab.managedServices?.map(renderManagedServiceCard)}
                      {tab.directServices?.map(renderDirectServiceCard)}
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
                      Enable these only after at least one AI provider above is configured and validated.
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
                                  name={feature.name}
                                  control={control}
                                  render={({ field }) => (
                                    <Form.Check
                                      type="switch"
                                      id={String(feature.name)}
                                      checked={Boolean(field.value)}
                                      onChange={(event) => field.onChange(event.target.checked)}
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
      </Form>

      <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Integration Setup Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <IconifyIcon icon="solar:question-circle-line-duotone" className="fs-48 text-primary" />
          </div>
          <h6>{selectedService?.label || 'Integration'} setup checklist</h6>
          <ol className="mt-3 mb-0">
            <li>Open the provider dashboard and create or rotate production credentials.</li>
            <li>Copy the exact values requested on this page, including endpoint or bucket fields where applicable.</li>
            <li>Save the settings and run validation from this card.</li>
            <li>Use the linked dedicated settings page when the integration belongs to email, SMS, push, or payment.</li>
          </ol>
          {selectedService?.docs ? (
            <Alert variant="light" className="border mt-3 mb-0">
              <IconifyIcon icon="solar:link-line-duotone" className="me-2" />
              Provider docs: <a href={selectedService.docs} target="_blank" rel="noreferrer">{selectedService.docs}</a>
            </Alert>
          ) : null}
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
