"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Dropdown, 
  Modal,
  Row,
  Col
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import BillerDetailsModal from './BillerDetailsModal';

interface Biller {
  id: string;
  name: string;
  logo: string;
  category: 'utilities' | 'telecom' | 'internet' | 'tv' | 'education' | 'government' | 'insurance' | 'other';
  status: 'active' | 'inactive' | 'maintenance';
  payment_methods: string[];
  validation_rules: {
    account_format: string;
    min_amount?: number;
    max_amount?: number;
    requires_verification: boolean;
  };
  transaction_count: number;
  volume: string;
  avg_amount: string;
  commission_rate: string;
  integration_type: 'direct' | 'aggregator' | 'manual';
}

const BillerManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentBiller, setCurrentBiller] = useState<Biller | null>(null);
  
  // Sample data - would be fetched from API in production
  const billers: Biller[] = [
    {
      id: 'BIL-001',
      name: 'Electricity Company of Ghana (ECG)',
      logo: '/assets/images/billers/ecg-logo.png',
      category: 'utilities',
      status: 'active',
      payment_methods: ['Mobile Money', 'Card', 'Bank Transfer'],
      validation_rules: {
        account_format: '^[0-9]{11}$',
        min_amount: 5,
        max_amount: 10000,
        requires_verification: true,
      },
      transaction_count: 856,
      volume: '$42,350',
      avg_amount: '$49.47',
      commission_rate: '1.2%',
      integration_type: 'direct',
    },
    {
      id: 'BIL-002',
      name: 'Ghana Water Company Limited',
      logo: '/assets/images/billers/gwcl-logo.png',
      category: 'utilities',
      status: 'active',
      payment_methods: ['Mobile Money', 'Card'],
      validation_rules: {
        account_format: '^[A-Z0-9]{10}$',
        min_amount: 10,
        max_amount: 5000,
        requires_verification: true,
      },
      transaction_count: 623,
      volume: '$18,750',
      avg_amount: '$30.10',
      commission_rate: '1.0%',
      integration_type: 'direct',
    },
    {
      id: 'BIL-003',
      name: 'MTN Ghana',
      logo: '/assets/images/billers/mtn-logo.png',
      category: 'telecom',
      status: 'active',
      payment_methods: ['Mobile Money', 'Card', 'Bank Transfer'],
      validation_rules: {
        account_format: '^[0-9]{10}$',
        min_amount: 1,
        max_amount: 1000,
        requires_verification: false,
      },
      transaction_count: 1245,
      volume: '$15,680',
      avg_amount: '$12.59',
      commission_rate: '2.5%',
      integration_type: 'direct',
    },
    {
      id: 'BIL-004',
      name: 'Vodafone Ghana',
      logo: '/assets/images/billers/vodafone-logo.png',
      category: 'telecom',
      status: 'active',
      payment_methods: ['Mobile Money', 'Card'],
      validation_rules: {
        account_format: '^[0-9]{9}$',
        min_amount: 1,
        max_amount: 1000,
        requires_verification: false,
      },
      transaction_count: 587,
      volume: '$7,450',
      avg_amount: '$12.69',
      commission_rate: '2.0%',
      integration_type: 'direct',
    },
    {
      id: 'BIL-005',
      name: 'DSTV',
      logo: '/assets/images/billers/dstv-logo.png',
      category: 'tv',
      status: 'active',
      payment_methods: ['Mobile Money', 'Card'],
      validation_rules: {
        account_format: '^[0-9]{10}$',
        min_amount: 15,
        max_amount: 500,
        requires_verification: true,
      },
      transaction_count: 324,
      volume: '$12,750',
      avg_amount: '$39.35',
      commission_rate: '1.5%',
      integration_type: 'aggregator',
    },
    {
      id: 'BIL-006',
      name: 'Ghana Revenue Authority',
      logo: '/assets/images/billers/gra-logo.png',
      category: 'government',
      status: 'maintenance',
      payment_methods: ['Mobile Money', 'Bank Transfer'],
      validation_rules: {
        account_format: '^[A-Z0-9]{12}$',
        min_amount: 10,
        max_amount: 50000,
        requires_verification: true,
      },
      transaction_count: 156,
      volume: '$28,950',
      avg_amount: '$185.58',
      commission_rate: '0.5%',
      integration_type: 'direct',
    },
    {
      id: 'BIL-007',
      name: 'University of Ghana',
      logo: '/assets/images/billers/uog-logo.png',
      category: 'education',
      status: 'active',
      payment_methods: ['Mobile Money', 'Card', 'Bank Transfer'],
      validation_rules: {
        account_format: '^[0-9]{8}$',
        min_amount: 50,
        max_amount: 10000,
        requires_verification: true,
      },
      transaction_count: 213,
      volume: '$85,400',
      avg_amount: '$400.94',
      commission_rate: '0.8%',
      integration_type: 'direct',
    },
    {
      id: 'BIL-008',
      name: 'Surfline Communications',
      logo: '/assets/images/billers/surfline-logo.png',
      category: 'internet',
      status: 'inactive',
      payment_methods: ['Mobile Money', 'Card'],
      validation_rules: {
        account_format: '^[0-9]{10}$',
        min_amount: 5,
        max_amount: 500,
        requires_verification: false,
      },
      transaction_count: 0,
      volume: '$0',
      avg_amount: '$0',
      commission_rate: '1.8%',
      integration_type: 'aggregator',
    },
  ];
  
  // Filter billers based on search term, category, and status
  const filteredBillers = billers.filter((biller) => {
    const matchesSearch = biller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biller.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || biller.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || biller.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: Biller['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'maintenance':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Get category badge variant
  const getCategoryBadgeVariant = (category: Biller['category']) => {
    switch (category) {
      case 'utilities':
        return 'primary';
      case 'telecom':
        return 'info';
      case 'internet':
        return 'purple';
      case 'tv':
        return 'pink';
      case 'education':
        return 'success';
      case 'government':
        return 'dark';
      case 'insurance':
        return 'warning';
      case 'other':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Get integration type badge variant
  const getIntegrationBadgeVariant = (type: Biller['integration_type']) => {
    switch (type) {
      case 'direct':
        return 'success';
      case 'aggregator':
        return 'info';
      case 'manual':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  // Handle biller edit
  const handleEditBiller = (biller: Biller) => {
    setCurrentBiller(biller);
    setShowEditModal(true);
  };

  // Handle view details
  const handleViewDetails = (biller: Biller) => {
    setCurrentBiller(biller);
    setShowDetailsModal(true);
  };

  // Handle status change
  const handleStatusChange = (biller: Biller, newStatus: string) => {
    console.log(`Changing status of ${biller.name} to ${newStatus}`);
    alert(`Successfully changed ${biller.name} status to ${newStatus}`);
  };

  return (
    <>
      {/* Filters */}
      <div className="d-flex flex-wrap align-items-center mb-3">
        <div className="me-3 mb-2">
          <InputGroup>
            <Form.Control
              placeholder="Search billers..."
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
              Category: {filterCategory === 'all' ? 'All' : filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterCategory('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('utilities')}>Utilities</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('telecom')}>Telecom</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('internet')}>Internet</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('tv')}>TV</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('education')}>Education</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('government')}>Government</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('insurance')}>Insurance</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('other')}>Other</Dropdown.Item>
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
              <Dropdown.Item onClick={() => setFilterStatus('maintenance')}>Maintenance</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      
      {/* Billers Table */}
      <div className="table-responsive">
        <Table className="table-centered table-hover mb-0">
          <thead>
            <tr>
              <th>Biller</th>
              <th>Category</th>
              <th>Integration</th>
              <th>Payment Methods</th>
              <th>Transactions</th>
              <th>Volume</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBillers.map((biller) => (
              <tr key={biller.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm me-2">
                      <img 
                        src={biller.logo} 
                        alt={biller.name} 
                        className="img-fluid"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="font-14 mb-0">{biller.name}</h5>
                      <span className="text-muted font-13">{biller.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge bg={getCategoryBadgeVariant(biller.category)}>
                    {biller.category.charAt(0).toUpperCase() + biller.category.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Badge bg={getIntegrationBadgeVariant(biller.integration_type)}>
                    {biller.integration_type.charAt(0).toUpperCase() + biller.integration_type.slice(1)}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {biller.payment_methods.map((method, idx) => (
                      <Badge key={idx} bg="light" text="dark" className="me-1">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td>{biller.transaction_count.toLocaleString()}</td>
                <td>{biller.volume}</td>
                <td>{biller.commission_rate}</td>
                <td>
                  <Badge bg={getStatusBadgeVariant(biller.status)}>
                    {biller.status.charAt(0).toUpperCase() + biller.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewDetails(biller)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleEditBiller(biller)}>
                        <IconifyIcon icon="ri:pencil-line" className="me-1" />
                        Edit Biller
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:settings-4-line" className="me-1" />
                        Validation Rules
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
                        View Analytics
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Change Status</Dropdown.Header>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(biller, 'active')}
                        className={biller.status === 'active' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:check-line" className="me-1 text-success" />
                        Active
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(biller, 'maintenance')}
                        className={biller.status === 'maintenance' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:tools-line" className="me-1 text-warning" />
                        Maintenance
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(biller, 'inactive')}
                        className={biller.status === 'inactive' ? 'active' : ''}
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
      
      {/* Edit Biller Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentBiller ? `Edit Biller: ${currentBiller.name}` : 'Add Biller'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Basic Information */}
            <h5 className="mb-3">Basic Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Biller Name</Form.Label>
              <Form.Control 
                type="text" 
                value={currentBiller?.name || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={currentBiller?.category || 'utilities'}
                    onChange={() => {}}
                  >
                    <option value="utilities">Utilities</option>
                    <option value="telecom">Telecom</option>
                    <option value="internet">Internet</option>
                    <option value="tv">TV</option>
                    <option value="education">Education</option>
                    <option value="government">Government</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={currentBiller?.status || 'active'}
                    onChange={() => {}}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Logo</Form.Label>
              <Form.Control type="file" />
              {currentBiller?.logo && (
                <div className="mt-2">
                  <img 
                    src={currentBiller.logo} 
                    alt={currentBiller.name} 
                    height="40" 
                    className="img-thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                    }}
                  />
                </div>
              )}
            </Form.Group>
            
            {/* Payment Methods */}
            <h5 className="mb-3 mt-4">Payment Methods</h5>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Mobile Money"
                checked={currentBiller?.payment_methods.includes('Mobile Money') || false}
                onChange={() => {}}
              />
              <Form.Check
                type="checkbox"
                label="Card Payment"
                checked={currentBiller?.payment_methods.includes('Card') || false}
                onChange={() => {}}
              />
              <Form.Check
                type="checkbox"
                label="Bank Transfer"
                checked={currentBiller?.payment_methods.includes('Bank Transfer') || false}
                onChange={() => {}}
              />
            </Form.Group>
            
            {/* Integration Details */}
            <h5 className="mb-3 mt-4">Integration Details</h5>
            <Form.Group className="mb-3">
              <Form.Label>Integration Type</Form.Label>
              <Form.Select
                value={currentBiller?.integration_type || 'direct'}
                onChange={() => {}}
              >
                <option value="direct">Direct Integration</option>
                <option value="aggregator">Via Aggregator</option>
                <option value="manual">Manual Processing</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>API Endpoint (for Direct Integration)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="https://api.example.com/payments"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>API Credentials</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                placeholder="Enter API keys or credentials in JSON format"
              />
            </Form.Group>
            
            {/* Commission Structure */}
            <h5 className="mb-3 mt-4">Commission Structure</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Commission Rate (%)</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.1"
                    value={currentBiller?.commission_rate.replace('%', '') || ''}
                    onChange={() => {}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Settlement Period (days)</Form.Label>
                  <Form.Control 
                    type="number" 
                    defaultValue={7}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Validation Rules */}
            <h5 className="mb-3 mt-4">Validation Rules</h5>
            <Form.Group className="mb-3">
              <Form.Label>Account Number Format (RegEx)</Form.Label>
              <Form.Control 
                type="text" 
                value={currentBiller?.validation_rules.account_format || ''}
                onChange={() => {}}
                placeholder="e.g. ^[0-9]{10}$"
              />
              <Form.Text className="text-muted">
                Regular expression pattern to validate account numbers
              </Form.Text>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Amount ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={currentBiller?.validation_rules.min_amount || ''}
                    onChange={() => {}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Amount ($)</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={currentBiller?.validation_rules.max_amount || ''}
                    onChange={() => {}}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Requires Account Verification"
                checked={currentBiller?.validation_rules.requires_verification || false}
                onChange={() => {}}
              />
              <Form.Text className="text-muted">
                If checked, the system will verify account details before processing payment
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Biller Details Modal */}
      <BillerDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        biller={currentBiller}
        onEdit={handleEditBiller}
        onStatusChange={handleStatusChange}
      />
    </>
  );
};

export default BillerManagementTable;
