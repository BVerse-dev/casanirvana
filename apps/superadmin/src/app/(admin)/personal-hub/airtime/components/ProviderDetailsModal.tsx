"use client";

import React from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface Provider {
  id: string;
  name: string;
  logo: string;
  country: string;
  status: 'active' | 'inactive' | 'maintenance';
  balance: string;
  transactions: number;
  fee: string;
}

interface ProviderDetailsModalProps {
  show: boolean;
  onHide: () => void;
  provider: Provider | null;
  onEdit?: (provider: Provider) => void;
  onTopUp?: (provider: Provider) => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({ 
  show, 
  onHide, 
  provider,
  onEdit,
  onTopUp
}) => {
  if (!provider) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: Provider['status']) => {
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

  // Mock extended data for the provider
  const extendedProvider = {
    ...provider,
    addedDate: '15 Jan 2023',
    lastActivity: '2 hours ago',
    apiEndpoint: `https://api.${provider.name.toLowerCase()}.com/v2/airtime`,
    apiStatus: provider.status === 'active' ? 'Connected' : 'Disconnected',
    supportedCountries: provider.country === 'Ghana' ? ['Ghana', 'Togo'] : [provider.country],
    minimumBalance: '$1,000',
    autoTopUpEnabled: true,
    autoTopUpThreshold: '$2,000',
    successRate: provider.status === 'active' ? 98.5 : 0,
    avgResponseTime: provider.status === 'active' ? '1.2s' : 'N/A',
    monthlyVolume: provider.transactions * 25,
    totalRevenue: provider.transactions * 0.5,
    contactPerson: {
      name: 'John Smith',
      email: `support@${provider.name.toLowerCase()}.com`,
      phone: '+233 50 123 4567'
    },
    recentTransactions: [
      { id: 'TRX-001', amount: '$10.00', status: 'completed', time: '2 min ago' },
      { id: 'TRX-002', amount: '$25.00', status: 'completed', time: '15 min ago' },
      { id: 'TRX-003', amount: '$5.00', status: 'failed', time: '1 hour ago' },
    ],
    balanceHistory: [
      { date: 'Today', balance: provider.balance },
      { date: 'Yesterday', balance: '$' + (parseFloat(provider.balance.replace('$', '').replace(',', '')) - 250).toLocaleString() },
      { date: '2 days ago', balance: '$' + (parseFloat(provider.balance.replace('$', '').replace(',', '')) - 500).toLocaleString() },
    ]
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <img 
            src={provider.logo} 
            alt={provider.name} 
            height="32" 
            className="me-2 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
            }}
          />
          {provider.name} - Provider Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Provider Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(provider.status)} className="px-3 py-2">
              <IconifyIcon 
                icon={provider.status === 'active' ? 'ri:check-line' : 
                      provider.status === 'maintenance' ? 'ri:tools-line' : 
                      'ri:close-line'} 
                className="me-1" 
              />
              {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
            </Badge>
          </div>
          <h4 className="mb-1">{provider.balance} Balance</h4>
          <p className="text-muted mb-0">{provider.transactions.toLocaleString()} total transactions</p>
        </div>

        <Row>
          {/* Basic Information */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Basic Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Provider ID:</td>
                      <td>{provider.id}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Name:</td>
                      <td>{provider.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Country:</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon="ri:map-pin-line" className="me-1" />
                          {provider.country}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Supported Countries:</td>
                      <td>
                        {extendedProvider.supportedCountries.map((country, index) => (
                          <Badge key={index} bg="outline-info" className="me-1">
                            {country}
                          </Badge>
                        ))}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Fee Structure:</td>
                      <td>{provider.fee}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Added Date:</td>
                      <td>{extendedProvider.addedDate}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Last Activity:</td>
                      <td>{extendedProvider.lastActivity}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Contact Information */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Contact Information</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center p-3 border rounded">
                  <div className="avatar-md rounded-circle bg-primary bg-opacity-10 me-3">
                    <IconifyIcon icon="ri:user-line" className="text-primary" />
                  </div>
                  <div>
                    <h6 className="mb-1">{extendedProvider.contactPerson.name}</h6>
                    <p className="text-muted mb-0">
                      {extendedProvider.contactPerson.email}<br />
                      <small>{extendedProvider.contactPerson.phone}</small>
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Performance & API Info */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">API Integration</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">API Endpoint:</td>
                      <td>
                        <code className="text-primary">{extendedProvider.apiEndpoint}</code>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">API Status:</td>
                      <td>
                        <Badge bg={provider.status === 'active' ? 'success' : 'danger'}>
                          <IconifyIcon 
                            icon={provider.status === 'active' ? 'ri:check-line' : 'ri:close-line'} 
                            className="me-1" 
                          />
                          {extendedProvider.apiStatus}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Success Rate:</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <ProgressBar 
                            now={extendedProvider.successRate} 
                            variant={extendedProvider.successRate > 95 ? 'success' : 'warning'}
                            style={{ width: '100px' }}
                            className="me-2"
                          />
                          <span>{extendedProvider.successRate}%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Avg Response Time:</td>
                      <td>{extendedProvider.avgResponseTime}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Financial Information */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Financial Information</h6>
              </Card.Header>
              <Card.Body>
                <Row className="text-center">
                  <Col xs={6} className="border-end">
                    <h5 className="text-primary mb-1">${extendedProvider.monthlyVolume.toLocaleString()}</h5>
                    <p className="text-muted mb-0">Monthly Volume</p>
                  </Col>
                  <Col xs={6}>
                    <h5 className="text-success mb-1">${extendedProvider.totalRevenue.toLocaleString()}</h5>
                    <p className="text-muted mb-0">Total Revenue</p>
                  </Col>
                </Row>
                
                <hr />
                
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Current Balance:</td>
                      <td>{provider.balance}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Minimum Balance:</td>
                      <td>{extendedProvider.minimumBalance}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Auto Top-up:</td>
                      <td>
                        <Badge bg={extendedProvider.autoTopUpEnabled ? 'success' : 'secondary'}>
                          {extendedProvider.autoTopUpEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        {extendedProvider.autoTopUpEnabled && (
                          <small className="text-muted d-block">
                            Threshold: {extendedProvider.autoTopUpThreshold}
                          </small>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Transactions */}
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
                  {extendedProvider.recentTransactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{transaction.id}</td>
                      <td>{transaction.amount}</td>
                      <td>
                        <Badge bg={transaction.status === 'completed' ? 'success' : 'danger'}>
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

        {/* Balance History */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">Balance History</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table className="table-sm mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Balance</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {extendedProvider.balanceHistory.map((entry, index) => {
                    const currentBalance = parseFloat(entry.balance.replace('$', '').replace(',', ''));
                    const previousBalance = index < extendedProvider.balanceHistory.length - 1 
                      ? parseFloat(extendedProvider.balanceHistory[index + 1].balance.replace('$', '').replace(',', ''))
                      : currentBalance;
                    const change = currentBalance - previousBalance;
                    
                    return (
                      <tr key={index}>
                        <td>{entry.date}</td>
                        <td>{entry.balance}</td>
                        <td>
                          {change !== 0 && (
                            <span className={change > 0 ? 'text-success' : 'text-danger'}>
                              <IconifyIcon 
                                icon={change > 0 ? 'ri:arrow-up-line' : 'ri:arrow-down-line'} 
                                className="me-1" 
                              />
                              ${Math.abs(change).toLocaleString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
        <Button variant="outline-primary" onClick={() => onTopUp && onTopUp(provider)}>
          <IconifyIcon icon="ri:wallet-3-line" className="me-1" />
          Top Up Balance
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(provider)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Provider
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProviderDetailsModal;
