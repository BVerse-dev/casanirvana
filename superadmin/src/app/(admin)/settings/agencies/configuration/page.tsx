'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Badge, Tab, Tabs, Alert, ProgressBar } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { 
  useAgencyConfigurationUI, 
  useUpdateAgencyConfiguration,
  useCreateAgencyConfiguration,
  useAgencyConfigurationsRealtime,
  type AgencyConfigurationUI 
} from '@/hooks/useAgencyConfigurations';
import { useAgencyProfiles } from '@/hooks/useAgencyProfiles';

// Configuration Types
interface AgencyConfiguration {
  id: string;
  agency_id: string;
  agency_name: string;
  
  // Commission Settings
  commission_settings: {
    default_rate: number;
    property_type_rates: {
      residential: number;
      commercial: number;
      luxury: number;
      plot: number;
    };
    agent_tier_rates: {
      junior: number;
      senior: number;
      team_leader: number;
      manager: number;
    };
    split_policy: 'agency_agent' | 'tiered' | 'performance_based';
    payment_schedule: 'immediate' | 'monthly' | 'quarterly';
  };
  
  // Property Listing Settings
  listing_settings: {
    auto_approval_required: boolean;
    max_photos_per_listing: number;
    mandatory_fields: string[];
    listing_duration_days: number;
    renewal_notification_days: number;
    featured_listing_fee: number;
  };
  
  // Lead Management Settings
  lead_settings: {
    auto_assignment: boolean;
    lead_rotation: 'round_robin' | 'performance_based' | 'manual';
    follow_up_reminders: boolean;
    max_leads_per_agent: number;
    lead_expiry_days: number;
    hot_lead_criteria: {
      budget_range: string;
      response_time_hours: number;
      engagement_score: number;
    };
  };
  
  // Communication Settings
  communication: {
    sms_notifications: boolean;
    email_notifications: boolean;
    whatsapp_integration: boolean;
    automated_follow_ups: boolean;
    client_portal_access: boolean;
    marketing_emails: boolean;
  };
  
  // Performance Settings
  performance: {
    target_settings: {
      monthly_listing_target: number;
      monthly_deal_target: number;
      monthly_revenue_target: number;
    };
    kpi_tracking: {
      response_time: boolean;
      conversion_rate: boolean;
      client_satisfaction: boolean;
      repeat_business: boolean;
    };
    incentive_structure: {
      performance_bonus: boolean;
      quarterly_incentives: boolean;
      annual_awards: boolean;
    };
  };
  
  // Financial Settings
  financial: {
    payment_terms: {
      client_payment_days: number;
      commission_payment_days: number;
      late_payment_penalty: number;
    };
    expense_management: {
      marketing_budget: number;
      travel_allowance: number;
      communication_allowance: number;
    };
    tax_settings: {
      gst_applicable: boolean;
      gst_percentage: number;
      gst_number?: string;
      tds_applicable: boolean;
      tds_percentage: number;
    };
  };
  
  // Compliance Settings
  compliance: {
    rera_compliance: {
      registration_mandatory: boolean;
      document_verification: boolean;
      periodic_renewal: boolean;
    };
    data_protection: {
      client_data_encryption: boolean;
      gdpr_compliance: boolean;
      data_retention_months: number;
    };
    legal_documentation: {
      agreement_templates: boolean;
      digital_signatures: boolean;
      document_storage: string;
    };
  };
  
  status: 'active' | 'inactive';
  last_updated: string;
  updated_by: string;
}

