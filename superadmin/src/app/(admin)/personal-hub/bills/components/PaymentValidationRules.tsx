"use client";

import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Badge, 
  Button, 
  Form, 
  Row, 
  Col, 
  Modal,
  Dropdown,
  InputGroup
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import AddValidationRuleModal from './AddValidationRuleModal';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  biller_id?: string;
  biller_name?: string;
  rule_type: 'account_format' | 'amount_limit' | 'verification' | 'custom';
  rule_config: {
    regex?: string;
    min_amount?: number;
    max_amount?: number;
    verification_endpoint?: string;
    custom_script?: string;
  };
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string;
}

const PaymentValidationRules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [currentRule, setCurrentRule] = useState<ValidationRule | null>(null);
  const [ruleType, setRuleType] = useState<string>('account_format');
  
  // Sample data - would be fetched from API in production
  const validationRules: ValidationRule[] = [
    {
      id: 'VR-001',
      name: 'ECG Account Format',
      description: 'Validates the format of ECG account numbers',
      biller_id: 'BIL-001',
      biller_name: 'Electricity Company of Ghana',
      rule_type: 'account_format',
      rule_config: {
        regex: '^[0-9]{11}$',
      },
      status: 'active',
      created_at: '15 Aug 2023',
      updated_at: '15 Aug 2023',
      created_by: 'Admin',
    },
    {
      id: 'VR-002',
      name: 'Ghana Water Account Format',
      description: 'Validates the format of Ghana Water account numbers',
      biller_id: 'BIL-002',
      biller_name: 'Ghana Water Company',
      rule_type: 'account_format',
      rule_config: {
        regex: '^[A-Z0-9]{10}$',
      },
      status: 'active',
      created_at: '15 Aug 2023',
      updated_at: '15 Aug 2023',
      created_by: 'Admin',
    },
    {
      id: 'VR-003',
      name: 'MTN Payment Limits',
      description: 'Sets min and max payment amounts for MTN',
      biller_id: 'BIL-003',
      biller_name: 'MTN Ghana',
      rule_type: 'amount_limit',
      rule_config: {
        min_amount: 1,
        max_amount: 1000,
      },
      status: 'active',
      created_at: '16 Aug 2023',
      updated_at: '16 Aug 2023',
      created_by: 'Admin',
    },
    {
      id: 'VR-004',
      name: 'DSTV Account Verification',
      description: 'Verifies DSTV account before payment',
      biller_id: 'BIL-005',
      biller_name: 'DSTV',
      rule_type: 'verification',
      rule_config: {
        verification_endpoint: 'https://api.dstv.com/verify',
      },
      status: 'active',
      created_at: '17 Aug 2023',
      updated_at: '17 Aug 2023',
      created_by: 'Admin',
    },
    {
      id: 'VR-005',
      name: 'University of Ghana Payment Validation',
      description: 'Custom validation for UG payments',
      biller_id: 'BIL-007',
      biller_name: 'University of Ghana',
      rule_type: 'custom',
      rule_config: {
        custom_script: 'function validateUG(account, amount) { /* validation logic */ return true; }',
      },
      status: 'inactive',
      created_at: '18 Aug 2023',
      updated_at: '20 Aug 2023',
      created_by: 'Admin',
    },
    {
      id: 'VR-006',
      name: 'Global Amount Limit',
      description: 'Default amount limits for all billers',
      rule_type: 'amount_limit',
      rule_config: {
        min_amount: 1,
        max_amount: 10000,
      },
      status: 'active',
      created_at: '10 Aug 2023',
      updated_at: '10 Aug 2023',
      created_by: 'Admin',
    },
  ];
  
  // Filter rules based on search term, type, and status
  const filteredRules = validationRules.filter((rule) => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.biller_name && rule.biller_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesType = filterType === 'all' || rule.rule_type === filterType;
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Get rule type badge variant
  const getRuleTypeBadgeVariant = (type: ValidationRule['rule_type']) => {
    switch (type) {
      case 'account_format':
        return 'primary';
      case 'amount_limit':
        return 'success';
      case 'verification':
        return 'info';
      case 'custom':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: ValidationRule['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  // Handle rule edit
  const handleEditRule = (rule: ValidationRule) => {
    setCurrentRule(rule);
    setRuleType(rule.rule_type);
    
    // Convert to format expected by AddValidationRuleModal
    const convertedRule = {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      biller_id: rule.biller_id || '',
      field_name: rule.rule_type === 'account_format' ? 'account_number' : 'amount',
      validation_type: rule.rule_type === 'account_format' ? 'regex' : 
                       rule.rule_type === 'amount_limit' ? 'range' : 
                       rule.rule_type === 'verification' ? 'custom' : 'custom',
      regex_pattern: rule.rule_config.regex || '',
      min_value: rule.rule_config.min_amount || '',
      max_value: rule.rule_config.max_amount || '',
      error_message: 'Please enter a valid value',
      is_required: true,
      status: rule.status,
      validation_options: JSON.stringify({
        allowed_values: [],
        format: "",
        custom_validation: rule.rule_config.custom_script || rule.rule_config.verification_endpoint || ""
      }, null, 2)
    };
    
    setEditRule(convertedRule);
    setShowAddRuleModal(true);
  };
  
  // Handle add new rule
  const handleAddRule = () => {
    setCurrentRule(null);
    setRuleType('account_format');
    setEditRule(null);
    setShowAddRuleModal(true);
  };
  
  // Handle save rule
  const handleSaveRule = (ruleData: any) => {
    console.log('Saving validation rule:', ruleData);
    
    // For now, just show a success message
    alert(editRule 
      ? `Rule ${ruleData.name} updated successfully!` 
      : `Rule ${ruleData.name} added successfully!`
    );
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex align-items-center">
          <Card.Title className="mb-0">Payment Validation Rules</Card.Title>
          <Button variant="primary" size="sm" className="ms-auto" onClick={handleAddRule}>
            <IconifyIcon icon="ri:add-line" className="me-1" />
            Add Rule
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="alert alert-info">
            <IconifyIcon icon="ri:information-line" className="me-1" />
            Validation rules ensure that bill payments are properly formatted and valid before processing.
          </div>
          
          {/* Filters */}
          <div className="d-flex flex-wrap align-items-center mb-3">
            <div className="me-3 mb-2">
              <InputGroup>
                <Form.Control
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="secondary">
                  <IconifyIcon icon="ri:search-line" />
                </Button>
              </InputGroup>
            </div>
            <div className="me-3 mb-2">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  Rule Type: {filterType === 'all' ? 'All' : filterType.replace('_', ' ').charAt(0).toUpperCase() + filterType.replace('_', ' ').slice(1)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilterType('all')}>All</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterType('account_format')}>Account Format</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterType('amount_limit')}>Amount Limit</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterType('verification')}>Verification</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterType('custom')}>Custom</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="me-3 mb-2">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  Status: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilterStatus('all')}>All</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterStatus('active')}>Active</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterStatus('inactive')}>Inactive</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          
          {/* Rules Table */}
          <div className="table-responsive">
            <Table className="table-centered table-hover mb-0">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Name</th>
                  <th>Biller</th>
                  <th>Type</th>
                  <th>Configuration</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.id}</td>
                    <td>
                      <div className="d-flex flex-column">
                        <h5 className="font-14 mb-0">{rule.name}</h5>
                        <span className="text-muted font-13">{rule.description}</span>
                      </div>
                    </td>
                    <td>
                      {rule.biller_name ? rule.biller_name : (
                        <Badge bg="light" text="dark">Global</Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={getRuleTypeBadgeVariant(rule.rule_type)}>
                        {rule.rule_type.replace('_', ' ').charAt(0).toUpperCase() + rule.rule_type.replace('_', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td>
                      {rule.rule_type === 'account_format' && (
                        <code>{rule.rule_config.regex}</code>
                      )}
                      {rule.rule_type === 'amount_limit' && (
                        <span>
                          Min: ${rule.rule_config.min_amount}, Max: ${rule.rule_config.max_amount}
                        </span>
                      )}
                      {rule.rule_type === 'verification' && (
                        <span>API Verification</span>
                      )}
                      {rule.rule_type === 'custom' && (
                        <span>Custom Script</span>
                      )}
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(rule.status)}>
                        {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                      </Badge>
                    </td>
                    <td>{rule.updated_at}</td>
                    <td>
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                          <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleEditRule(rule)}>
                            <IconifyIcon icon="ri:pencil-line" className="me-1" />
                            Edit Rule
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <IconifyIcon icon="ri:test-tube-line" className="me-1" />
                            Test Rule
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Header>Change Status</Dropdown.Header>
                          <Dropdown.Item 
                            className={rule.status === 'active' ? 'active' : ''}
                          >
                            <IconifyIcon icon="ri:check-line" className="me-1 text-success" />
                            Active
                          </Dropdown.Item>
                          <Dropdown.Item 
                            className={rule.status === 'inactive' ? 'active' : ''}
                          >
                            <IconifyIcon icon="ri:close-circle-line" className="me-1 text-danger" />
                            Inactive
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      
      {/* Add/Edit Validation Rule Modal */}
      <AddValidationRuleModal
        show={showAddRuleModal}
        onHide={() => setShowAddRuleModal(false)}
        onSave={handleSaveRule}
        editRule={editRule}
        billers={[
          { id: 'BIL-001', name: 'Electricity Company of Ghana' },
          { id: 'BIL-002', name: 'Ghana Water Company' },
          { id: 'BIL-003', name: 'MTN Ghana' },
          { id: 'BIL-004', name: 'Vodafone Ghana' },
          { id: 'BIL-005', name: 'DSTV' },
          { id: 'BIL-006', name: 'Ghana Revenue Authority' },
          { id: 'BIL-007', name: 'University of Ghana' }
        ]}
      />
    </>
  );
};

export default PaymentValidationRules;
