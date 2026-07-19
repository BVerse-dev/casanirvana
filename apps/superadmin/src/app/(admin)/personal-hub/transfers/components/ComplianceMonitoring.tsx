'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { PersonalHubReportTransaction, PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import TransactionDetailsModal from '../../reports/components/TransactionDetailsModal';

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

const HIGH_VALUE_THRESHOLD = 5000;
const STALE_PENDING_MS = 6 * 60 * 60 * 1000;

type MonitoringRow = {
  transaction: PersonalHubReportTransaction;
  reasons: string[];
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

const ComplianceMonitoring = () => {
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');
  const [selectedTransaction, setSelectedTransaction] = useState<PersonalHubReportTransaction | null>(null);
  const { transactions, loading, error, refreshReports } = usePersonalHubReports({
    period,
    serviceTypes: ['money_transfer'],
    limit: 250,
  });

  const monitoringRows = useMemo<MonitoringRow[]>(() => {
    const now = Date.now();

    return transactions
      .map((transaction) => {
        const reasons: string[] = [];
        const createdAt = transaction.created_at ? new Date(transaction.created_at).getTime() : NaN;

        if (transaction.status === 'pending' && Number.isFinite(createdAt) && now - createdAt > STALE_PENDING_MS) {
          reasons.push('Pending longer than 6 hours');
        }
        if (transaction.status === 'failed') {
          reasons.push('Provider or settlement failure');
        }
        if (transaction.amount >= HIGH_VALUE_THRESHOLD) {
          reasons.push(`High-value transfer (GH₵${transaction.amount.toLocaleString('en-GH')})`);
        }
        if (!transaction.recipient_name && !transaction.recipient_identifier) {
          reasons.push('Recipient details missing from normalized record');
        }

        return reasons.length > 0 ? { transaction, reasons } : null;
      })
      .filter((row): row is MonitoringRow => Boolean(row));
  }, [transactions]);

  const stalePendingCount = monitoringRows.filter((row) => row.reasons.some((reason) => reason.includes('6 hours'))).length;
  const failedCount = monitoringRows.filter((row) => row.reasons.some((reason) => reason.includes('failure'))).length;
  const highValueCount = monitoringRows.filter((row) => row.reasons.some((reason) => reason.includes('High-value'))).length;
  const missingDataCount = monitoringRows.filter((row) => row.reasons.some((reason) => reason.includes('Recipient details missing'))).length;

  return (
    <Card>
      <Card.Header className="d-flex flex-wrap align-items-center gap-3">
        <div>
          <Card.Title className="mb-0">Transfer Operational Monitoring</Card.Title>
        </div>
        <div className="ms-auto d-flex align-items-center gap-2">
          <Form.Select value={period} onChange={(event) => setPeriod(event.target.value as PersonalHubReportsPeriod)} style={{ minWidth: 180 }}>
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
          <Button variant="light" onClick={() => refreshReports()}>
            <IconifyIcon icon="ri:refresh-line" className="me-1" /> Refresh
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Alert variant="light" className="border mb-3">
          <div className="d-flex align-items-start gap-2">
            <IconifyIcon icon="ri:shield-check-line" className="fs-5 mt-1 text-primary" />
            <div>
              This workspace is observational. KYC, AML, and rail-specific enforcement are performed by the upstream provider and ExpressPay. The table below highlights transfer records that still need human review because they are stale, failed, unusually large, or missing normalized recipient context.
            </div>
          </div>
        </Alert>

        <Row className="g-3 mb-3">
          <Col xl={3} md={6}><Card className="border h-100"><Card.Body><div className="text-muted small mb-1">Stale pending</div><div className="fs-4 fw-semibold">{stalePendingCount.toLocaleString('en-GH')}</div></Card.Body></Card></Col>
          <Col xl={3} md={6}><Card className="border h-100"><Card.Body><div className="text-muted small mb-1">Failed transfers</div><div className="fs-4 fw-semibold">{failedCount.toLocaleString('en-GH')}</div></Card.Body></Card></Col>
          <Col xl={3} md={6}><Card className="border h-100"><Card.Body><div className="text-muted small mb-1">High-value transfers</div><div className="fs-4 fw-semibold">{highValueCount.toLocaleString('en-GH')}</div></Card.Body></Card></Col>
          <Col xl={3} md={6}><Card className="border h-100"><Card.Body><div className="text-muted small mb-1">Missing recipient context</div><div className="fs-4 fw-semibold">{missingDataCount.toLocaleString('en-GH')}</div></Card.Body></Card></Col>
        </Row>

        {loading && transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading transfer exceptions...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : monitoringRows.length === 0 ? (
          <Alert variant="success" className="mb-0">
            No transfer rows currently meet the operational monitoring thresholds for the selected period.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table className="table-centered align-middle table-nowrap mb-0">
              <thead className="table-light">
                <tr>
                  <th>Created</th>
                  <th>Reference</th>
                  <th>Resident</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Monitoring Flags</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {monitoringRows.map(({ transaction, reasons }) => (
                  <tr key={transaction.id}>
                    <td>{formatDateTime(transaction.created_at)}</td>
                    <td>
                      <div className="fw-semibold">{transaction.transaction_id || transaction.payment_id || transaction.id}</div>
                      <div className="text-muted small">{transaction.recipient_name || transaction.recipient_identifier || 'No recipient detail'}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">{transaction.user.name}</div>
                      <div className="text-muted small">{transaction.community?.name || 'No community'}</div>
                    </td>
                    <td>{transaction.provider || '—'}</td>
                    <td className="fw-semibold">{transaction.amount_formatted}</td>
                    <td>
                      <Badge bg={transaction.status === 'completed' ? 'success' : transaction.status === 'pending' ? 'warning' : 'danger'} className="text-capitalize">
                        {transaction.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {reasons.map((reason) => (
                          <Badge key={reason} bg={reason.includes('High-value') ? 'danger' : reason.includes('missing') ? 'secondary' : 'warning'}>
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-end">
                      <Button variant="light" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" /> Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
      <TransactionDetailsModal
        show={Boolean(selectedTransaction)}
        onHide={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </Card>
  );
};

export default ComplianceMonitoring;