const createDefaultConfiguration = (agencyId = '', agencyName = ''): AgencyConfigurationUI => ({
  id: '',
  agency_id: agencyId,
  agency_name: agencyName,
  commission_settings: {
    default_rate: 2.5,
    property_type_rates: {
      residential: 2.0,
      commercial: 3.0,
      luxury: 3.5,
      plot: 1.5,
    },
    agent_tier_rates: {
      junior: 40,
      senior: 50,
      team_leader: 60,
      manager: 70,
    },
    split_policy: 'tiered',
    payment_schedule: 'monthly',
  },
  listing_settings: {
    auto_approval_required: true,
    max_photos_per_listing: 20,
    mandatory_fields: ['title', 'price', 'location', 'area', 'property_type'],
    listing_duration_days: 90,
    renewal_notification_days: 7,
    featured_listing_fee: 5000,
  },
  lead_settings: {
    auto_assignment: true,
    lead_rotation: 'performance_based',
    follow_up_reminders: true,
    max_leads_per_agent: 25,
    lead_expiry_days: 30,
    hot_lead_criteria: {
      budget_range: 'GH₵ 50k-100k',
      response_time_hours: 2,
      engagement_score: 80,
    },
  },
  communication: {
    sms_notifications: true,
    email_notifications: true,
    whatsapp_integration: true,
    automated_follow_ups: true,
    client_portal_access: true,
    marketing_emails: false,
  },
  performance: {
    target_settings: {
      monthly_listing_target: 10,
      monthly_deal_target: 3,
      monthly_revenue_target: 500000,
    },
    kpi_tracking: {
      response_time: true,
      conversion_rate: true,
      client_satisfaction: true,
      repeat_business: true,
    },
    incentive_structure: {
      performance_bonus: true,
      quarterly_incentives: true,
      annual_awards: true,
    },
  },
  financial: {
    payment_terms: {
      client_payment_days: 30,
      commission_payment_days: 15,
      late_payment_penalty: 2,
    },
    expense_management: {
      marketing_budget: 50000,
      travel_allowance: 5000,
      communication_allowance: 2000,
    },
    tax_settings: {
      gst_applicable: true,
      gst_percentage: 15,
      gst_number: '',
      tds_applicable: true,
      tds_percentage: 5,
    },
  },
  compliance: {
    rera_compliance: {
      registration_mandatory: true,
      document_verification: true,
      periodic_renewal: true,
    },
    data_protection: {
      client_data_encryption: true,
      gdpr_compliance: true,
      data_retention_months: 60,
    },
    legal_documentation: {
      agreement_templates: true,
      digital_signatures: true,
      document_storage: 'cloud',
    },
  },
  status: 'active',
  last_updated: new Date().toISOString(),
  updated_by: 'System',
});

