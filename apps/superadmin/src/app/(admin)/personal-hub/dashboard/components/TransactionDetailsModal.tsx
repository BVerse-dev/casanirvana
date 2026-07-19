"use client";

import React from 'react';
import { Modal, Row, Col, Badge, Table } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import type { PersonalHubDashboardTransaction } from '@/hooks/usePersonalHubDashboard';

interface TransactionDetailsModalProps {
  show: boolean;
  onHide: () => void;
  transaction: PersonalHubDashboardTransaction | null;
}

const statusVariant = (status: PersonalHubDashboardTransaction['status']) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'warning';
  }
};

const serviceIcon = (service: string) => {
  switch (service) {
    case 'Airtime':
      return 'ri:smartphone-line';
    case 'Data':
      return 'ri:wifi-line';
    case 'Money Transfer':
      return 'ri:exchange-dollar-line';
    case 'Bill Payment':
      return 'ri:bill-line';
    case 'Insurance':
      return 'ri:shield-check-line';
    case 'Marketplace':
      return 'ri:store-2-line';
    default:
      return 'ri:question-line';
  }
};

const formatTimestamp = (value: string | null) => {
  if (!value) return 'Not available';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available';

  return parsed.toLocaleString('en-GH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ show, onHide, transaction }) => {
  if (!transaction) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon={serviceIcon(transaction.service)} className="me-2" />
          Personal Hub Transaction Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4 p-3 rounded bg-light-subtle">
          <div className="mb-2">
            <Badge bg={statusVariant(transaction.status)} className="px-3 py-2">
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
          </div>
          <h4 className="mb-1">{transaction.amount_formatted}</h4>
          <p className="text-muted mb-0">{transaction.service}</p>
        </div>

        <Row>
          <Col md={6}>
            <h6 className="mb-3">Transaction Information</h6>
            <Table className="table-borderless mb-4">
              <tbody>
                <tr>
                  <td className="fw-semibold">Transaction ID</td>
                  <td>{transaction.transaction_id || transaction.id}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Payment ID</td>
                  <td>{transaction.payment_id || 'Not linked'}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Provider</td>
                  <td>{transaction.provider || 'Direct service'}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Recipient</td>
                  <td>{transaction.recipient_name || transaction.recipient_identifier || 'Resident initiated flow'}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Created</td>
                  <td>{formatTimestamp(transaction.created_at)}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Updated</td>
                  <td>{formatTimestamp(transaction.updated_at)}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Raw Status</td>
                  <td>{transaction.raw_status || transaction.status}</td>
                </tr>
              </tbody>
            </Table>
          </Col>

          <Col md={6}>
            <h6 className="mb-3">Resident Information</h6>
            <div className="p-3 border rounded mb-3">
              <h6 className="mb-1">{transaction.user.name}</h6>
              <p className="text-muted mb-0">
                {transaction.user.email || 'No email'}
                <br />
                <small>{transaction.user.phone || 'No phone number'}</small>
              </p>
            </div>

            <h6 className="mb-3">Community Context</h6>
            <div className="p-3 border rounded">
              <div className="mb-2">
                <strong>Community:</strong> {transaction.community?.name || 'Not resolved'}
              </div>
              <div>
                <strong>Unit:</strong>{' '}
                {transaction.unit?.block && transaction.unit?.number
                  ? `${transaction.unit.block}-${transaction.unit.number}`
                  : transaction.unit?.number || 'Not resolved'}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default TransactionDetailsModal;
