'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Tab, Tabs, Badge, Alert, Modal, Table } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useNotificationRulesSettings, { NotificationRulesSettings } from '@/hooks/useNotificationRulesSettings';
import { useSettingsCategory } from '@/hooks/useSettingsCategory';

// Constants for form options
const priorities = [
  { value: 'low', label: 'Low', color: 'secondary' },
  { value: 'medium', label: 'Medium', color: 'info' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'critical', label: 'Critical', color: 'danger' }
];

const triggers = [
  { value: 'complaint.created', label: 'New Complaint Created' },
  { value: 'complaint.updated', label: 'Complaint Updated' },
  { value: 'complaint.resolved', label: 'Complaint Resolved' },
  { value: 'maintenance.created', label: 'New Maintenance Request' },
  { value: 'maintenance.assigned', label: 'Maintenance Assigned' },
  { value: 'maintenance.completed', label: 'Maintenance Completed' },
  { value: 'maintenance.due_soon', label: 'Maintenance Due Soon' },
  { value: 'payment.received', label: 'Payment Received' },
  { value: 'payment.overdue', label: 'Payment Overdue' },
  { value: 'payment.failed', label: 'Payment Failed' },
  { value: 'visitor.arrived', label: 'Visitor Arrived' },
  { value: 'visitor.departed', label: 'Visitor Departed' },
  { value: 'emergency.created', label: 'Emergency Alert Created' },
  { value: 'user.registered', label: 'New User Registered' },
  { value: 'user.login_failed', label: 'Failed Login Attempt' },
  { value: 'amenity.booked', label: 'Amenity Booked' },
  { value: 'service.requested', label: 'Service Requested' },
];

interface NotificationCondition {
  field: string;
  operator: string;
  value: string;
}

interface NotificationAction {
  type: string;
  channel: string;
  recipients: string[];
  template: string;
  delay?: number;
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  throttle?: number;
  cooldown?: number;
  maxExecutions?: number;
  createdAt: string;
  lastTriggered?: string;
  executionCount: number;
}

interface RuleFormData {
  name: string;
  description: string;
  trigger: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  throttle?: number;
  maxExecutions?: number;
}