const AgencyConfigurationPage = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('commission');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');

  // Real data hooks
  const { data: agencies, isLoading: agenciesLoading } = useAgencyProfiles();
  const { data: configuration, isLoading: configLoading, error: configError } = useAgencyConfigurationUI(selectedAgencyId);
  const updateConfigurationMutation = useUpdateAgencyConfiguration();
  const createConfigurationMutation = useCreateAgencyConfiguration();
  const selectedAgencyName = agencies?.find((agency: any) => agency.id === selectedAgencyId)?.name || '';
  
  // Real-time subscription for live updates
  useAgencyConfigurationsRealtime();

  const { handleSubmit, reset, setValue, watch, register } = useForm<AgencyConfigurationUI>({
    defaultValues: createDefaultConfiguration(),
  });

  // Set default agency if available and none selected
  useEffect(() => {
    if (agencies && agencies.length > 0 && !selectedAgencyId) {
      setSelectedAgencyId(agencies[0].id);
    }
  }, [agencies, selectedAgencyId]);

  // Update form when configuration data changes
  useEffect(() => {
    if (configuration) {
      reset(configuration);
    } else if (!configLoading && selectedAgencyId) {
      reset(createDefaultConfiguration(selectedAgencyId, selectedAgencyName));
    }
  }, [configuration, configLoading, selectedAgencyId, selectedAgencyName, reset]);

  const currentConfiguration = watch();
  const formConfiguration =
    currentConfiguration || createDefaultConfiguration(selectedAgencyId, selectedAgencyName);

  const handleSaveConfiguration = async (data: AgencyConfigurationUI) => {
    setLoading(true);
    setSaveError(null);
    try {
      if (configuration?.id) {
        // Update existing configuration
        await updateConfigurationMutation.mutateAsync({
          ...data,
          id: configuration.id,
          agency_id: selectedAgencyId,
          agency_name: selectedAgencyName,
        });
      } else {
        // Create new configuration
        await createConfigurationMutation.mutateAsync({
          ...data,
          agency_id: selectedAgencyId,
          agency_name: selectedAgencyName,
        });
      }
      
      setShowSaveModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save agency configuration.');
    } finally {
      setLoading(false);
    }
  };

  const getConfigurationProgress = () => {
    if (!currentConfiguration) return 0;
    
    const sections = [
      currentConfiguration.commission_settings?.default_rate > 0,
      currentConfiguration.listing_settings?.max_photos_per_listing > 0,
      currentConfiguration.lead_settings?.max_leads_per_agent > 0,
      currentConfiguration.communication?.sms_notifications !== undefined,
      currentConfiguration.performance?.target_settings?.monthly_listing_target > 0,
      currentConfiguration.financial?.payment_terms?.client_payment_days > 0,
      currentConfiguration.compliance?.rera_compliance?.registration_mandatory !== undefined,
    ];
    
    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  return (
    <>
      <PageTitle 
        title="Agency Configuration" 
        subName="Configure agency settings and operational parameters"
      />

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          <IconifyIcon icon="ri:checkbox-circle-line" className="me-2" />
          Configuration updated successfully!
        </Alert>
      )}

      {saveError && (
        <Alert variant="danger" className="mb-4">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          {saveError}
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="agency-configuration" title="Agency Configuration Management">
            {/* Agency Selector */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={6}>
                    <label className="form-label fw-bold">Select Agency to Configure</label>
                    <select 
                      className="form-select" 
                      value={selectedAgencyId}
                      onChange={(e) => setSelectedAgencyId(e.target.value)}
                      disabled={agenciesLoading}
                    >
                      <option value="">Choose an agency...</option>
                      {agencies?.map((agency: any) => (
                        <option key={agency.id} value={agency.id}>{agency.name}</option>
                      ))}
                    </select>
                  </Col>
                  <Col md={6}>
                    {configLoading && (
                      <div className="text-center">
                        <div className="spinner-border spinner-border-sm me-2" />
                        Loading configuration...
                      </div>
                    )}
                    {configError && (
                      <Alert variant="warning" className="mb-0">
                        <IconifyIcon icon="ri:warning-line" className="me-2" />
                        Error loading configuration
                      </Alert>
                    )}
                    {!configLoading && selectedAgencyId && !configuration && (
                      <Alert variant="info" className="mb-0">
                        <IconifyIcon icon="ri:information-line" className="me-2" />
                        No configuration found. Default settings will be used.
                      </Alert>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {/* Configuration Progress */}
            <Card className="mb-4 border-0 shadow-sm bg-gradient-primary">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <h5 className="text-white mb-2">Configuration Progress</h5>
                    <p className="text-white-50 mb-3">Complete your agency configuration for optimal performance</p>
                    <ProgressBar 
                      now={getConfigurationProgress()} 
                      variant="light"
                      className="mb-2"
                      style={{ height: '8px' }}
                    />
                    <small className="text-white-50">{getConfigurationProgress()}% Complete</small>
                  </Col>
                  <Col md={4} className="text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <div className="avatar-lg bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
                        <IconifyIcon icon="ri:settings-4-line" className="fs-2 text-white" />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {selectedAgencyId && !configLoading && currentConfiguration && (
              <>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k || 'commission')}
                  className="mb-4"
                >
              <Tab eventKey="commission" title="Commission Settings">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-primary-subtle">
                        <h6 className="mb-0 text-primary">
                          <IconifyIcon icon="ri:money-dollar-circle-line" className="me-2" />
                          Commission Rates
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <label className="form-label">Default Commission Rate (%)</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              {...register('commission_settings.default_rate', { valueAsNumber: true })}
                              step="0.1"
                              min="0"
                              max="10"
                            />
                            <span className="input-group-text">%</span>
                          </div>
                        </div>

                        <h6 className="mb-3">Property Type Rates</h6>
                        <div className="row">
                          <div className="col-6 mb-3">
                            <label className="form-label small">Residential</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                {...register('commission_settings.property_type_rates.residential', { valueAsNumber: true })}
                                step="0.1"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <label className="form-label small">Commercial</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                {...register('commission_settings.property_type_rates.commercial', { valueAsNumber: true })}
                                step="0.1"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <label className="form-label small">Luxury</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                {...register('commission_settings.property_type_rates.luxury', { valueAsNumber: true })}
                                step="0.1"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <label className="form-label small">Plot</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                {...register('commission_settings.property_type_rates.plot', { valueAsNumber: true })}
                                step="0.1"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-success-subtle">
                        <h6 className="mb-0 text-success">
                          <IconifyIcon icon="ri:team-line" className="me-2" />
                          Agent Tier Commission Split (%)
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="row">
                          <div className="col-6 mb-3">
                            <label className="form-label small">Junior Agent</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                {...register('commission_settings.agent_tier_rates.junior', { valueAsNumber: true })}
                                min="0"
                                max="100"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <label className="form-label small">Senior Agent</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                {...register('commission_settings.agent_tier_rates.senior', { valueAsNumber: true })}
                                min="0"
                                max="100"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <label className="form-label small">Team Leader</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                {...register('commission_settings.agent_tier_rates.team_leader', { valueAsNumber: true })}
                                min="0"
                                max="100"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <label className="form-label small">Manager</label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                {...register('commission_settings.agent_tier_rates.manager', { valueAsNumber: true })}
                                min="0"
                                max="100"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Split Policy</label>
                          <select className="form-select" {...register('commission_settings.split_policy')}>
                            <option value="agency_agent">Agency-Agent Split</option>
                            <option value="tiered">Tiered Structure</option>
                            <option value="performance_based">Performance Based</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Payment Schedule</label>
                          <select className="form-select" {...register('commission_settings.payment_schedule')}>
                            <option value="immediate">Immediate</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                          </select>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="listings" title="Property Listings">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-info-subtle">
                        <h6 className="mb-0 text-info">
                          <IconifyIcon icon="ri:home-5-line" className="me-2" />
                          Listing Configuration
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('listing_settings.auto_approval_required')}
                            />
                            <label className="form-check-label">
                              Auto Approval Required
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Max Photos per Listing</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('listing_settings.max_photos_per_listing', { valueAsNumber: true })}
                            min="1"
                            max="50"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Listing Duration (Days)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('listing_settings.listing_duration_days', { valueAsNumber: true })}
                            min="30"
                            max="365"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Renewal Notification (Days Before)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('listing_settings.renewal_notification_days', { valueAsNumber: true })}
                            min="1"
                            max="30"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Featured Listing Fee (GH₵)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('listing_settings.featured_listing_fee', { valueAsNumber: true })}
                            min="0"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-warning-subtle">
                        <h6 className="mb-0 text-warning">
                          <IconifyIcon icon="ri:file-list-3-line" className="me-2" />
                          Mandatory Fields
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <p className="text-muted mb-3">Select mandatory fields for property listings:</p>
                        
                        {['title', 'price', 'location', 'area', 'property_type', 'description', 'amenities', 'contact_info'].map((field) => (
                          <div key={field} className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formConfiguration.listing_settings.mandatory_fields.includes(field)}
                              onChange={(event) => {
                                const currentFields = formConfiguration.listing_settings.mandatory_fields || [];
                                const nextFields = event.target.checked
                                  ? [...currentFields, field]
                                  : currentFields.filter((mandatoryField) => mandatoryField !== field);
                                setValue('listing_settings.mandatory_fields', nextFields, { shouldDirty: true });
                              }}
                            />
                            <label className="form-check-label text-capitalize">
                              {field.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="leads" title="Lead Management">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-primary-subtle">
                        <h6 className="mb-0 text-primary">
                          <IconifyIcon icon="ri:user-add-line" className="me-2" />
                          Lead Assignment
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('lead_settings.auto_assignment')}
                            />
                            <label className="form-check-label">
                              Auto Assignment Enabled
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Lead Rotation Method</label>
                          <select className="form-select" {...register('lead_settings.lead_rotation')}>
                            <option value="round_robin">Round Robin</option>
                            <option value="performance_based">Performance Based</option>
                            <option value="manual">Manual Assignment</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('lead_settings.follow_up_reminders')}
                            />
                            <label className="form-check-label">
                              Follow-up Reminders
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Max Leads per Agent</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('lead_settings.max_leads_per_agent', { valueAsNumber: true })}
                            min="1"
                            max="100"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Lead Expiry (Days)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('lead_settings.lead_expiry_days', { valueAsNumber: true })}
                            min="1"
                            max="365"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-danger-subtle">
                        <h6 className="mb-0 text-danger">
                          <IconifyIcon icon="ri:fire-line" className="me-2" />
                          Hot Lead Criteria
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <label className="form-label">Budget Range</label>
                          <input
                            type="text"
                            className="form-control"
                            {...register('lead_settings.hot_lead_criteria.budget_range')}
                            placeholder="e.g., GH₵ 50k-100k"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Response Time (Hours)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('lead_settings.hot_lead_criteria.response_time_hours', { valueAsNumber: true })}
                            min="1"
                            max="48"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Minimum Engagement Score</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('lead_settings.hot_lead_criteria.engagement_score', { valueAsNumber: true })}
                            min="0"
                            max="100"
                          />
                        </div>

                        <Alert variant="info" className="mt-3">
                          <IconifyIcon icon="ri:information-line" className="me-2" />
                          <small>
                            Hot leads matching these criteria will be prioritized and may receive special handling.
                          </small>
                        </Alert>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="performance" title="Performance & KPIs">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-success-subtle">
                        <h6 className="mb-0 text-success">
                          <IconifyIcon icon="ri:target-line" className="me-2" />
                          Monthly Targets
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <label className="form-label">Listing Target</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('performance.target_settings.monthly_listing_target', { valueAsNumber: true })}
                            min="0"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Deal Target</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('performance.target_settings.monthly_deal_target', { valueAsNumber: true })}
                            min="0"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Revenue Target ($)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('performance.target_settings.monthly_revenue_target', { valueAsNumber: true })}
                            min="0"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-info-subtle">
                        <h6 className="mb-0 text-info">
                          <IconifyIcon icon="ri:dashboard-line" className="me-2" />
                          KPI Tracking
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('performance.kpi_tracking.response_time')}
                            />
                            <label className="form-check-label">
                              Response Time Tracking
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('performance.kpi_tracking.conversion_rate')}
                            />
                            <label className="form-check-label">
                              Conversion Rate Tracking
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('performance.kpi_tracking.client_satisfaction')}
                            />
                            <label className="form-check-label">
                              Client Satisfaction Score
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('performance.kpi_tracking.repeat_business')}
                            />
                            <label className="form-check-label">
                              Repeat Business Tracking
                            </label>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="financial" title="Financial Settings">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-warning-subtle">
                        <h6 className="mb-0 text-warning">
                          <IconifyIcon icon="ri:calendar-line" className="me-2" />
                          Payment Terms
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <label className="form-label">Client Payment Terms (Days)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('financial.payment_terms.client_payment_days', { valueAsNumber: true })}
                            min="0"
                            max="90"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Commission Payment (Days)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('financial.payment_terms.commission_payment_days', { valueAsNumber: true })}
                            min="0"
                            max="30"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Late Payment Penalty (%)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('financial.payment_terms.late_payment_penalty', { valueAsNumber: true })}
                            min="0"
                            max="10"
                            step="0.1"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-danger-subtle">
                        <h6 className="mb-0 text-danger">
                          <IconifyIcon icon="ri:file-text-line" className="me-2" />
                          Tax Settings
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('financial.tax_settings.gst_applicable')}
                            />
                            <label className="form-check-label">
                              Tax Applicable
                            </label>
                          </div>
                        </div>

                        {formConfiguration.financial.tax_settings.gst_applicable && (
                          <>
                            <div className="mb-3">
                              <label className="form-label">Tax Percentage (%)</label>
                              <input
                                type="number"
                                className="form-control"
                                {...register('financial.tax_settings.gst_percentage', { valueAsNumber: true })}
                                min="0"
                                max="30"
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Tax Reference</label>
                              <input
                                type="text"
                                className="form-control"
                                {...register('financial.tax_settings.gst_number')}
                                placeholder="Enter tax reference"
                              />
                            </div>
                          </>
                        )}

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('financial.tax_settings.tds_applicable')}
                            />
                            <label className="form-check-label">
                              TDS Applicable
                            </label>
                          </div>
                        </div>

                        {formConfiguration.financial.tax_settings.tds_applicable && (
                          <div className="mb-3">
                            <label className="form-label">TDS Percentage (%)</label>
                            <input
                              type="number"
                              className="form-control"
                              {...register('financial.tax_settings.tds_percentage', { valueAsNumber: true })}
                              min="0"
                              max="30"
                            />
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="compliance" title="Compliance & Security">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-primary-subtle">
                        <h6 className="mb-0 text-primary">
                          <IconifyIcon icon="ri:shield-check-line" className="me-2" />
                          RERA Compliance
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('compliance.rera_compliance.registration_mandatory')}
                            />
                            <label className="form-check-label">
                              RERA Registration Mandatory
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('compliance.rera_compliance.document_verification')}
                            />
                            <label className="form-check-label">
                              Document Verification Required
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('compliance.rera_compliance.periodic_renewal')}
                            />
                            <label className="form-check-label">
                              Periodic Renewal Tracking
                            </label>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-info-subtle">
                        <h6 className="mb-0 text-info">
                          <IconifyIcon icon="ri:lock-line" className="me-2" />
                          Data Protection
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('compliance.data_protection.client_data_encryption')}
                            />
                            <label className="form-check-label">
                              Client Data Encryption
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register('compliance.data_protection.gdpr_compliance')}
                            />
                            <label className="form-check-label">
                              GDPR Compliance
                            </label>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Data Retention (Months)</label>
                          <input
                            type="number"
                            className="form-control"
                            {...register('compliance.data_protection.data_retention_months', { valueAsNumber: true })}
                            min="12"
                            max="120"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
              </Tabs>

              <div className="text-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowSaveModal(true)}
                  className="px-4"
                  disabled={!selectedAgencyId}
                >
                  <IconifyIcon icon="ri:save-line" className="me-2" />
                  Save Configuration
                </Button>
              </div>
              </>
            )}
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Save Confirmation Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Save Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <IconifyIcon 
              icon="ri:save-line" 
              className="fs-1 text-primary mb-3" 
            />
            <h5>Save Configuration Changes?</h5>
            <p className="text-muted">
              This will update the agency configuration settings. All changes will be applied immediately.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowSaveModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSaveConfiguration(currentConfiguration)}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AgencyConfigurationPage;
