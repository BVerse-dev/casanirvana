'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Badge, Tab, Tabs, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ReactApexChart from 'react-apexcharts';
import { useQueryClient } from '@tanstack/react-query';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { 
  useCommunityConfigurationByCommunity, 
  useUpdateCommunityConfiguration
} from '@/hooks/useCommunityConfigurations';
import type { CommunityConfiguration } from '@/hooks/useCommunityConfigurations';
import { supabase } from '@/lib/supabase';

// Configuration Types - now imported from hooks

// Mock data
const mockConfiguration: CommunityConfiguration = {
  id: '1',
  community_id: 'soc-001',
  community_name: 'Green Valley Apartments',
  maintenance_charges: {
    per_sqft_rate: 4.5,
    billing_cycle: 'monthly',
    due_date: 5,
    grace_period: 7,
    late_fee_percentage: 2,
    advance_payment_discount: 5,
  },
  amenity_settings: {
    booking_advance_days: 30,
    max_bookings_per_user: 2,
    cancellation_hours: 24,
    security_deposit_required: true,
    automatic_approval: false,
  },
  visitor_settings: {
    max_visitors_per_day: 10,
    pre_approval_required: true,
    visitor_pass_duration: 8,
    photo_mandatory: true,
    id_verification_required: true,
    visiting_hours: {
      start_time: '09:00',
      end_time: '21:00',
    },
  },
  communication: {
    sms_notifications: true,
    email_notifications: true,
    push_notifications: true,
    whatsapp_integration: false,
    emergency_contacts: ['+91 9876543210', '+91 9876543211'],
  },
  security: {
    two_factor_auth: true,
    session_timeout: 30,
    password_policy: {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_special_chars: true,
    },
    access_control: {
      resident_portal: true,
      guest_wifi: true,
      mobile_app: true,
    },
  },
  financial: {
    late_payment_reminder_days: [3, 7, 15],
    invoice_template: 'standard',
    tax_settings: {
      gst_applicable: true,
      gst_percentage: 18,
      gst_number: '29ABCDE1234F1Z5',
    },
    payment_methods: {
      cash: true,
      bank_transfer: true,
      upi: true,
      card: true,
      cheque: true,
      online: true,
    },
  },
  status: 'active',
  last_updated: '2024-01-15T00:00:00Z',
  updated_by: 'admin',
};

const CommunityConfigurationPage = () => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('e1d40ef7-f1d5-4756-88a2-054fe30cb06a'); // Default to Green Valley Apartments
  const queryClient = useQueryClient();

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
    }
  }, [configuration, reset]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:community_configurations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_configurations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['community_configurations'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
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

  const handleSaveConfiguration = (data: CommunityConfiguration) => {
    const updatedConfig = {
      ...data,
      last_updated: new Date().toISOString(),
      updated_by: 'admin',
    };
    
    setConfiguration(updatedConfig);
    setHasChanges(false);
    setShowSaveModal(false);
    
    // Here you would typically save to the backend
    console.log('Saving configuration:', updatedConfig);
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 6; // Total sections
    
    // Check each section for basic completion
    if (configuration.maintenance_charges.per_sqft_rate > 0) completed++;
    if (configuration.amenity_settings.booking_advance_days > 0) completed++;
    if (configuration.visitor_settings.max_visitors_per_day > 0) completed++;
    if (configuration.communication.emergency_contacts.length > 0) completed++;
    if (configuration.security.password_policy.min_length >= 8) completed++;
    if (Object.values(configuration.financial.payment_methods).some(Boolean)) completed++;
    
    return (completed / total) * 100;
  };

  // Handle loading and error states
  if (isLoading) {
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
            No configuration found for this community. Create a new configuration to get started.
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

      <ComponentContainerCard title="Community Configuration" id="community-config">
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
                        <Form.Label>Rate per Sq.Ft ($) *</Form.Label>
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
                    defaultValue={configuration.communication.emergency_contacts.join('\n')}
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
                      label="GST Applicable"
                      {...register('financial.tax_settings.gst_applicable')}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>GST Percentage</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.1"
                        {...register('financial.tax_settings.gst_percentage')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>GST Number</Form.Label>
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
                      label="UPI"
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
            <Button variant="secondary" className="me-2">
              Reset to Defaults
            </Button>
            <Button 
              variant="primary"
              onClick={() => setShowSaveModal(true)}
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
          <Button variant="primary" onClick={handleSubmit(handleSaveConfiguration)}>
            <IconifyIcon icon="ri:save-line" className="me-1" />
            Save Configuration
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CommunityConfigurationPage;
