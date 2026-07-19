"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddComplianceRuleModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (ruleData: any) => void;
  editRule?: any;
}

const AddComplianceRuleModal: React.FC<AddComplianceRuleModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editRule
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [ruleData, setRuleData] = useState({
    name: editRule?.name || '',
    description: editRule?.description || '',
    rule_type: editRule?.rule_type || 'transaction_limit',
    risk_level: editRule?.risk_level || 'medium',
    status: editRule?.status || 'active',
    threshold_amount: editRule?.threshold_amount || '',
    threshold_count: editRule?.threshold_count || '',
    threshold_period: editRule?.threshold_period || 'day',
    countries: editRule?.countries || '',
    action: editRule?.action || 'flag',
    notification_emails: editRule?.notification_emails || '',
    conditions: editRule?.conditions ? JSON.stringify(editRule.conditions, null, 2) : JSON.stringify({
      operator: "AND",
      conditions: [
        {
          field: "amount",
          operator: "greater_than",
          value: 1000
        },
        {
          field: "country",
          operator: "in",
          value: ["Nigeria", "Ghana"]
        }
      ]
    }, null, 2)
  });

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editRule) {
        setRuleData({
          name: editRule.name || '',
          description: editRule.description || '',
          rule_type: editRule.rule_type || 'transaction_limit',
          risk_level: editRule.risk_level || 'medium',
          status: editRule.status || 'active',
          threshold_amount: editRule.threshold_amount || '',
          threshold_count: editRule.threshold_count || '',
          threshold_period: editRule.threshold_period || 'day',
          countries: editRule.countries || '',
          action: editRule.action || 'flag',
          notification_emails: editRule.notification_emails || '',
          conditions: editRule.conditions ? JSON.stringify(editRule.conditions, null, 2) : JSON.stringify({
            operator: "AND",
            conditions: [
              {
                field: "amount",
                operator: "greater_than",
                value: 1000
              },
              {
                field: "country",
                operator: "in",
                value: ["Nigeria", "Ghana"]
              }
            ]
          }, null, 2)
        });
      } else {
        setRuleData({
          name: '',
          description: '',
          rule_type: 'transaction_limit',
          risk_level: 'medium',
          status: 'active',
          threshold_amount: '',
          threshold_count: '',
          threshold_period: 'day',
          countries: '',
          action: 'flag',
          notification_emails: '',
          conditions: JSON.stringify({
            operator: "AND",
            conditions: [
              {
                field: "amount",
                operator: "greater_than",
                value: 1000
              },
              {
                field: "country",
                operator: "in",
                value: ["Nigeria", "Ghana"]
              }
            ]
          }, null, 2)
        });
      }
    }
  }, [show, editRule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRuleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRuleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRuleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse JSON fields
      let parsedConditions;
      
      try {
        parsedConditions = JSON.parse(ruleData.conditions);
      } catch (error) {
        alert('Invalid JSON format in Conditions');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...ruleData,
        threshold_amount: ruleData.threshold_amount ? parseFloat(ruleData.threshold_amount as unknown as string) : null,
        threshold_count: ruleData.threshold_count ? parseInt(ruleData.threshold_count as unknown as string, 10) : null,
        countries: ruleData.countries ? ruleData.countries.split(',').map((country: string) => country.trim()) : [],
        notification_emails: ruleData.notification_emails ? ruleData.notification_emails.split(',').map((email: string) => email.trim()) : [],
        conditions: parsedConditions
      };
      
      // Call onSave function passed from parent
      onSave(dataToSave);
      
      // Close modal
      onHide();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get appropriate badge color based on risk level
  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editRule ? `Edit Compliance Rule: ${editRule.name}` : 'Add Compliance Rule'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="ruleName">
                <Form.Label>Rule Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={ruleData.name}
                  onChange={handleChange}
                  placeholder="Enter rule name"
                />
                <Form.Control.Feedback type="invalid">
                  Rule name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="ruleType">
                <Form.Label>Rule Type <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  required
                  name="rule_type"
                  value={ruleData.rule_type}
                  onChange={handleSelectChange}
                >
                  <option value="transaction_limit">Transaction Limit</option>
                  <option value="velocity_check">Velocity Check</option>
                  <option value="country_restriction">Country Restriction</option>
                  <option value="suspicious_pattern">Suspicious Pattern</option>
                  <option value="kyc_verification">KYC Verification</option>
                  <option value="custom">Custom Rule</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="ruleDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={ruleData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Enter rule description"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="ruleStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={ruleData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="testing">Testing</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="riskLevel">
                <Form.Label>Risk Level</Form.Label>
                <InputGroup>
                  <Form.Select
                    name="risk_level"
                    value={ruleData.risk_level}
                    onChange={handleSelectChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                  <InputGroup.Text>
                    <Badge bg={getRiskBadgeVariant(ruleData.risk_level)}>
                      {ruleData.risk_level.toUpperCase()}
                    </Badge>
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="thresholdAmount">
                <Form.Label>Threshold Amount</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="threshold_amount"
                    value={ruleData.threshold_amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    disabled={!['transaction_limit', 'velocity_check'].includes(ruleData.rule_type)}
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Threshold amount that triggers this rule
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="thresholdCount">
                <Form.Label>Threshold Count</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="threshold_count"
                  value={ruleData.threshold_count}
                  onChange={handleChange}
                  placeholder="Enter count"
                  disabled={ruleData.rule_type !== 'velocity_check'}
                />
                <Form.Text className="text-muted">
                  Number of transactions that trigger this rule
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="thresholdPeriod">
                <Form.Label>Time Period</Form.Label>
                <Form.Select
                  name="threshold_period"
                  value={ruleData.threshold_period}
                  onChange={handleSelectChange}
                  disabled={ruleData.rule_type !== 'velocity_check'}
                >
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Time period for threshold count
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="countries">
                <Form.Label>Countries</Form.Label>
                <Form.Control
                  type="text"
                  name="countries"
                  value={ruleData.countries}
                  onChange={handleChange}
                  placeholder="e.g. Nigeria, Ghana, Kenya"
                  disabled={ruleData.rule_type !== 'country_restriction'}
                />
                <Form.Text className="text-muted">
                  Comma-separated list of countries for restriction
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="action">
                <Form.Label>Action <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  required
                  name="action"
                  value={ruleData.action}
                  onChange={handleSelectChange}
                >
                  <option value="flag">Flag for Review</option>
                  <option value="block">Block Transaction</option>
                  <option value="notify">Notify Only</option>
                  <option value="require_approval">Require Approval</option>
                  <option value="limit_amount">Limit Amount</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Action to take when rule conditions are met
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="notificationEmails">
                <Form.Label>Notification Emails</Form.Label>
                <Form.Control
                  type="text"
                  name="notification_emails"
                  value={ruleData.notification_emails}
                  onChange={handleChange}
                  placeholder="e.g. compliance@example.com, alerts@example.com"
                />
                <Form.Text className="text-muted">
                  Comma-separated list of email addresses to notify when rule is triggered
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="conditions">
                <Form.Label>Rule Conditions (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  name="conditions"
                  value={ruleData.conditions}
                  onChange={handleTextAreaChange}
                  placeholder="Enter rule conditions in JSON format"
                />
                <Form.Text className="text-muted">
                  Define the conditions that trigger this rule in JSON format
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="alert alert-info">
            <h5 className="alert-heading">Rule Conditions Example</h5>
            <p className="mb-0">Define complex rule conditions using logical operators and field comparisons:</p>
            <hr />
            <pre className="mb-0" style={{ fontSize: '0.8rem' }}>
{`{
  "operator": "AND",           // Logical operator: AND, OR
  "conditions": [
    {
      "field": "amount",       // Field to check
      "operator": "greater_than",  // Comparison operator
      "value": 1000            // Threshold value
    },
    {
      "field": "country",
      "operator": "in",
      "value": ["Nigeria", "Ghana"]
    },
    {
      "operator": "OR",        // Nested condition group
      "conditions": [
        {
          "field": "user_risk_score",
          "operator": "greater_than",
          "value": 70
        },
        {
          "field": "is_new_recipient",
          "operator": "equals",
          "value": true
        }
      ]
    }
  ]
}`}
            </pre>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:save-line" className="me-1" />
                {editRule ? 'Update Rule' : 'Save Rule'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddComplianceRuleModal;
