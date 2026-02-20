"use client";

import React from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface TransferService {
  id: string;
  name: string;
  logo: string;
  type: 'domestic' | 'international';
  countries: string[];
  status: 'active' | 'inactive' | 'maintenance';
  fee_structure: {
    percentage?: number;
    flat_fee?: number;
    min_amount: number;
    max_amount: number;
    tier_based?: boolean;
  };
  transaction_count: number;
  volume: string;
  avg_amount: string;
  limits: {
    daily: string;
    monthly: string;
    per_transaction: string;
  };
}

interface ServiceDetailsModalProps {
  show: boolean;
  onHide: () => void;
  service: TransferService | null;
  onEdit?: (service: TransferService) => void;
  onStatusChange?: (service: TransferService, newStatus: string) => void;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ 
  show, 
  onHide, 
  service,
  onEdit,
  onStatusChange
}) => {
  if (!service) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: TransferService['status']) => {
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

  // Mock extended data for the service
  const extendedService = {
    ...service,
    addedDate: '12 Jan 2023',
    lastActivity: '3 hours ago',
    apiEndpoint: `https://api.${service.name.toLowerCase().replace(/\s+/g, '')}.com/v2/transfer`,
    apiStatus: service.status === 'active' ? 'Connected' : 'Disconnected',
    successRate: service.status === 'active' ? 97.8 : 0,
    avgResponseTime: service.status === 'active' ? '2.1s' : 'N/A',
    totalRevenue: parseFloat(service.volume.replace('$', '').replace(',', '')) * 0.025,
    monthlyGrowth: '+12.5%',
    complianceScore: 94,
    kycRequired: service.type === 'international',
    amlChecks: true,
    supportedCurrencies: service.type === 'international' 
      ? ['USD', 'EUR', 'GBP', 'GHS', 'NGN', 'KES']
      : ['GHS', 'USD'],
    processingTimes: {
      domestic: '5-15 minutes',
      international: '1-3 business days'
    },
    partnerBanks: service.type === 'international' 
      ? ['Chase Bank', 'HSBC', 'Standard Chartered', 'Barclays']
      : ['GCB Bank', 'Ecobank', 'Stanbic Bank'],
    recentTransactions: [
      { id: 'TRX-001', amount: '$150.00', status: 'completed', time: '5 min ago' },
      { id: 'TRX-002', amount: '$75.00', status: 'completed', time: '12 min ago' },
      { id: 'TRX-003', amount: '$500.00', status: 'pending', time: '25 min ago' },
    ],
    performanceMetrics: [
      { metric: 'Daily Volume', value: '$12,450', change: '+8.2%' },
      { metric: 'Transaction Count', value: '156', change: '+15.3%' },
      { metric: 'Average Amount', value: service.avg_amount, change: '+3.1%' },
      { metric: 'Success Rate', value: '97.8%', change: '+0.5%' }
    ]
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <img 
            src={service.logo} 
            alt={service.name} 
            height="32" 
            className="me-2 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
            }}
          />
          {service.name} - Service Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Service Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(service.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={service.status === 'active' ? 'ri:check-line' : 
                      service.status === 'maintenance' ? 'ri:tools-line' : 
                      'ri:close-line'} 
                className="me-1" 
              />
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </Badge>
            <Badge bg={service.type === 'domestic' ? 'info' : 'primary'} className="px-3 py-2">
              <IconifyIcon icon="ri:global-line" className="me-1" />
              {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
            </Badge>
          </div>
          <h4 className="mb-1">{service.volume} Total Volume</h4>
          <p className="text-muted mb-0">{service.transaction_count.toLocaleString()} total transactions</p>
        </div>

        <Row>
          {/* Basic Information */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Service Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Service ID:</td>
                      <td>{service.id}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Name:</td>
                      <td>{service.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Type:</td>
                      <td>
                        <Badge bg={service.type === 'domestic' ? 'info' : 'primary'}>
                          {service.type}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Countries:</td>
                      <td>
                        {service.countries.map((country, index) => (
                          <Badge key={index} bg="outline-secondary" className="me-1 mb-1">
                            {country}
                          </Badge>
                        ))}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Added Date:</td>
                      <td>{extendedService.addedDate}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Last Activity:</td>
                      <td>{extendedService.lastActivity}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Processing Time:</td>
                      <td>{service.type === 'domestic' ? extendedService.processingTimes.domestic : extendedService.processingTimes.international}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Fee Structure */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Fee Structure</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    {service.fee_structure.percentage && (
                      <tr>
                        <td className="fw-semibold">Percentage Fee:</td>
                        <td>{service.fee_structure.percentage}%</td>
                      </tr>
                    )}
                    {service.fee_structure.flat_fee && (
                      <tr>
                        <td className="fw-semibold">Flat Fee:</td>
                        <td>${service.fee_structure.flat_fee.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="fw-semibold">Min Amount:</td>
                      <td>${service.fee_structure.min_amount}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Max Amount:</td>
                      <td>${service.fee_structure.max_amount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Tier Based:</td>
                      <td>
                        <Badge bg={service.fee_structure.tier_based ? 'success' : 'secondary'}>
                          {service.fee_structure.tier_based ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Performance & Limits */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Performance Metrics</h6>
              </Card.Header>
              <Card.Body>
                <Row className="text-center mb-3">
                  <Col xs={6} className="border-end">
                    <h5 className="text-primary mb-1">${extendedService.totalRevenue.toLocaleString()}</h5>
                    <p className="text-muted mb-0">Total Revenue</p>
                  </Col>
                  <Col xs={6}>
                    <h5 className="text-success mb-1">{extendedService.monthlyGrowth}</h5>
                    <p className="text-muted mb-0">Monthly Growth</p>
                  </Col>
                </Row>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Success Rate:</span>
                    <span>{extendedService.successRate}%</span>
                  </div>
                  <ProgressBar 
                    now={extendedService.successRate} 
                    variant={extendedService.successRate > 95 ? 'success' : 'warning'}
                    className="mb-2"
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Compliance Score:</span>
                    <span>{extendedService.complianceScore}/100</span>
                  </div>
                  <ProgressBar 
                    now={extendedService.complianceScore} 
                    variant={extendedService.complianceScore > 90 ? 'success' : 'warning'}
                    className="mb-2"
                  />
                </div>

                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">API Status:</td>
                      <td>
                        <Badge bg={service.status === 'active' ? 'success' : 'danger'}>
                          <IconifyIcon 
                            icon={service.status === 'active' ? 'ri:check-line' : 'ri:close-line'} 
                            className="me-1" 
                          />
                          {extendedService.apiStatus}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Avg Response Time:</td>
                      <td>{extendedService.avgResponseTime}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Transaction Limits */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Transaction Limits</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Per Transaction:</td>
                      <td>{service.limits.per_transaction}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Daily Limit:</td>
                      <td>{service.limits.daily}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Monthly Limit:</td>
                      <td>{service.limits.monthly}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Compliance & Security */}
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Compliance & Security</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-center p-3 border rounded">
                  <IconifyIcon icon="ri:shield-check-line" className="font-24 text-success mb-2" />
                  <h6>KYC Required</h6>
                  <Badge bg={extendedService.kycRequired ? 'success' : 'secondary'}>
                    {extendedService.kycRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center p-3 border rounded">
                  <IconifyIcon icon="ri:search-eye-line" className="font-24 text-info mb-2" />
                  <h6>AML Checks</h6>
                  <Badge bg={extendedService.amlChecks ? 'success' : 'secondary'}>
                    {extendedService.amlChecks ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center p-3 border rounded">
                  <IconifyIcon icon="ri:award-line" className="font-24 text-warning mb-2" />
                  <h6>Compliance Score</h6>
                  <Badge bg={extendedService.complianceScore > 90 ? 'success' : 'warning'}>
                    {extendedService.complianceScore}/100
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Supported Currencies & Partners */}
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Supported Currencies</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {extendedService.supportedCurrencies.map((currency, index) => (
                    <Badge key={index} bg="outline-primary" className="px-3 py-2">
                      {currency}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Partner Banks</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {extendedService.partnerBanks.map((bank, index) => (
                    <Badge key={index} bg="outline-secondary" className="px-2 py-1">
                      {bank}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Transactions */}
        <Card>
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
                  {extendedService.recentTransactions.map((transaction, index) => (
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
          Service Settings
        </Button>
        <Button 
          variant={service.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(service, service.status === 'active' ? 'maintenance' : 'active')}
        >
          <IconifyIcon 
            icon={service.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {service.status === 'active' ? 'Set Maintenance' : 'Activate Service'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(service)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Service
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ServiceDetailsModal;
