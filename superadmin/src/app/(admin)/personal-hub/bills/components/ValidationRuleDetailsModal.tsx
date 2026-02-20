"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, Form, Alert, ProgressBar } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  biller_id: string;
  biller_name?: string;
  field_name: string;
  validation_type: 'regex' | 'length' | 'numeric_range' | 'date_range' | 'custom';
  regex_pattern?: string;
  min_value?: number;
  max_value?: number;
  error_message: string;
  is_required: boolean;
  status: 'active' | 'inactive' | 'testing';
  validation_options?: any;
  created_at?: string;
  updated_at?: string;
}

interface ValidationRuleDetailsModalProps {
  show: boolean;
  onHide: () => void;
  rule: ValidationRule | null;
  onEdit?: (rule: ValidationRule) => void;
  onTest?: (rule: ValidationRule) => void;
  onStatusChange?: (rule: ValidationRule, newStatus: string) => void;
}

const ValidationRuleDetailsModal: React.FC<ValidationRuleDetailsModalProps> = ({ 
  show, 
  onHide, 
  rule,
  onEdit,
  onTest,
  onStatusChange
}) => {
  const [testValue, setTestValue] = useState<string>('');
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isTestingRule, setIsTestingRule] = useState(false);

  if (!rule) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: ValidationRule['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'testing':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Get validation type badge variant
  const getValidationTypeBadgeVariant = (type: ValidationRule['validation_type']) => {
    switch (type) {
      case 'regex':
        return 'primary';
      case 'length':
        return 'info';
      case 'numeric_range':
        return 'success';
      case 'date_range':
        return 'warning';
      case 'custom':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the rule
  const extendedRule = {
    ...rule,
    createdDate: rule.created_at || '15 Mar 2023',
    updatedDate: rule.updated_at || '20 Sep 2023',
    totalValidations: 1247,
    successfulValidations: 1198,
    failedValidations: 49,
    successRate: 96.1,
    averageResponseTime: '12ms',
    recentActivity: [
      { date: '24 Sep 2023', time: '14:32', action: 'Validation Success', value: '01234567890', result: 'Passed' },
      { date: '24 Sep 2023', time: '14:28', action: 'Validation Failed', value: '123456', result: 'Too Short' },
      { date: '24 Sep 2023', time: '14:25', action: 'Validation Success', value: '09876543210', result: 'Passed' },
      { date: '24 Sep 2023', time: '14:20', action: 'Validation Failed', value: 'ABC123DEF45', result: 'Invalid Format' },
      { date: '24 Sep 2023', time: '14:15', action: 'Validation Success', value: '05555123456', result: 'Passed' }
    ],
    performanceMetrics: [
      { period: 'Last 24h', validations: 67, success_rate: 94.0, avg_time: '11ms' },
      { period: 'Last 7d', validations: 423, success_rate: 95.8, avg_time: '12ms' },
      { period: 'Last 30d', validations: 1247, success_rate: 96.1, avg_time: '12ms' }
    ],
    commonFailures: [
      { reason: 'Invalid Format', count: 28, percentage: 57.1 },
      { reason: 'Too Short', count: 12, percentage: 24.5 },
      { reason: 'Too Long', count: 6, percentage: 12.2 },
      { reason: 'Contains Invalid Characters', count: 3, percentage: 6.1 }
    ]
  };

  // Handle test validation
  const handleTestValidation = async () => {
    if (!testValue.trim()) return;

    setIsTestingRule(true);
    
    try {
      // Simulate validation test
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let valid = false;
      let message = '';

      switch (rule.validation_type) {
        case 'regex':
          if (rule.regex_pattern) {
            const regex = new RegExp(rule.regex_pattern);
            valid = regex.test(testValue);
            message = valid ? 'Value matches the regex pattern' : 'Value does not match the regex pattern';
          }
          break;
        case 'length':
          const length = testValue.length;
          valid = (!rule.min_value || length >= rule.min_value) && (!rule.max_value || length <= rule.max_value);
          message = valid 
            ? `Length (${length}) is within allowed range` 
            : `Length (${length}) is outside allowed range (${rule.min_value}-${rule.max_value})`;
          break;
        case 'numeric_range':
          const numValue = parseFloat(testValue);
          if (isNaN(numValue)) {
            valid = false;
            message = 'Value is not a valid number';
          } else {
            valid = (!rule.min_value || numValue >= rule.min_value) && (!rule.max_value || numValue <= rule.max_value);
            message = valid 
              ? `Value (${numValue}) is within allowed range` 
              : `Value (${numValue}) is outside allowed range (${rule.min_value}-${rule.max_value})`;
          }
          break;
        default:
          valid = testValue.length > 0;
          message = valid ? 'Basic validation passed' : 'Value is empty';
      }

      setTestResult({ valid, message });
    } catch (error) {
      setTestResult({ valid: false, message: 'Error occurred during validation test' });
    } finally {
      setIsTestingRule(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 me-2">
            <IconifyIcon icon="ri:shield-check-line" className="text-primary" />
          </div>
          Validation Rule Details - {rule.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Rule Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(rule.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={rule.status === 'active' ? 'ri:check-line' : 
                      rule.status === 'testing' ? 'ri:test-tube-line' : 
                      'ri:pause-line'} 
                className="me-1" 
              />
              {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
            </Badge>
            <Badge bg={getValidationTypeBadgeVariant(rule.validation_type)} className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:code-line" className="me-1" />
              {rule.validation_type.replace('_', ' ').charAt(0).toUpperCase() + rule.validation_type.replace('_', ' ').slice(1)}
            </Badge>
            <Badge bg={rule.is_required ? 'danger' : 'secondary'} className="px-3 py-2">
              <IconifyIcon icon={rule.is_required ? 'ri:asterisk' : 'ri:question-line'} className="me-1" />
              {rule.is_required ? 'Required' : 'Optional'}
            </Badge>
          </div>
          <h4 className="mb-1">{extendedRule.successRate}% Success Rate</h4>
          <p className="text-muted mb-0">{extendedRule.totalValidations.toLocaleString()} total validations • {extendedRule.averageResponseTime} avg response</p>
        </div>

        <Row>
          {/* Rule Information */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Rule Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Rule ID:</td>
                      <td>{rule.id}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Name:</td>
                      <td>{rule.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Description:</td>
                      <td>{rule.description}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Field Name:</td>
                      <td><code>{rule.field_name}</code></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Biller:</td>
                      <td>{rule.biller_name || rule.biller_id}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Created:</td>
                      <td>{extendedRule.createdDate}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Last Updated:</td>
                      <td>{extendedRule.updatedDate}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Validation Configuration */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Validation Configuration</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Validation Type:</td>
                      <td>
                        <Badge bg={getValidationTypeBadgeVariant(rule.validation_type)}>
                          {rule.validation_type.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                    {rule.regex_pattern && (
                      <tr>
                        <td className="fw-semibold">Pattern:</td>
                        <td><code className="text-primary">{rule.regex_pattern}</code></td>
                      </tr>
                    )}
                    {rule.min_value !== undefined && (
                      <tr>
                        <td className="fw-semibold">Min Value:</td>
                        <td>{rule.min_value}</td>
                      </tr>
                    )}
                    {rule.max_value !== undefined && (
                      <tr>
                        <td className="fw-semibold">Max Value:</td>
                        <td>{rule.max_value}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="fw-semibold">Error Message:</td>
                      <td className="text-danger">{rule.error_message}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Required:</td>
                      <td>
                        <Badge bg={rule.is_required ? 'danger' : 'secondary'}>
                          {rule.is_required ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Performance & Testing */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Performance Metrics</h6>
              </Card.Header>
              <Card.Body>
                <Row className="text-center mb-3">
                  <Col xs={4} className="border-end">
                    <h5 className="text-primary mb-1">{extendedRule.totalValidations}</h5>
                    <p className="text-muted mb-0">Total</p>
                  </Col>
                  <Col xs={4} className="border-end">
                    <h5 className="text-success mb-1">{extendedRule.successfulValidations}</h5>
                    <p className="text-muted mb-0">Success</p>
                  </Col>
                  <Col xs={4}>
                    <h5 className="text-danger mb-1">{extendedRule.failedValidations}</h5>
                    <p className="text-muted mb-0">Failed</p>
                  </Col>
                </Row>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Success Rate:</span>
                    <span>{extendedRule.successRate}%</span>
                  </div>
                  <ProgressBar 
                    now={extendedRule.successRate} 
                    variant={extendedRule.successRate > 95 ? 'success' : extendedRule.successRate > 90 ? 'warning' : 'danger'}
                  />
                </div>

                <Table className="table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Count</th>
                      <th>Success Rate</th>
                      <th>Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extendedRule.performanceMetrics.map((metric, index) => (
                      <tr key={index}>
                        <td>{metric.period}</td>
                        <td>{metric.validations}</td>
                        <td>{metric.success_rate}%</td>
                        <td>{metric.avg_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Test Validation */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Test Validation Rule</h6>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Test Value</Form.Label>
                    <Form.Control
                      type="text"
                      value={testValue}
                      onChange={(e) => setTestValue(e.target.value)}
                      placeholder={`Enter a value to test against this rule...`}
                    />
                    <Form.Text className="text-muted">
                      Enter a sample value to test how this validation rule would behave
                    </Form.Text>
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    onClick={handleTestValidation}
                    disabled={!testValue.trim() || isTestingRule}
                    className="mb-3"
                  >
                    {isTestingRule ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="ri:test-tube-line" className="me-1" />
                        Test Rule
                      </>
                    )}
                  </Button>
                  
                  {testResult && (
                    <Alert variant={testResult.valid ? 'success' : 'danger'}>
                      <div className="d-flex">
                        <IconifyIcon 
                          icon={testResult.valid ? 'ri:check-line' : 'ri:close-line'} 
                          className="me-2 mt-1" 
                        />
                        <div>
                          <strong>{testResult.valid ? 'Validation Passed' : 'Validation Failed'}</strong>
                          <br />
                          {testResult.message}
                        </div>
                      </div>
                    </Alert>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Common Failures */}
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Common Failure Reasons</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table className="table-sm mb-0">
                <thead>
                  <tr>
                    <th>Reason</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {extendedRule.commonFailures.map((failure, index) => (
                    <tr key={index}>
                      <td>{failure.reason}</td>
                      <td>{failure.count}</td>
                      <td>{failure.percentage}%</td>
                      <td>
                        <ProgressBar 
                          now={failure.percentage} 
                          variant="danger" 
                          style={{ height: '4px' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Recent Activity */}
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Recent Validation Activity</h6>
            <Button variant="outline-primary" size="sm">
              View All Logs
            </Button>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table className="table-sm mb-0">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Action</th>
                    <th>Test Value</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {extendedRule.recentActivity.map((activity, index) => (
                    <tr key={index}>
                      <td>
                        <div>{activity.date}</div>
                        <small className="text-muted">{activity.time}</small>
                      </td>
                      <td>
                        <Badge bg={activity.action.includes('Success') ? 'success' : 'danger'}>
                          {activity.action}
                        </Badge>
                      </td>
                      <td><code>{activity.value}</code></td>
                      <td>{activity.result}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary">
          <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
          View Analytics
        </Button>
        <Button variant="outline-info" onClick={() => onTest && onTest(rule)}>
          <IconifyIcon icon="ri:test-tube-line" className="me-1" />
          Advanced Testing
        </Button>
        <Button 
          variant={rule.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(rule, rule.status === 'active' ? 'inactive' : 'active')}
        >
          <IconifyIcon 
            icon={rule.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {rule.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(rule)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Rule
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ValidationRuleDetailsModal;