// Schema for individual rule form
const ruleFormSchema = yup.object({
  name: yup.string().required('Rule name is required'),
  description: yup.string().required('Description is required'),
  trigger: yup.string().required('Trigger is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'critical']).required(),
  isActive: yup.boolean().default(true),
  throttle: yup.number().optional(),
  maxExecutions: yup.number().optional(),
});

// Schema for global notification rules configuration (Supabase)
const notificationRulesSchema = yup.object({
  enable_notification_rules: yup.boolean().required(),
  default_priority: yup.string().required(),
  max_concurrent_rules: yup.number().required(),
  log_rule_executions: yup.boolean().required(),
  enable_rule_throttling: yup.boolean().required(),
  default_throttle_time: yup.number().required(),
});

const defaultRules: NotificationRule[] = [
  {
    id: '1',
    name: 'High Priority Complaint Alert',
    description: 'Immediate notification for high-priority complaints',
    trigger: 'complaint.created',
    conditions: [
      { field: 'priority', operator: 'equals', value: 'high' },
      { field: 'category', operator: 'not_equals', value: 'general' }
    ],
    actions: [
      {
        type: 'notification',
        channel: 'push',
        recipients: ['admin', 'manager'],
        template: 'new_complaint_alert',
        delay: 0
      },
      {
        type: 'email',
        channel: 'email',
        recipients: ['admin@company.com'],
        template: 'new_complaint_email',
        delay: 5
      }
    ],
    priority: 'high',
    isActive: true,
    throttle: 60,
    cooldown: 300,
    maxExecutions: 100,
    createdAt: '2024-01-15T10:00:00Z',
    lastTriggered: '2024-01-29T14:30:00Z',
    executionCount: 25
  },
  {
    id: '2',
    name: 'Maintenance Due Reminder',
    description: 'Weekly reminder for upcoming maintenance requests',
    trigger: 'maintenance.due_soon',
    conditions: [
      { field: 'daysUntilDue', operator: 'less_than', value: '7' },
      { field: 'status', operator: 'equals', value: 'pending' }
    ],
    actions: [
      {
        type: 'notification',
        channel: 'push',
        recipients: ['maintenance_team'],
        template: 'maintenance_reminder',
        delay: 0
      }
    ],
    priority: 'medium',
    isActive: true,
    throttle: 86400,
    executionCount: 12,
    createdAt: '2024-01-10T09:00:00Z',
    lastTriggered: '2024-01-28T09:00:00Z'
  },
  {
    id: '3',
    name: 'Payment Overdue Alert',
    description: 'Alert when payment is overdue by more than 30 days',
    trigger: 'payment.overdue',
    conditions: [
      { field: 'daysPastDue', operator: 'greater_than', value: '30' }
    ],
    actions: [
      {
        type: 'notification',
        channel: 'push',
        recipients: ['finance_team', 'admin'],
        template: 'payment_overdue_alert',
        delay: 0
      },
      {
        type: 'sms',
        channel: 'sms',
        recipients: ['unit_owner'],
        template: 'payment_overdue_sms',
        delay: 60
      }
    ],
    priority: 'critical',
    isActive: false,
    throttle: 172800,
    maxExecutions: 5,
    executionCount: 3,
    createdAt: '2024-01-05T08:00:00Z',
    lastTriggered: '2024-01-25T11:20:00Z'
  }
];

const NotificationRulesPage = () => {
  const {
    notificationRulesSettings,
    isLoadingData,
    isUpdating,
    loadError,
    updateError,
    updateSuccess,
    updateSettings,
  } = useNotificationRulesSettings();

  const {
    data: ruleDefinitions,
    isLoading: isLoadingRuleDefinitions,
    error: ruleDefinitionsError,
    saveSettingsAsync: saveRuleDefinitionsAsync,
  } = useSettingsCategory<{ rules: NotificationRule[] }>({
    queryKey: ['notificationRuleDefinitions'],
    category: 'notification_rules',
    subcategory: 'definitions',
    defaults: { rules: defaultRules },
    descriptions: {
      rules: 'Persisted notification rule definitions used by the notification rules workspace.',
    },
  });

  const [activeTab, setActiveTab] = useState<string>('rules');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentRule, setCurrentRule] = useState<NotificationRule | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [mockRules, setMockRules] = useState<NotificationRule[]>(defaultRules);

  // Form for global settings (Supabase data)
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty }
  } = useForm<NotificationRulesSettings>({
    resolver: yupResolver(notificationRulesSchema),
  });

  // Form for rule modal
  const ruleForm = useForm<RuleFormData>({
    resolver: yupResolver(ruleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger: '',
      priority: 'medium',
      isActive: true,
      throttle: undefined,
      maxExecutions: undefined
    }
  });

  // Reset form when global settings are loaded
  useEffect(() => {
    if (notificationRulesSettings) {
      reset(notificationRulesSettings);
    }
  }, [notificationRulesSettings, reset]);

  useEffect(() => {
    if (ruleDefinitions?.rules) {
      setMockRules(ruleDefinitions.rules);
    }
  }, [ruleDefinitions]);

  // Set initial rule form values when opening the modal
  useEffect(() => {
    if (showRuleModal) {
      if (currentRule) {
        ruleForm.reset({
          name: currentRule.name,
          description: currentRule.description,
          trigger: currentRule.trigger,
          priority: currentRule.priority,
          isActive: currentRule.isActive,
          throttle: currentRule.throttle,
          maxExecutions: currentRule.maxExecutions
        });
      } else {
        ruleForm.reset({
          name: '',
          description: '',
          trigger: '',
          priority: 'medium',
          isActive: true,
          throttle: undefined,
          maxExecutions: undefined
        });
      }
    }
  }, [showRuleModal, currentRule, ruleForm]);

  const rulesEnabled = watch('enable_notification_rules');
  const throttlingEnabled = watch('enable_rule_throttling');

  // Submit handler for global settings (Supabase)
  const onSubmitGlobalSettings = async (data: NotificationRulesSettings) => {
    updateSettings(data);
  };

  const persistRules = async (nextRules: NotificationRule[]) => {
    setRuleError(null);
    await saveRuleDefinitionsAsync({ rules: nextRules });
    setMockRules(nextRules);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  // Rule management functions
  const toggleRuleStatus = async (ruleId: string) => {
    const nextRules = mockRules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    );

    try {
      await persistRules(nextRules);
    } catch (error) {
      setRuleError(error instanceof Error ? error.message : 'Failed to update the notification rule.');
    }
  };

  const editRule = (rule: NotificationRule) => {
    setCurrentRule(rule);
    setShowRuleModal(true);
  };

  const deleteRule = (ruleId: string) => {
    setDeletingRuleId(ruleId);
    setShowDeleteModal(true);
  };

  const confirmDeleteRule = async () => {
    if (deletingRuleId) {
      const nextRules = mockRules.filter(rule => rule.id !== deletingRuleId);
      try {
        await persistRules(nextRules);
      } catch (error) {
        setRuleError(error instanceof Error ? error.message : 'Failed to delete the notification rule.');
      }
    }
    setShowDeleteModal(false);
    setDeletingRuleId(null);
  };

  const addNewRule = () => {
    setCurrentRule(null);
    setShowRuleModal(true);
  };

  const saveRule = async (data: RuleFormData) => {
    const nextRules = currentRule
      ? mockRules.map(rule => (rule.id === currentRule.id ? { ...currentRule, ...data } : rule))
      : [
          ...mockRules,
          {
            id: Date.now().toString(),
            ...data,
            conditions: [],
            actions: [],
            executionCount: 0,
            createdAt: new Date().toISOString(),
          },
        ];

    try {
      await persistRules(nextRules);
      setShowRuleModal(false);
      setCurrentRule(null);
    } catch (error) {
      setRuleError(error instanceof Error ? error.message : 'Failed to save the notification rule.');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return (
      <Badge bg={priorityConfig?.color || 'secondary'}>
        {priorityConfig?.label || priority}
      </Badge>
    );
  };

  const formatLastTriggered = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoadingData || isLoadingRuleDefinitions) {
    return (
      <>
        <PageTitle subName="Notifications" title="Notification Rules" />
        <Alert variant="info">
          <IconifyIcon icon="solar:loading-line-duotone" className="fs-18 me-2" />
          Loading notification rules settings...
        </Alert>
      </>
    );
  }

  if (loadError || ruleDefinitionsError) {
    return (
      <>
        <PageTitle subName="Notifications" title="Notification Rules" />
        <Alert variant="danger">
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error loading notification rules settings: {(loadError || ruleDefinitionsError)?.message}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageTitle 
        title="Notification Rules" 
        subName="Configure automated notification triggers and actions"
      />

      {updateSuccess && (
        <Alert variant="success" dismissible>
          <IconifyIcon icon="solar:check-circle-line-duotone" className="fs-18 me-2" />
          Notification rules settings updated successfully!
        </Alert>
      )}

      {updateError && (
        <Alert variant="danger" dismissible>
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          Error updating notification rules settings: {updateError.message}
        </Alert>
      )}

      {showSuccess && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="ri:check-line" className="me-2" />
          Notification rules saved successfully!
        </Alert>
      )}

      {ruleError && (
        <Alert variant="danger" dismissible onClose={() => setRuleError(null)}>
          <IconifyIcon icon="solar:danger-triangle-line-duotone" className="fs-18 me-2" />
          {ruleError}
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="notification-rules-config" title="Notification Rules Configuration">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'rules')}
              className="mb-4"
            >
              <Tab eventKey="rules" title="Rules">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5>Notification Rules</h5>
                    <p className="text-muted mb-0">
                      Configure automated notification triggers based on system events
                    </p>
                  </div>
                  <Button variant="primary" onClick={addNewRule}>
                    <IconifyIcon icon="ri:add-line" className="me-2" />
                    Add Rule
                  </Button>
                </div>

                <Card>
                  <div className="table-responsive">
                    <Table className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Rule Name</th>
                          <th>Trigger</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Executions</th>
                          <th>Last Triggered</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockRules.map((rule) => (
                          <tr key={rule.id}>
                            <td>
                              <div>
                                <strong>{rule.name}</strong>
                                <br />
                                <small className="text-muted">{rule.description}</small>
                              </div>
                            </td>
                            <td>
                              <Badge bg="light" text="dark">
                                {triggers.find(t => t.value === rule.trigger)?.label || rule.trigger}
                              </Badge>
                            </td>
                            <td>{getPriorityBadge(rule.priority)}</td>
                            <td>
                              <Button
                                variant="link"
                                className="p-0 text-decoration-none"
                                onClick={() => toggleRuleStatus(rule.id)}
                              >
                                {rule.isActive ? (
                                  <div className="d-flex align-items-center text-success">
                                    <IconifyIcon icon="ri:toggle-line" className="me-1" />
                                    Active
                                  </div>
                                ) : (
                                  <div className="d-flex align-items-center text-muted">
                                    <IconifyIcon icon="ri:toggle-line" className="me-1" />
                                    Inactive
                                  </div>
                                )}
                              </Button>
                            </td>
                            <td>
                              <Badge bg="info">{rule.executionCount}</Badge>
                              {rule.maxExecutions && (
                                <small className="text-muted d-block">
                                  Max: {rule.maxExecutions}
                                </small>
                              )}
                            </td>
                            <td>{formatLastTriggered(rule.lastTriggered)}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => editRule(rule)}
                                >
                                  <IconifyIcon icon="ri:edit-line" />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => deleteRule(rule.id)}
                                >
                                  <IconifyIcon icon="ri:delete-bin-line" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {mockRules.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-4">
                              <p className="mb-0 text-muted">No rules defined yet. Click &quot;Add Rule&quot; to create one.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              </Tab>

              <Tab eventKey="global" title="Global Settings">
                <form onSubmit={handleSubmit(onSubmitGlobalSettings)}>
                  <Row>
                    <Col lg={6}>
                      <Card className="mb-4">
                        <Card.Header className="d-flex align-items-center">
                          <IconifyIcon icon="ri:settings-line" className="me-2" />
                          <h6 className="mb-0">Global Configuration</h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="mb-3">
                            <Controller
                              name="enable_notification_rules"
                              control={control}
                              render={({ field }) => (
                                <Form.Check
                                  type="switch"
                                  id="enable_notification_rules"
                                  label="Enable Notification Rules System"
                                  checked={Boolean(field.value)}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                />
                              )}
                            />
                          </div>

                          {rulesEnabled && (
                            <>
                              <div className="mb-3">
                                <label htmlFor="default_priority" className="form-label">Default Priority</label>
                                <Controller
                                  name="default_priority"
                                  control={control}
                                  render={({ field }) => (
                                    <Form.Select
                                      {...field}
                                      id="default_priority"
                                      className={errors.default_priority ? 'is-invalid' : ''}
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                      <option value="critical">Critical</option>
                                    </Form.Select>
                                  )}
                                />
                                {errors.default_priority && (
                                  <div className="invalid-feedback">{errors.default_priority.message}</div>
                                )}
                              </div>

                              <TextFormInput
                                name="max_concurrent_rules"
                                label="Maximum Concurrent Rules"
                                type="number"
                                placeholder="50"
                                control={control}
                                containerClassName="mb-3"
                              />

                              <div className="mb-3">
                                <Controller
                                  name="log_rule_executions"
                                  control={control}
                                  render={({ field }) => (
                                    <Form.Check
                                      type="switch"
                                      id="log_rule_executions"
                                      label="Log Rule Executions"
                                      checked={Boolean(field.value)}
                                      onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                  )}
                                />
                              </div>
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={6}>
                      <Card className="mb-4">
                        <Card.Header className="d-flex align-items-center">
                          <IconifyIcon icon="ri:time-line" className="me-2" />
                          <h6 className="mb-0">Throttling & Limits</h6>
                        </Card.Header>
                        <Card.Body>
                          {rulesEnabled && (
                            <>
                              <div className="mb-3">
                                <Controller
                                  name="enable_rule_throttling"
                                  control={control}
                                  render={({ field }) => (
                                    <Form.Check
                                      type="switch"
                                      id="enable_rule_throttling"
                                      label="Enable Rule Throttling"
                                      checked={Boolean(field.value)}
                                      onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                  )}
                                />
                              </div>

                              {throttlingEnabled && (
                                <TextFormInput
                                  name="default_throttle_time"
                                  label="Default Throttle Time (seconds)"
                                  type="number"
                                  placeholder="300"
                                  control={control}
                                  containerClassName="mb-3"
                                />
                              )}
                            </>
                          )}

                          <Alert variant="info">
                            <IconifyIcon icon="ri:information-line" className="me-2" />
                            Throttling prevents rules from executing too frequently. 
                            A rule will not execute again until the throttle time has passed.
                          </Alert>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Statistics */}
                    <Col xs={12}>
                      <Card className="mb-4">
                        <Card.Header className="d-flex align-items-center">
                          <IconifyIcon icon="ri:flashlight-line" className="me-2" />
                          <h6 className="mb-0">Rule Statistics</h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={3}>
                              <div className="text-center">
                                <h4 className="text-primary">{mockRules.length}</h4>
                                <small className="text-muted">Total Rules</small>
                              </div>
                            </Col>
                            <Col md={3}>
                              <div className="text-center">
                                <h4 className="text-success">
                                  {mockRules.filter(r => r.isActive).length}
                                </h4>
                                <small className="text-muted">Active Rules</small>
                              </div>
                            </Col>
                            <Col md={3}>
                              <div className="text-center">
                                <h4 className="text-warning">
                                  {mockRules.reduce((sum, r) => sum + r.executionCount, 0)}
                                </h4>
                                <small className="text-muted">Total Executions</small>
                              </div>
                            </Col>
                            <Col md={3}>
                              <div className="text-center">
                                <h4 className="text-info">
                                  {mockRules.filter(r => r.priority === 'critical').length}
                                </h4>
                                <small className="text-muted">Critical Rules</small>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Submit Button for Global Settings */}
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="outline-secondary" 
                      type="button" 
                      onClick={() => reset()}
                      disabled={!isDirty || isUpdating}
                      className="me-2"
                    >
                      <IconifyIcon icon="solar:refresh-line-duotone" className="me-1" />
                      Reset
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={!isDirty || isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <IconifyIcon icon="solar:diskette-line-duotone" className="me-1" />
                          Save Global Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Rule Edit/Create Modal */}
      <Modal show={showRuleModal} onHide={() => setShowRuleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentRule ? 'Edit Notification Rule' : 'Create Notification Rule'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Controller
                  name="name"
                  control={ruleForm.control}
                  render={({ field }) => (
                    <TextFormInput
                      control={ruleForm.control}
                      label="Rule Name"
                      containerClassName="mb-3"
                      {...field}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="priority"
                  control={ruleForm.control}
                  render={({ field }) => (
                    <SelectFormInput
                      control={ruleForm.control}
                      label="Priority"
                      containerClassName="mb-3"
                      options={priorities.map(p => ({ value: p.value, label: p.label }))}
                      {...field}
                    />
                  )}
                />
              </Col>
              <Col xs={12}>
                <Controller
                  name="description"
                  control={ruleForm.control}
                  render={({ field }) => (
                    <TextAreaFormInput
                      control={ruleForm.control}
                      label="Description"
                      rows={2}
                      containerClassName="mb-3"
                      {...field}
                    />
                  )}
                />
              </Col>
              <Col xs={12}>
                <Controller
                  name="trigger"
                  control={ruleForm.control}
                  render={({ field }) => (
                    <SelectFormInput
                      control={ruleForm.control}
                      label="Trigger Event"
                      containerClassName="mb-3"
                      options={[{ value: '', label: 'Select trigger...' }, ...triggers.map(t => ({ value: t.value, label: t.label }))]}
                      {...field}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="throttle"
                  control={ruleForm.control}
                  render={({ field }) => (
                    <TextFormInput
                      control={ruleForm.control}
                      label="Throttle Time (seconds)"
                      type="number"
                      containerClassName="mb-3"
                      {...field}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="maxExecutions"
                  control={ruleForm.control}
                  render={({ field }) => (
                    <TextFormInput
                      control={ruleForm.control}
                      label="Max Executions"
                      type="number"
                      containerClassName="mb-3"
                      {...field}
                    />
                  )}
                />
              </Col>
              <Col xs={12}>
                <Controller
                  name="isActive"
                  control={ruleForm.control}
                  render={({ field: { value, onChange } }) => (
                    <div className="mb-3">
                      <Form.Check
                        type="switch"
                        id="ruleIsActive"
                        label="Rule is Active"
                        checked={value}
                        onChange={e => onChange(e.target.checked)}
                      />
                    </div>
                  )}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRuleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={ruleForm.handleSubmit(saveRule)}>
            {currentRule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center">
            <IconifyIcon icon="ri:alert-line" className="text-warning me-2" style={{ fontSize: '24px' }} />
            <div>
              Are you sure you want to delete this notification rule? 
              This action cannot be undone.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteRule}>
            Delete Rule
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NotificationRulesPage;
