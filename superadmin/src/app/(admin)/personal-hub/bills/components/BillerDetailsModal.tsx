"use client";

import React from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

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

interface BillerDetailsModalProps {
  show: boolean;
  onHide: () => void;
  biller: Biller | null;
  onEdit?: (biller: Biller) => void;
  onStatusChange?: (biller: Biller, newStatus: string) => void;
}

const BillerDetailsModal: React.FC<BillerDetailsModalProps> = ({ 
  show, 
  onHide, 
  biller,
  onEdit,
  onStatusChange
}) => {
  if (!biller) return null;

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

  // Get integration badge variant
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

  // Mock extended data for the biller
  const extendedBiller = {
    ...biller,
    addedDate: '15 Feb 2023',
    lastActivity: '2 hours ago',
    apiEndpoint: biller.integration_type === 'direct' 
      ? `https://api.${biller.name.toLowerCase().replace(/\s+/g, '')}.com/v2/bills`
      : biller.integration_type === 'aggregator' ? 'Via Third-Party Aggregator' : 'Manual Processing',
    apiStatus: biller.status === 'active' ? 'Connected' : 'Disconnected',
    successRate: biller.status === 'active' ? 98.2 : 0,
    avgResponseTime: biller.status === 'active' ? '1.8s' : 'N/A',
    totalRevenue: parseFloat(biller.volume.replace('$', '').replace(',', '')) * (parseFloat(biller.commission_rate.replace('%', '')) / 100),
    monthlyGrowth: '+18.3%',
    uptime: biller.status === 'active' ? 99.8 : 0,
    supportContact: {
      email: `support@${biller.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: '+233 30 123 4567',
      website: `https://www.${biller.name.toLowerCase().replace(/\s+/g, '')}.com`
    },
    settlementPeriod: '7 days',
    lastSettlement: '20 Sep 2023',
    nextSettlement: '27 Sep 2023',
    recentTransactions: [
      { id: 'BPT-001', amount: '$45.50', status: 'completed', time: '3 min ago' },
      { id: 'BPT-002', amount: '$125.00', status: 'completed', time: '8 min ago' },
      { id: 'BPT-003', amount: '$32.75', status: 'pending', time: '15 min ago' },
    ],
    performanceMetrics: [
      { metric: 'Daily Volume', value: '$2,850', change: '+12.5%' },
      { metric: 'Transaction Count', value: '67', change: '+8.9%' },
      { metric: 'Success Rate', value: '98.2%', change: '+0.3%' },
      { metric: 'Avg Response Time', value: '1.8s', change: '-0.2s' }
    ],
    validationRules: [
      {
        field: 'Account Number',
        rule: biller.validation_rules.account_format,
        description: 'Account number format validation',
        active: true
      },
      {
        field: 'Amount Range',
        rule: `$${biller.validation_rules.min_amount} - $${biller.validation_rules.max_amount}`,
        description: 'Transaction amount limits',
        active: true
      },
      {
        field: 'Account Verification',
        rule: biller.validation_rules.requires_verification ? 'Required' : 'Optional',
        description: 'Account verification requirement',
        active: biller.validation_rules.requires_verification
      }
    ]
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <img 
            src={biller.logo} 
            alt={biller.name} 
            height="32" 
            className="me-2 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
            }}
          />
          {biller.name} - Biller Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Biller Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(biller.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={biller.status === 'active' ? 'ri:check-line' : 
                      biller.status === 'maintenance' ? 'ri:tools-line' : 
                      'ri:close-line'} 
                className="me-1" 
              />
              {biller.status.charAt(0).toUpperCase() + biller.status.slice(1)}
            </Badge>
            <Badge bg={getCategoryBadgeVariant(biller.category)} className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:building-line" className="me-1" />
              {biller.category.charAt(0).toUpperCase() + biller.category.slice(1)}
            </Badge>
            <Badge bg={getIntegrationBadgeVariant(biller.integration_type)} className="px-3 py-2">
              <IconifyIcon icon="ri:links-line" className="me-1" />
              {biller.integration_type.charAt(0).toUpperCase() + biller.integration_type.slice(1)}
            </Badge>
          </div>
          <h4 className="mb-1">{biller.volume} Total Volume</h4>
          <p className="text-muted mb-0">{biller.transaction_count.toLocaleString()} total transactions • {biller.commission_rate} commission</p>
        </div>

        <Row>
          {/* Basic Information */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Biller Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Biller ID:</td>
                      <td>{biller.id}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Name:</td>
                      <td>{biller.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Category:</td>
                      <td>
                        <Badge bg={getCategoryBadgeVariant(biller.category)}>
                          {biller.category}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Integration:</td>
                      <td>
                        <Badge bg={getIntegrationBadgeVariant(biller.integration_type)}>
                          {biller.integration_type}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Added Date:</td>
                      <td>{extendedBiller.addedDate}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Last Activity:</td>
                      <td>{extendedBiller.lastActivity}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Commission Rate:</td>
                      <td>{biller.commission_rate}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Payment Methods */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Payment Methods</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {biller.payment_methods.map((method, index) => (
                    <Badge key={index} bg="outline-primary" className="px-3 py-2">
                      <IconifyIcon 
                        icon={
                          method === 'Mobile Money' ? 'ri:smartphone-line' :
                          method === 'Card' ? 'ri:bank-card-line' :
                          method === 'Bank Transfer' ? 'ri:bank-line' :
                          'ri:money-dollar-circle-line'
                        } 
                        className="me-1" 
                      />
                      {method}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Performance & Technical */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Performance Metrics</h6>
              </Card.Header>
              <Card.Body>
                <Row className="text-center mb-3">
                  <Col xs={6} className="border-end">
                    <h5 className="text-primary mb-1">${extendedBiller.totalRevenue.toFixed(2)}</h5>
                    <p className="text-muted mb-0">Total Revenue</p>
                  </Col>
                  <Col xs={6}>
                    <h5 className="text-success mb-1">{extendedBiller.monthlyGrowth}</h5>
                    <p className="text-muted mb-0">Monthly Growth</p>
                  </Col>
                </Row>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Success Rate:</span>
                    <span>{extendedBiller.successRate}%</span>
                  </div>
                  <ProgressBar 
                    now={extendedBiller.successRate} 
                    variant={extendedBiller.successRate > 95 ? 'success' : 'warning'}
                    className="mb-2"
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Service Uptime:</span>
                    <span>{extendedBiller.uptime}%</span>
                  </div>
                  <ProgressBar 
                    now={extendedBiller.uptime} 
                    variant={extendedBiller.uptime > 99 ? 'success' : 'warning'}
                    className="mb-2"
                  />
                </div>

                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">API Status:</td>
                      <td>
                        <Badge bg={biller.status === 'active' ? 'success' : 'danger'}>
                          <IconifyIcon 
                            icon={biller.status === 'active' ? 'ri:check-line' : 'ri:close-line'} 
                            className="me-1" 
                          />
                          {extendedBiller.apiStatus}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Avg Response Time:</td>
                      <td>{extendedBiller.avgResponseTime}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Settlement Information */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Settlement Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Settlement Period:</td>
                      <td>{extendedBiller.settlementPeriod}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Last Settlement:</td>
                      <td>{extendedBiller.lastSettlement}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Next Settlement:</td>
                      <td>{extendedBiller.nextSettlement}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Validation Rules */}
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Validation Rules</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table className="table-sm mb-0">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Rule</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {extendedBiller.validationRules.map((rule, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{rule.field}</td>
                      <td>
                        <code className="text-primary">{rule.rule}</code>
                      </td>
                      <td>{rule.description}</td>
                      <td>
                        <Badge bg={rule.active ? 'success' : 'secondary'}>
                          {rule.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Contact Information */}
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Contact Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Email:</td>
                      <td>
                        <a href={`mailto:${extendedBiller.supportContact.email}`} className="text-decoration-none">
                          {extendedBiller.supportContact.email}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Phone:</td>
                      <td>
                        <a href={`tel:${extendedBiller.supportContact.phone}`} className="text-decoration-none">
                          {extendedBiller.supportContact.phone}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Website:</td>
                      <td>
                        <a href={extendedBiller.supportContact.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          {extendedBiller.supportContact.website}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">API Endpoint:</td>
                      <td>
                        <code className="text-muted">{extendedBiller.apiEndpoint}</code>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Recent Transactions</h6>
                <Button variant="outline-primary" size="sm">
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table className="table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extendedBiller.recentTransactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{transaction.id}</td>
                          <td>{transaction.amount}</td>
                          <td>
                            <Badge bg={transaction.status === 'completed' ? 'success' : transaction.status === 'pending' ? 'warning' : 'danger'}>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td>{transaction.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary">
          <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
          View Analytics
        </Button>
        <Button variant="outline-info">
          <IconifyIcon icon="ri:settings-4-line" className="me-1" />
          Validation Rules
        </Button>
        <Button variant="outline-warning">
          <IconifyIcon icon="ri:test-tube-line" className="me-1" />
          Test Connection
        </Button>
        <Button 
          variant={biller.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(biller, biller.status === 'active' ? 'maintenance' : 'active')}
        >
          <IconifyIcon 
            icon={biller.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {biller.status === 'active' ? 'Set Maintenance' : 'Activate Biller'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(biller)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Biller
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BillerDetailsModal;
