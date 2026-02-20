"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, Tabs, Tab, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface Transaction {
  id: string;
  date: string;
  time: string;
  reference: string;
  service: 'airtime' | 'data' | 'transfer' | 'bills' | 'insurance' | 'marketplace';
  details: string;
  amount: string;
  user: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
}

interface TransactionDetailsModalProps {
  show: boolean;
  onHide: () => void;
  transaction: Transaction | null;
  onDownloadReceipt?: (transaction: Transaction) => void;
  onRefund?: (transaction: Transaction) => void;
  onResend?: (transaction: Transaction) => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ 
  show, 
  onHide, 
  transaction,
  onDownloadReceipt,
  onRefund,
  onResend
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!transaction) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Get service badge variant
  const getServiceBadgeVariant = (service: Transaction['service']) => {
    switch (service) {
      case 'airtime':
        return 'primary';
      case 'data':
        return 'info';
      case 'transfer':
        return 'success';
      case 'bills':
        return 'warning';
      case 'insurance':
        return 'danger';
      case 'marketplace':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the transaction
  const extendedTransaction = {
    ...transaction,
    full_reference: `${transaction.reference}-${Date.now()}`,
    fee_amount: '$0.50',
    net_amount: '$9.50',
    provider: transaction.service === 'airtime' ? 'MTN Ghana' : 
               transaction.service === 'data' ? 'Vodafone Ghana' :
               transaction.service === 'transfer' ? 'Mobile Money Ghana' :
               transaction.service === 'bills' ? 'ECG Ghana' :
               transaction.service === 'insurance' ? 'Hollard Insurance' :
               'CasaNirvana Marketplace',
    provider_reference: `PROV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    commission_rate: transaction.service === 'marketplace' ? '20%' : '10%',
    commission_amount: transaction.service === 'marketplace' ? '$18.00' : '$1.00',
    user_details: {
      id: 'USR-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      email: transaction.user.toLowerCase().replace(' ', '.') + '@example.com',
      phone: '+233' + Math.floor(Math.random() * 900000000 + 100000000),
      verification_status: 'verified',
      kyc_level: 'level_2'
    },
    payment_method: {
      type: 'mobile_money',
      provider: 'MTN Mobile Money',
      last_four: '1234',
      expiry: '12/25'
    },
    timeline: [
      {
        timestamp: transaction.date + ' ' + transaction.time,
        event: 'Transaction Initiated',
        description: 'User initiated transaction from mobile app',
        status: 'completed'
      },
      {
        timestamp: transaction.date + ' ' + (parseInt(transaction.time.split(':')[2]) + 2).toString().padStart(2, '0'),
        event: 'Payment Processing',
        description: 'Payment being processed by payment provider',
        status: 'completed'
      },
      {
        timestamp: transaction.date + ' ' + (parseInt(transaction.time.split(':')[2]) + 5).toString().padStart(2, '0'),
        event: 'Provider API Call',
        description: 'Request sent to service provider',
        status: transaction.status === 'failed' ? 'failed' : 'completed'
      },
      {
        timestamp: transaction.status !== 'pending' ? 
          transaction.date + ' ' + (parseInt(transaction.time.split(':')[2]) + 8).toString().padStart(2, '0') : null,
        event: 'Transaction Completed',
        description: transaction.status === 'completed' ? 'Service delivered successfully' :
                    transaction.status === 'failed' ? 'Transaction failed - refund initiated' :
                    transaction.status === 'refunded' ? 'Transaction refunded successfully' :
                    'Transaction pending completion',
        status: transaction.status
      }
    ].filter(item => item.timestamp),
    technical_details: {
      api_endpoint: `/api/personal-hub/${transaction.service}/${transaction.service === 'marketplace' ? 'orders' : 'purchase'}`,
      request_id: `REQ-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      response_time: Math.floor(Math.random() * 2000 + 500) + 'ms',
      ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user_agent: 'CasaNirvana Mobile App v2.1.0',
      device_id: `DEV-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      session_id: `SES-${Math.random().toString(36).substr(2, 10).toUpperCase()}`
    },
    compliance: {
      aml_check: 'passed',
      fraud_score: Math.floor(Math.random() * 30 + 1), // 1-30 (low risk)
      risk_level: 'low',
      sanctions_check: 'cleared',
      pep_check: 'not_applicable'
    },
    related_transactions: [
      {
        reference: 'TRX-583922',
        date: '2023-09-14',
        service: transaction.service,
        amount: '$5.00',
        status: 'completed',
        relationship: 'previous_transaction'
      },
      {
        reference: 'TRX-583924',
        date: '2023-09-16',
        service: transaction.service,
        amount: '$15.00',
        status: 'completed',
        relationship: 'follow_up_transaction'
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'ri:check-double-line';
      case 'pending':
        return 'ri:time-line';
      case 'failed':
        return 'ri:close-circle-line';
      case 'refunded':
        return 'ri:arrow-go-back-line';
      default:
        return 'ri:question-line';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div 
            className="me-2 d-flex align-items-center justify-content-center text-white fw-bold"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: getServiceBadgeVariant(transaction.service) === 'primary' ? '#0d6efd' :
                              getServiceBadgeVariant(transaction.service) === 'success' ? '#198754' :
                              getServiceBadgeVariant(transaction.service) === 'info' ? '#0dcaf0' :
                              getServiceBadgeVariant(transaction.service) === 'warning' ? '#ffc107' :
                              getServiceBadgeVariant(transaction.service) === 'danger' ? '#dc3545' : '#6c757d',
              fontSize: '10px'
            }}
          >
            {transaction.service.charAt(0).toUpperCase()}
          </div>
          Transaction Details - {transaction.reference}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Transaction Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(transaction.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={getStatusIcon(transaction.status)} 
                className="me-1" 
              />
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
            <Badge bg={getServiceBadgeVariant(transaction.service)} className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:service-line" className="me-1" />
              {transaction.service.charAt(0).toUpperCase() + transaction.service.slice(1)}
            </Badge>
            <Badge bg="info" className="px-3 py-2">
              <IconifyIcon icon="ri:calendar-line" className="me-1" />
              {transaction.date} {transaction.time}
            </Badge>
          </div>
          <h4 className="mb-1">{transaction.amount}</h4>
          <p className="text-muted mb-0">{transaction.details}</p>
        </div>

        {/* Status-specific alerts */}
        {transaction.status === 'failed' && (
          <Alert variant="danger" className="mb-3">
            <IconifyIcon icon="ri:error-warning-line" className="me-1" />
            This transaction has failed. A refund has been initiated and should be processed within 24 hours.
          </Alert>
        )}
        {transaction.status === 'pending' && (
          <Alert variant="warning" className="mb-3">
            <IconifyIcon icon="ri:time-line" className="me-1" />
            This transaction is still being processed. It may take up to 30 minutes to complete.
          </Alert>
        )}
        {transaction.status === 'refunded' && (
          <Alert variant="info" className="mb-3">
            <IconifyIcon icon="ri:information-line" className="me-1" />
            This transaction has been refunded. The refund amount should reflect in the user's account.
          </Alert>
        )}

        {/* Tabbed Content */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-3">
          {/* Overview Tab */}
          <Tab eventKey="overview" title="Overview">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Transaction Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Transaction ID:</td>
                          <td><code>{transaction.id}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Reference:</td>
                          <td><code>{transaction.reference}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Full Reference:</td>
                          <td><code>{extendedTransaction.full_reference}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Service:</td>
                          <td>
                            <Badge bg={getServiceBadgeVariant(transaction.service)}>
                              {transaction.service.charAt(0).toUpperCase() + transaction.service.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Provider:</td>
                          <td>{extendedTransaction.provider}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Provider Reference:</td>
                          <td><code>{extendedTransaction.provider_reference}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Date & Time:</td>
                          <td>{transaction.date} at {transaction.time}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Details:</td>
                          <td>{transaction.details}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Financial Breakdown</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Gross Amount:</td>
                          <td className="fw-bold">{transaction.amount}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Platform Fee:</td>
                          <td>{extendedTransaction.fee_amount}</td>
                        </tr>
                        <tr className="border-top">
                          <td className="fw-semibold">Net Amount:</td>
                          <td className="fw-bold">{extendedTransaction.net_amount}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Commission Rate:</td>
                          <td>{extendedTransaction.commission_rate}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Commission Amount:</td>
                          <td className="text-success fw-bold">{extendedTransaction.commission_amount}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">User Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">User ID:</td>
                          <td><code>{extendedTransaction.user_details.id}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Name:</td>
                          <td>{transaction.user}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Email:</td>
                          <td>{extendedTransaction.user_details.email}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Phone:</td>
                          <td>{extendedTransaction.user_details.phone}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Verification Status:</td>
                          <td>
                            <Badge bg="success">
                              {extendedTransaction.user_details.verification_status}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">KYC Level:</td>
                          <td>
                            <Badge bg="info">
                              {extendedTransaction.user_details.kyc_level.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Payment Method</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Type:</td>
                          <td>
                            <Badge bg="primary">
                              {extendedTransaction.payment_method.type.replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Provider:</td>
                          <td>{extendedTransaction.payment_method.provider}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Last Four Digits:</td>
                          <td>****{extendedTransaction.payment_method.last_four}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Expiry:</td>
                          <td>{extendedTransaction.payment_method.expiry}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Timeline Tab */}
          <Tab eventKey="timeline" title="Timeline">
            <Card>
              <Card.Header>
                <h6 className="mb-0">Transaction Timeline</h6>
              </Card.Header>
              <Card.Body>
                <div className="timeline">
                  {extendedTransaction.timeline.map((event, index) => (
                    <div key={index} className="d-flex mb-3">
                      <div className="flex-shrink-0">
                        <div className={`avatar-sm rounded-circle d-flex align-items-center justify-content-center ${
                          event.status === 'completed' ? 'bg-success bg-opacity-10' :
                          event.status === 'failed' ? 'bg-danger bg-opacity-10' :
                          event.status === 'pending' ? 'bg-warning bg-opacity-10' :
                          'bg-secondary bg-opacity-10'
                        }`}>
                          <IconifyIcon 
                            icon={getStatusIcon(event.status)} 
                            className={
                              event.status === 'completed' ? 'text-success' :
                              event.status === 'failed' ? 'text-danger' :
                              event.status === 'pending' ? 'text-warning' :
                              'text-secondary'
                            } 
                          />
                        </div>
                      </div>
                      <div className="ms-3 flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{event.event}</h6>
                            <p className="mb-1">{event.description}</p>
                          </div>
                          <small className="text-muted">{event.timestamp}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Tab>

          {/* Technical Details Tab */}
          <Tab eventKey="technical" title="Technical Details">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">API Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">API Endpoint:</td>
                          <td><code>{extendedTransaction.technical_details.api_endpoint}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Request ID:</td>
                          <td><code>{extendedTransaction.technical_details.request_id}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Response Time:</td>
                          <td>{extendedTransaction.technical_details.response_time}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">IP Address:</td>
                          <td>{extendedTransaction.technical_details.ip_address}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">User Agent:</td>
                          <td>{extendedTransaction.technical_details.user_agent}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Device ID:</td>
                          <td><code>{extendedTransaction.technical_details.device_id}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Session ID:</td>
                          <td><code>{extendedTransaction.technical_details.session_id}</code></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Compliance & Risk</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">AML Check:</td>
                          <td>
                            <Badge bg={extendedTransaction.compliance.aml_check === 'passed' ? 'success' : 'danger'}>
                              {extendedTransaction.compliance.aml_check}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Fraud Score:</td>
                          <td>
                            <Badge bg={extendedTransaction.compliance.fraud_score <= 30 ? 'success' : 'warning'}>
                              {extendedTransaction.compliance.fraud_score}/100
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Risk Level:</td>
                          <td>
                            <Badge bg={extendedTransaction.compliance.risk_level === 'low' ? 'success' : 'warning'}>
                              {extendedTransaction.compliance.risk_level}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Sanctions Check:</td>
                          <td>
                            <Badge bg={extendedTransaction.compliance.sanctions_check === 'cleared' ? 'success' : 'danger'}>
                              {extendedTransaction.compliance.sanctions_check}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">PEP Check:</td>
                          <td>
                            <Badge bg="info">
                              {extendedTransaction.compliance.pep_check.replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Related Transactions Tab */}
          <Tab eventKey="related" title="Related Transactions">
            <Card>
              <Card.Header>
                <h6 className="mb-0">Related Transactions</h6>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table className="table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Date</th>
                        <th>Service</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Relationship</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extendedTransaction.related_transactions.map((related, index) => (
                        <tr key={index}>
                          <td><code>{related.reference}</code></td>
                          <td>{related.date}</td>
                          <td>
                            <Badge bg={getServiceBadgeVariant(related.service as Transaction['service'])}>
                              {related.service}
                            </Badge>
                          </td>
                          <td>{related.amount}</td>
                          <td>
                            <Badge bg={getStatusBadgeVariant(related.status as Transaction['status'])}>
                              {related.status}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="outline-secondary" style={{fontSize: '11px'}}>
                              {related.relationship.replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary" onClick={() => onDownloadReceipt && onDownloadReceipt(transaction)}>
          <IconifyIcon icon="ri:download-2-line" className="me-1" />
          Download Receipt
        </Button>
        {transaction.status === 'completed' && (
          <Button variant="outline-warning" onClick={() => onRefund && onRefund(transaction)}>
            <IconifyIcon icon="ri:arrow-go-back-line" className="me-1" />
            Initiate Refund
          </Button>
        )}
        {transaction.status === 'failed' && (
          <Button variant="outline-info" onClick={() => onResend && onResend(transaction)}>
            <IconifyIcon icon="ri:refresh-line" className="me-1" />
            Retry Transaction
          </Button>
        )}
        <Button variant="primary">
          <IconifyIcon icon="ri:customer-service-2-line" className="me-1" />
          Contact Support
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionDetailsModal;
