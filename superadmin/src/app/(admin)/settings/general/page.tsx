'use client';

import { Card, CardBody, Row, Col, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface SettingsCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  href: string;
  stats?: {
    label: string;
    value: string;
    variant: string;
  };
}

const GeneralSettingsPage = () => {
  const router = useRouter();

  const settingsCards: SettingsCard[] = [
    {
      id: 'application',
      title: 'Application Configuration',
      description: 'Manage application branding, contact information, and basic settings for user-app, guard-app, and superadmin panels.',
      icon: 'material-symbols:settings-applications',
      iconBg: 'primary',
      href: '/settings/general/application',
      stats: {
        label: 'Workspace',
        value: 'Config',
        variant: 'success',
      }
    },
    {
      id: 'system',
      title: 'System Configuration',
      description: 'Configure system behavior, performance settings, file upload limits, and technical parameters.',
      icon: 'material-symbols:computer',
      iconBg: 'info',
      href: '/settings/general/system',
      stats: {
        label: 'Scope',
        value: 'Core',
        variant: 'info',
      }
    },
    {
      id: 'business',
      title: 'Business Configuration',
      description: 'Set up financial settings, maintenance fees, payment rules, and visitor management policies.',
      icon: 'material-symbols:business-center',
      iconBg: 'success',
      href: '/settings/general/business',
      stats: {
        label: 'Scope',
        value: 'Finance',
        variant: 'success',
      }
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Configure security policies, data retention rules, privacy settings, and compliance requirements.',
      icon: 'material-symbols:security',
      iconBg: 'danger',
      href: '/settings/general/security',
      stats: {
        label: 'Mode',
        value: 'Policy',
        variant: 'danger',
      }
    },
    {
      id: 'integrations',
      title: 'Integration Settings',
      description: 'Manage third-party API configurations, service integrations, and external platform connections.',
      icon: 'material-symbols:integration-instructions',
      iconBg: 'warning',
      href: '/settings/general/integrations',
      stats: {
        label: 'Mode',
        value: 'Secure',
        variant: 'warning',
      }
    },
    {
      id: 'regional',
      title: 'Regional & Localization',
      description: 'Configure timezone, date/time formats, currency settings, and localization preferences.',
      icon: 'material-symbols:language',
      iconBg: 'secondary',
      href: '/settings/general/regional',
      stats: {
        label: 'Scope',
        value: 'Locale',
        variant: 'info',
      }
    }
  ];

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <>
      <PageTitle title="General Settings" subName="Platform Configuration" />
      
      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="mb-1">General Settings Overview</h4>
              <p className="text-muted mb-0">
                Configure platform-wide settings for the Community Hub, Guard app, and superadmin workspace
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => router.push('/settings/system/overview')}
              >
                <IconifyIcon icon="material-symbols:monitoring" className="me-1" />
                System Overview
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => router.push('/settings/module-settings')}
              >
                <IconifyIcon icon="material-symbols:toggle-on" className="me-1" />
                Module Settings
              </Button>
            </div>
          </div>

          <Row className="g-3">
            {settingsCards.map((card) => (
              <Col key={card.id} xl={4} lg={6} md={6}>
                <Card 
                  className="h-100 cursor-pointer border-0 shadow-sm hover-shadow transition-all"
                  onClick={() => handleCardClick(card.href)}
                  style={{ cursor: 'pointer' }}
                >
                  <CardBody className="p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className={`d-flex align-items-center justify-content-center rounded-circle bg-${card.iconBg} bg-opacity-10`}
                           style={{ width: '48px', height: '48px' }}>
                        <IconifyIcon 
                          icon={card.icon} 
                          className={`text-${card.iconBg} fs-4`} 
                        />
                      </div>
                      {card.stats && (
                        <span className={`badge bg-${card.stats.variant} bg-opacity-10 text-${card.stats.variant} border border-${card.stats.variant} border-opacity-25`}>
                          {card.stats.label}: {card.stats.value}
                        </span>
                      )}
                    </div>
                    
                    <h5 className="mb-2">{card.title}</h5>
                    <p className="text-muted mb-3 small">{card.description}</p>
                    
                    <div className="d-flex align-items-center justify-content-between">
                      <Button 
                        variant={`outline-${card.iconBg}`} 
                        size="sm"
                        className="d-flex align-items-center"
                      >
                        <IconifyIcon icon="material-symbols:settings" className="me-1" />
                        Configure
                      </Button>
                      <IconifyIcon 
                        icon="material-symbols:arrow-forward-ios" 
                        className="text-muted" 
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="mt-4 p-3 bg-light rounded">
            <div className="d-flex align-items-center">
              <IconifyIcon icon="material-symbols:info" className="text-info me-2" />
              <div>
                <strong>Quick Actions:</strong>
                <span className="text-muted ms-2">
                  Use the cards above to navigate to specific settings categories. 
                  Each section loads the live settings workspace for that category without duplicating configuration flows.
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default GeneralSettingsPage;
