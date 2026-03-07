'use client';

import React from 'react';
import { Alert, Badge, Card, Col, Modal, Row, Table } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { PersonalHubReportTransaction } from '@/hooks/usePersonalHubReports';

interface TransactionDetailsModalProps {
  show: boolean;
  onHide: () => void;
  transaction: PersonalHubReportTransaction | null;
}

const STATUS_META: Record<PersonalHubReportTransaction['status'], { bg: string; icon: string; note: string }> = {
  completed: {
    bg: 'success',
    icon: 'ri:checkbox-circle-line',
    note: 'This transaction completed successfully and is already reflected in Personal Hub reporting.',
  },
  pending: {
    bg: 'warning',
    icon: 'ri:time-line',
    note: 'This transaction is still awaiting a terminal provider outcome and should be monitored until it settles.',
  },
  failed: {
    bg: 'danger',
    icon: 'ri:error-warning-line',
    note: 'This transaction ended in a failure state. Investigate provider response details before retry guidance is issued.',
  },
};

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const TransactionDetailsModal = ({ show, onHide, transaction }: TransactionDetailsModalProps) => {
  if (!transaction) {
    return null;
  }

  const statusMeta = STATUS_META[transaction.status];
  const unitDisplay = transaction.unit?.block
    ? `${transaction.unit.block}-${transaction.unit.number || '—'}`
    : transaction.unit?.number || '—';

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <IconifyIcon icon="ri:file-list-3-line" />
          Personal Hub Transaction
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant={statusMeta.bg} className="d-flex align-items-start gap-2">
          <IconifyIcon icon={statusMeta.icon} className="mt-1" />
          <div>
            <div className="fw-semibold mb-1">
              {transaction.service} · {transaction.amount_formatted}
            </div>
            <div>{statusMeta.note}</div>
          </div>
        </Alert>

        <Row className="g-3 mb-3">
          <Col md={6}>
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">Transaction Context</h5>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0 align-middle">
                  <tbody>
                    <tr>
                      <td className="text-muted ps-0">Reference</td>
                      <td className="fw-semibold text-end pe-0">{transaction.transaction_id || transaction.payment_id || transaction.id}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Payment Record</td>
                      <td className="text-end pe-0">{transaction.payment_id || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Service</td>
                      <td className="text-end pe-0">{transaction.service}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Provider</td>
                      <td className="text-end pe-0">{transaction.provider || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Recipient</td>
                      <td className="text-end pe-0">{transaction.recipient_name || transaction.recipient_identifier || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Status</td>
                      <td className="text-end pe-0">
                        <Badge bg={statusMeta.bg} className="text-capitalize">
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">Resident Context</h5>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0 align-middle">
                  <tbody>
                    <tr>
                      <td className="text-muted ps-0">Resident</td>
                      <td className="fw-semibold text-end pe-0">{transaction.user.name}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Email</td>
                      <td className="text-end pe-0">{transaction.user.email || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Phone</td>
                      <td className="text-end pe-0">{transaction.user.phone || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Community</td>
                      <td className="text-end pe-0">{transaction.community?.name || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Unit</td>
                      <td className="text-end pe-0">{unitDisplay}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Amount</td>
                      <td className="fw-semibold text-end pe-0">{transaction.amount_formatted}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Header>
            <h5 className="mb-0">Lifecycle</h5>
          </Card.Header>
          <Card.Body>
            <Table className="table-borderless mb-0 align-middle">
              <tbody>
                <tr>
                  <td className="text-muted ps-0">Created</td>
                  <td className="text-end pe-0">{formatDateTime(transaction.created_at)}</td>
                </tr>
                <tr>
                  <td className="text-muted ps-0">Last Updated</td>
                  <td className="text-end pe-0">{formatDateTime(transaction.updated_at)}</td>
                </tr>
                <tr>
                  <td className="text-muted ps-0">Raw Status</td>
                  <td className="text-end pe-0 text-capitalize">{transaction.raw_status || '—'}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default TransactionDetailsModal;
