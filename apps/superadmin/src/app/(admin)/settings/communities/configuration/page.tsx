'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Badge, Tab, Tabs, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ReactApexChart from 'react-apexcharts';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import {
  useCommunityConfigurations,
  useCommunityConfigurationByCommunity,
  useUpdateCommunityConfiguration,
} from '@/hooks/useCommunityConfigurations';
import type { CommunityConfiguration } from '@/hooks/useCommunityConfigurations';

const CommunityConfigurationPage = () => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState('');

  const {
    data: communityConfigurations = [],
    isLoading: isLoadingCommunityConfigurations,
    error: communityConfigurationsError,
  } = useCommunityConfigurations();

  useEffect(() => {
    if (!selectedCommunity && communityConfigurations.length > 0) {
      setSelectedCommunity(communityConfigurations[0].community_id);
    }
  }, [communityConfigurations, selectedCommunity]);

  // Fetch configuration data
  const { data: configuration, isLoading, error } = useCommunityConfigurationByCommunity(selectedCommunity);
  
  // Update mutation
  const updateConfigurationMutation = useUpdateCommunityConfiguration();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CommunityConfiguration>({
    defaultValues: configuration || undefined,
  });

  // Watch form changes
  const watchedValues = watch();

  // Update form when configuration loads
  useEffect(() => {
    if (configuration) {
      reset(configuration);
      setHasChanges(false);
    }
  }, [configuration, reset]);

  useEffect(() => {
    if (!configuration) {
      return;
    }

    setHasChanges(JSON.stringify(watchedValues) !== JSON.stringify(configuration));
  }, [configuration, watchedValues]);

  // Configuration sections
  const configurationSections = [
    {
      key: 'maintenance',
      title: 'Maintenance Charges',
      icon: 'ri:money-dollar-circle-line',
      color: 'primary',
      description: 'Configure maintenance fee structure and billing',
    },
    {
      key: 'amenities',
      title: 'Amenity Settings',
      icon: 'ri:building-2-line',
      color: 'success',
      description: 'Amenity booking rules and restrictions',
    },
    {
      key: 'visitors',
      title: 'Visitor Management',
      icon: 'ri:user-add-line',
      color: 'info',
      description: 'Visitor registration and access policies',
    },
    {
      key: 'communication',
      title: 'Communication',
      icon: 'ri:message-3-line',
      color: 'warning',
      description: 'Notification and communication preferences',
    },
    {
      key: 'security',
      title: 'Security Settings',
      icon: 'ri:shield-check-line',
      color: 'danger',
      description: 'Authentication and access control settings',
    },
    {
      key: 'financial',
      title: 'Financial Settings',
      icon: 'ri:wallet-line',
      color: 'secondary',
      description: 'Payment methods and financial configuration',
    },
  ];

  const handleSaveConfiguration = async (data: CommunityConfiguration) => {
    if (!configuration) {
      return;
    }

    setSaveError(null);

    try {
      const updatedConfig = await updateConfigurationMutation.mutateAsync({
        id: configuration.id,
        config: data,
      });

      reset(updatedConfig);
      setHasChanges(false);
      setShowSaveModal(false);
      setSaveSuccess('Community configuration saved successfully.');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save community configuration.');
    }
  };

  const getCompletionPercentage = () => {
    const currentConfiguration = watchedValues?.community_id ? watchedValues : configuration;

    if (!currentConfiguration) {
      return 0;
    }

    let completed = 0;
    let total = 6; // Total sections
    
    // Check each section for basic completion
    if (currentConfiguration.maintenance_charges.per_sqft_rate > 0) completed++;
    if (currentConfiguration.amenity_settings.booking_advance_days > 0) completed++;
    if (currentConfiguration.visitor_settings.max_visitors_per_day > 0) completed++;
    if (currentConfiguration.communication.emergency_contacts.length > 0) completed++;
    if (currentConfiguration.security.password_policy.min_length >= 8) completed++;
    if (Object.values(currentConfiguration.financial.payment_methods).some(Boolean)) completed++;
    
    return (completed / total) * 100;
  };

  // Handle loading and error states
  if (isLoading || isLoadingCommunityConfigurations) {
    return (
      <>
        <PageTitle 
          title="Community Configuration" 
          subName="Configure community settings and policies"
        />
        <ComponentContainerCard title="Community Configuration" id="community-config">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading configuration...</p>
          </div>
        </ComponentContainerCard>
      </>
    );
  }

  if (communityConfigurationsError) {
    return (
      <>
        <PageTitle
          title="Community Configuration"
          subName="Configure community settings and policies"
        />
        <ComponentContainerCard title="Community Configuration" id="community-config">
          <Alert variant="danger">
            <IconifyIcon icon="ri:error-warning-line" className="me-2" />
            Error loading communities: {communityConfigurationsError.message}
          </Alert>
        </ComponentContainerCard>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageTitle 
          title="Community Configuration" 
          subName="Configure community settings and policies"
        />
        <ComponentContainerCard title="Community Configuration" id="community-config">
          <Alert variant="danger">
            <IconifyIcon icon="ri:error-warning-line" className="me-2" />
            Error loading configuration: {error.message}
          </Alert>
        </ComponentContainerCard>
      </>
    );
  }

  if (!configuration) {
    return (
      <>
        <PageTitle 
          title="Community Configuration" 
          subName="Configure community settings and policies"
        />
        <ComponentContainerCard title="Community Configuration" id="community-config">
          <Alert variant="info">
            <IconifyIcon icon="ri:information-line" className="me-2" />
            {communityConfigurations.length === 0
              ? 'No community configuration records were found yet.'
              : 'No configuration found for the selected community.'}
          </Alert>
        </ComponentContainerCard>
      </>
    );
  }

  return (
    <>
      <PageTitle 
        title="Community Configuration" 
        subName="Configure community settings and policies"
      />

      {saveSuccess && (
        <Alert variant="success" className="mb-4">
          <IconifyIcon icon="ri:check-line" className="me-2" />
          {saveSuccess}
        </Alert>
      )}

      {saveError && (
        <Alert variant="danger" className="mb-4">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          {saveError}
        </Alert>
      )}

      <ComponentContainerCard title="Community Configuration" id="community-config">
        <Row className="mb-4">
          <Col lg={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Select Community</Form.Label>
              <Form.Select
                value={selectedCommunity}
                onChange={(event) => setSelectedCommunity(event.target.value)}
              >
                {communityConfigurations.map((communityConfig) => (
                  <option key={communityConfig.community_id} value={communityConfig.community_id}>
                    {communityConfig.community_name || communityConfig.community_id}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Tabs defaultActiveKey="overview" className="mb-3">
          <Tab eventKey="overview" title="Configuration Overview">
            <Row className="mb-4">
              <Col lg={8}>
                <Card>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Configuration Completion</h5>
                      <Badge bg="primary">{getCompletionPercentage().toFixed(0)}% Complete</Badge>
                    </div>
                    <ProgressBar 
                      now={getCompletionPercentage()} 
                      variant="primary" 
                      className="mb-3"
                      style={{ height: '8px' }}
                    />
                    <p className="text-muted mb-0">
                      Complete all configuration sections to optimize your community management experience.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:settings-3-line" className="display-6 text-primary mb-2" />
                    <h6>Community: {configuration.community_name}</h6>
                    <small className="text-muted">
                      Last Updated: {new Date(configuration.last_updated).toLocaleDateString()}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              {configurationSections.map((section) => (
                <Col lg={4} md={6} key={section.key} className="mb-3">
                  <Card className={`border-${section.color} h-100`}>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className={`avatar-sm bg-${section.color} bg-gradient rounded-circle me-3 d-flex align-items-center justify-content-center`}>
                          <IconifyIcon icon={section.icon} className="text-white" style={{ fontSize: '1.2rem' }} />
                        </div>
                        <div>
                          <h6 className="mb-1">{section.title}</h6>
                          <Badge bg={`outline-${section.color}`}>Configured</Badge>
                        </div>
                      </div>
                      <p className="text-muted mb-3">{section.description}</p>
                      <Button variant={`outline-${section.color}`} size="sm" className="w-100">
                        Configure
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="maintenance" title="Maintenance Charges">
            <Form>
              <Card>
                <Card.Header>
                  <h5>Maintenance Fee Configuration</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Rate per Sq.Ft (GH₵) *</Form.Label>
                        <Form.Control 
                          type="number" 
                          step="0.01"
                          {...register('maintenance_charges.per_sqft_rate')}
                          isInvalid={!!errors.maintenance_charges?.per_sqft_rate}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.maintenance_charges?.per_sqft_rate?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Billing Cycle *</Form.Label>
                        <Form.Select {...register('maintenance_charges.billing_cycle')}>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Due Date (Day of Month) *</Form.Label>
                        <Form.Control 
                          type="number" 
                          min="1" 
                          max="31"
                          {...register('maintenance_charges.due_date')}
                          isInvalid={!!errors.maintenance_charges?.due_date}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.maintenance_charges?.due_date?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Grace Period (Days) *</Form.Label>
                        <Form.Control 
                          type="number" 
                          min="0"
                          {...register('maintenance_charges.grace_period')}
                          isInvalid={!!errors.maintenance_charges?.grace_period}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.maintenance_charges?.grace_period?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Late Fee (%)</Form.Label>
                        <Form.Control 
                          type="number" 
                          step="0.1"
                          {...register('maintenance_charges.late_fee_percentage')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Advance Payment Discount (%)</Form.Label>
                        <Form.Control 
                          type="number" 
                          step="0.1"
                          {...register('maintenance_charges.advance_payment_discount')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Form>
          </Tab>

          <Tab eventKey="amenities" title="Amenity Settings">
            <Card>
              <Card.Header>
                <h5>Amenity Booking Configuration</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Advance Booking Days *</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1"
                        {...register('amenity_settings.booking_advance_days')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Bookings per User *</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1"
                        {...register('amenity_settings.max_bookings_per_user')}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cancellation Notice (Hours)</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1"
                        {...register('amenity_settings.cancellation_hours')}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      id="security_deposit_required"
                      label="Security Deposit Required"
                      {...register('amenity_settings.security_deposit_required')}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      id="automatic_approval"
                      label="Automatic Approval"
                      {...register('amenity_settings.automatic_approval')}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="visitors" title="Visitor Management">
            <Card>
              <Card.Header>
                <h5>Visitor Access Configuration</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Visitors per Day *</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1"
                        {...register('visitor_settings.max_visitors_per_day')}
                        isInvalid={!!errors.visitor_settings?.max_visitors_per_day}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.visitor_settings?.max_visitors_per_day?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Visitor Pass Duration (Hours)</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1"
                        {...register('visitor_settings.visitor_pass_duration')}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Visiting Hours Start</Form.Label>
                      <Form.Control 
                        type="time"
                        {...register('visitor_settings.visiting_hours.start_time')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Visiting Hours End</Form.Label>
                      <Form.Control 
                        type="time"
                        {...register('visitor_settings.visiting_hours.end_time')}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Check
                      type="checkbox"
                      id="pre_approval_required"
                      label="Pre-approval Required"
                      {...register('visitor_settings.pre_approval_required')}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="checkbox"
                      id="photo_mandatory"
                      label="Photo Mandatory"
                      {...register('visitor_settings.photo_mandatory')}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="checkbox"
                      id="id_verification_required"
                      label="ID Verification Required"
                      {...register('visitor_settings.id_verification_required')}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="communication" title="Communication">
            <Card>
              <Card.Header>
                <h5>Communication Preferences</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Check
                      type="checkbox"
                      id="sms_notifications"
                      label="SMS Notifications"
                      {...register('communication.sms_notifications')}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Check
                      type="checkbox"
                      id="email_notifications"
                      label="Email Notifications"
                      {...register('communication.email_notifications')}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Check
                      type="checkbox"
                      id="push_notifications"
                      label="Push Notifications"
                      {...register('communication.push_notifications')}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Check
                      type="checkbox"
                      id="whatsapp_integration"
                      label="WhatsApp Integration"
                      {...register('communication.whatsapp_integration')}
                    />
                  </Col>
                </Row>

                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact Numbers</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    placeholder="Enter emergency contact numbers (one per line)"
                    value={(watchedValues.communication?.emergency_contacts || []).join('\n')}
                    onChange={(event) => {
                      setValue(
                        'communication.emergency_contacts',
                        event.target.value
                          .split('\n')
                          .map((value) => value.trim())
                          .filter(Boolean),
                        { shouldDirty: true }
                      );
                    }}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="security" title="Security Settings">
            <Card>
              <Card.Header>
                <h5>Security Configuration</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      id="two_factor_auth"
                      label="Two-Factor Authentication"
                      {...register('security.two_factor_auth')}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Session Timeout (minutes) *</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="5" 
                        max="1440"
                        {...register('security.session_timeout')}
                        isInvalid={!!errors.security?.session_timeout}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.security?.session_timeout?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <hr />

                <h6>Password Policy</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Length</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="6" 
                        max="20"
                        {...register('security.password_policy.min_length')}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={3}>
                    <Form.Check
                      type="checkbox"
                      id="require_uppercase"
                      label="Uppercase Required"
                      {...register('security.password_policy.require_uppercase')}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Check
                      type="checkbox"
                      id="require_lowercase"
                      label="Lowercase Required"
                      {...register('security.password_policy.require_lowercase')}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Check
                      type="checkbox"
                      id="require_numbers"
                      label="Numbers Required"
                      {...register('security.password_policy.require_numbers')}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Check
                      type="checkbox"
                      id="require_special_chars"
                      label="Special Chars Required"
                      {...register('security.password_policy.require_special_chars')}
                    />
                  </Col>
                </Row>

                <hr />

                <h6>Access Control</h6>
                <Row>
                  <Col md={4}>
                    <Form.Check
                      type="checkbox"
                      id="resident_portal"
                      label="Resident Portal Access"
                      {...register('security.access_control.resident_portal')}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="checkbox"
                      id="guest_wifi"
                      label="Guest WiFi Access"
                      {...register('security.access_control.guest_wifi')}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="checkbox"
                      id="mobile_app"
                      label="Mobile App Access"
                      {...register('security.access_control.mobile_app')}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="financial" title="Financial Settings">
            <Card>
              <Card.Header>
                <h5>Financial Configuration</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice Template</Form.Label>
                      <Form.Select {...register('financial.invoice_template')}>
                        <option value="standard">Standard Template</option>
                        <option value="detailed">Detailed Template</option>
                        <option value="minimal">Minimal Template</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <hr />

                <h6>Tax Settings</h6>
                <Row>
                  <Col md={4}>
                    <Form.Check
                      type="checkbox"
                      id="gst_applicable"
                      label="Tax Applicable"
                      {...register('financial.tax_settings.gst_applicable')}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Percentage</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.1"
                        {...register('financial.tax_settings.gst_percentage')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Number</Form.Label>
                      <Form.Control {...register('financial.tax_settings.gst_number')} />
                    </Form.Group>
                  </Col>
                </Row>

                <hr />

                <h6>Payment Methods</h6>
                <Row>
                  <Col md={2}>
                    <Form.Check
                      type="checkbox"
                      id="cash"
                      label="Cash"
                      {...register('financial.payment_methods.cash')}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Check
                      type="checkbox"
                      id="bank_transfer"
                      label="Bank Transfer"
                      {...register('financial.payment_methods.bank_transfer')}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Check
                      type="checkbox"
                      id="upi"
                      label="Mobile Money"
                      {...register('financial.payment_methods.upi')}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Check
                      type="checkbox"
                      id="card"
                      label="Card"
                      {...register('financial.payment_methods.card')}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Check
                      type="checkbox"
                      id="cheque"
                      label="Cheque"
                      {...register('financial.payment_methods.cheque')}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Check
                      type="checkbox"
                      id="online"
                      label="Online"
                      {...register('financial.payment_methods.online')}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        <Row className="mt-4">
          <Col className="text-end">
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => {
                if (!configuration) {
                  return;
                }
                reset(configuration);
                setHasChanges(false);
                setSaveError(null);
              }}
              disabled={!hasChanges || updateConfigurationMutation.isPending}
            >
              Reset to Current
            </Button>
            <Button 
              variant="primary"
              onClick={() => setShowSaveModal(true)}
              disabled={!hasChanges}
            >
              <IconifyIcon icon="ri:save-line" className="me-1" />
              Save Configuration
            </Button>
          </Col>
        </Row>
      </ComponentContainerCard>

      {/* Save Configuration Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Save Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <IconifyIcon icon="ri:information-line" className="me-2" />
            This will update the configuration for <strong>{configuration.community_name}</strong>. 
            All current settings will be overwritten.
          </Alert>
          <p>Are you sure you want to save these configuration changes?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(handleSaveConfiguration)} disabled={updateConfigurationMutation.isPending}>
            <IconifyIcon icon="ri:save-line" className="me-1" />
            {updateConfigurationMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CommunityConfigurationPage;
