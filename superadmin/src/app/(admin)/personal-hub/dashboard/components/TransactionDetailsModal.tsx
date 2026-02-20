"use client";

import React from 'react';
import { Modal, Button, Row, Col, Badge, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface Transaction {
  id: string;
  user: {
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  service: 'Airtime' | 'Data' | 'Money Transfer' | 'Bill Payment' | 'Marketplace';
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  time: string;
  // Extended details for modal
  description?: string;
  provider?: string;
  reference?: string;
  fee?: string;
  netAmount?: string;
  paymentMethod?: string;
  recipient?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  metadata?: {
    [key: string]: any;
  };
  timeline?: {
    timestamp: string;
    status: string;
    description: string;
  }[];
}

interface TransactionDetailsModalProps {
  show: boolean;
  onHide: () => void;
  transaction: Transaction | null;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ 
  show, 
  onHide, 
  transaction 
}) => {
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
      default:
        return 'secondary';
    }
  };

  // Get service icon
  const getServiceIcon = (service: Transaction['service']) => {
    switch (service) {
      case 'Airtime':
        return 'ri:smartphone-line';
      case 'Data':
        return 'ri:wifi-line';
      case 'Money Transfer':
        return 'ri:exchange-dollar-line';
      case 'Bill Payment':
        return 'ri:bill-line';
      case 'Marketplace':
        return 'ri:store-2-line';
      default:
        return 'ri:question-line';
    }
  };

  // Mock extended data for the transaction
  const extendedTransaction = {
    ...transaction,
    description: `${transaction.service} transaction for ${transaction.user.name}`,
    provider: transaction.service === 'Airtime' ? 'MTN' : 
              transaction.service === 'Data' ? 'Airtel Data' :
              transaction.service === 'Money Transfer' ? 'WorldRemit' :
              transaction.service === 'Bill Payment' ? 'Electricity Company' :
              'Casa Nirvana Store',
    reference: `REF-${transaction.id}`,
    fee: transaction.service === 'Money Transfer' ? '$2.50' : '$0.50',
    netAmount: transaction.service === 'Money Transfer' ? '$147.50' : 
               parseFloat(transaction.amount.replace('$', '')) - 0.50,
    paymentMethod: 'Mobile Money',
    recipient: transaction.service === 'Money Transfer' ? {
      name: 'Sarah Johnson',
      phone: '+233 24 123 4567',
      email: 'sarah.johnson@email.com'
    } : undefined,
    timeline: [
      {
        timestamp: `${transaction.date} ${transaction.time}`,
        status: 'initiated',
        description: 'Transaction initiated by user'
      },
      {
        timestamp: `${transaction.date} ${transaction.time}`,
        status: 'processing',
        description: 'Payment processing with provider'
      },
      ...(transaction.status === 'completed' ? [{
        timestamp: `${transaction.date} ${transaction.time}`,
        status: 'completed',
        description: 'Transaction completed successfully'
      }] : transaction.status === 'failed' ? [{
        timestamp: `${transaction.date} ${transaction.time}`,
        status: 'failed',
        description: 'Transaction failed - insufficient balance'
      }] : [])
    ]
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon={getServiceIcon(transaction.service)} className="me-2" />
          Transaction Details - {transaction.id}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Transaction Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(transaction.status)} className="px-3 py-2">
              <IconifyIcon 
                icon={transaction.status === 'completed' ? 'ri:check-line' : 
                      transaction.status === 'pending' ? 'ri:time-line' : 
                      'ri:close-line'} 
                className="me-1" 
              />
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
          </div>
          <h4 className="mb-1">{transaction.amount}</h4>
          <p className="text-muted mb-0">{extendedTransaction.description}</p>
        </div>

        <Row>
          {/* Transaction Details */}
          <Col md={6}>
            <h6 className="mb-3">Transaction Information</h6>
            <Table className="table-borderless mb-4">
              <tbody>
                <tr>
                  <td className="fw-semibold">Transaction ID:</td>
                  <td>{transaction.id}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Reference:</td>
                  <td>{extendedTransaction.reference}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Service:</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <IconifyIcon icon={getServiceIcon(transaction.service)} className="me-1" />
                      {transaction.service}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="fw-semibold">Provider:</td>
                  <td>{extendedTransaction.provider}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Amount:</td>
                  <td>{transaction.amount}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Fee:</td>
                  <td>{extendedTransaction.fee}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Net Amount:</td>
                  <td className="fw-bold">${extendedTransaction.netAmount}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Payment Method:</td>
                  <td>{extendedTransaction.paymentMethod}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Date & Time:</td>
                  <td>
                    {transaction.date}<br />
                    <small className="text-muted">{transaction.time}</small>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>

          {/* User & Recipient Details */}
          <Col md={6}>
            <h6 className="mb-3">Customer Information</h6>
            <div className="d-flex align-items-center mb-3 p-3 border rounded">
              <div className="avatar-md rounded-circle bg-light me-3">
                {transaction.user.avatar ? (
                  <img 
                    src={transaction.user.avatar} 
                    alt={transaction.user.name} 
                    className="img-fluid rounded-circle" 
                    height="48"
                  />
                ) : (
                  <span className="avatar-title rounded-circle">
                    {transaction.user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h6 className="mb-1">{transaction.user.name}</h6>
                <p className="text-muted mb-0">
                  {transaction.user.email || 'customer@email.com'}<br />
                  <small>{transaction.user.phone || '+233 24 000 0000'}</small>
                </p>
              </div>
            </div>

            {/* Recipient Info for Money Transfer */}
            {extendedTransaction.recipient && (
              <>
                <h6 className="mb-3">Recipient Information</h6>
                <div className="p-3 border rounded mb-3">
                  <h6 className="mb-1">{extendedTransaction.recipient.name}</h6>
                  <p className="text-muted mb-0">
                    {extendedTransaction.recipient.email}<br />
                    <small>{extendedTransaction.recipient.phone}</small>
                  </p>
                </div>
              </>
            )}
          </Col>
        </Row>

        {/* Transaction Timeline */}
        <div className="mt-4">
          <h6 className="mb-3">Transaction Timeline</h6>
          <div className="timeline">
            {extendedTransaction.timeline.map((event, index) => (
              <div key={index} className="d-flex mb-3">
                <div className="flex-shrink-0">
                  <div 
                    className={`avatar-sm rounded-circle d-flex align-items-center justify-content-center ${
                      event.status === 'completed' ? 'bg-success' :
                      event.status === 'failed' ? 'bg-danger' :
                      event.status === 'processing' ? 'bg-warning' :
                      'bg-info'
                    }`}
                  >
                    <IconifyIcon 
                      icon={
                        event.status === 'completed' ? 'ri:check-line' :
                        event.status === 'failed' ? 'ri:close-line' :
                        event.status === 'processing' ? 'ri:loader-2-line' :
                        'ri:play-line'
                      } 
                      className="text-white" 
                    />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1 text-capitalize">{event.status}</h6>
                  <p className="text-muted mb-0">{event.description}</p>
                  <small className="text-muted">{event.timestamp}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => window.print()}>
          <IconifyIcon icon="ri:printer-line" className="me-1" />
          Print Receipt
        </Button>
        {transaction.status === 'failed' && (
          <Button variant="warning">
            <IconifyIcon icon="ri:repeat-line" className="me-1" />
            Retry Transaction
          </Button>
        )}
        {transaction.status === 'completed' && (
          <Button variant="danger">
            <IconifyIcon icon="ri:refund-2-line" className="me-1" />
            Process Refund
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionDetailsModal;
