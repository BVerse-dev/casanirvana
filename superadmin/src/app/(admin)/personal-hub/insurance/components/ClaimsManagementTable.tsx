'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TransactionReportTable from '../../reports/components/TransactionReportTable';
import { PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import { useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';

interface ClaimsManagementTableProps {
  showFilters?: boolean;
  limit?: number;
}

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

const ClaimsManagementTable = ({ showFilters = false, limit }: ClaimsManagementTableProps) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'failed'>('all');
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');
  const { providers } = useAdminPersonalHubCatalog({ serviceType: 'insurance' });
  const {
    transactions,
    loading,
    error,
    refreshReports,
  } = usePersonalHubReports({
    period,
    serviceTypes: ['insurance'],
    statuses: status === 'all' ? [] : [status],
    search,
    limit: showFilters ? 250 : Math.max(limit ?? 5, 12),
  });

  const followUpTransactions = useMemo(() => {
    const rows = transactions.filter((transaction) => transaction.status !== 'completed');
    if (!showFilters && limit) {
      return rows.slice(0, limit);
    }
    return rows;
  }, [limit, showFilters, transactions]);

  const pendingCount = transactions.filter((transaction) => transaction.status === 'pending').length;
  const failedCount = transactions.filter((transaction) => transaction.status === 'failed').length;
  const completedCount = transactions.filter((transaction) => transaction.status === 'completed').length;
  const activeProviders = providers.filter((provider) => provider.is_enabled_for_app && provider.is_active).length;

  return (
    <>
      <Alert variant="light" className="border mb-3">
        <div className="d-flex align-items-start gap-2">
          <IconifyIcon icon="ri:information-line" className="fs-5 mt-1 text-primary" />
          <div>
            ExpressPay currently gives Casa Nirvana a premium-collection rail for insurance services. Claim filing and adjudication are not integrated into the platform, so this workspace tracks insurance payments that still need provider follow-up instead of pretending there is a live claims engine.
          </div>
        </div>
      </Alert>

      <Row className="g-3 mb-3">
        <Col xl={3} md={6}>
          <Card className="border h-100">
            <Card.Body>
              <div className="text-muted small mb-1">Active insurers</div>
              <div className="fs-4 fw-semibold">{activeProviders.toLocaleString('en-GH')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border h-100">
            <Card.Body>
              <div className="text-muted small mb-1">Pending follow-up</div>
              <div className="fs-4 fw-semibold">{pendingCount.toLocaleString('en-GH')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border h-100">
            <Card.Body>
              <div className="text-muted small mb-1">Failed payments</div>
              <div className="fs-4 fw-semibold">{failedCount.toLocaleString('en-GH')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border h-100">
            <Card.Body>
              <div className="text-muted small mb-1">Completed premium payments</div>
              <div className="fs-4 fw-semibold">{completedCount.toLocaleString('en-GH')}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showFilters ? (
        <Card className="mb-3">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col xl={6} md={6}>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <Form.Control
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Reference, resident, provider..."
                    />
                    <Button variant="light" onClick={() => refreshReports()}>
                      <IconifyIcon icon="ri:search-line" />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xl={3} md={3}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={status} onChange={(event) => setStatus(event.target.value as 'all' | 'pending' | 'failed')}>
                    <option value="all">Pending and failed</option>
                    <option value="pending">Pending only</option>
                    <option value="failed">Failed only</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xl={3} md={3}>
                <Form.Group>
                  <Form.Label>Period</Form.Label>
                  <Form.Select value={period} onChange={(event) => setPeriod(event.target.value as PersonalHubReportsPeriod)}>
                    {PERIOD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : null}

      {loading && transactions.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading insurance follow-up items...
        </div>
      ) : error ? (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center gap-3">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={() => refreshReports()}>
            Retry
          </Button>
        </Alert>
      ) : followUpTransactions.length === 0 ? (
        <Alert variant="success" className="mb-0">
          No insurance payment rows currently require provider follow-up for the selected period.
        </Alert>
      ) : (
        <TransactionReportTable
          transactions={followUpTransactions}
          transactionsTotal={followUpTransactions.length}
          transactionsReturned={followUpTransactions.length}
          transactionsTruncated={false}
          showServiceColumn={false}
        />
      )}
    </>
  );
};

export default ClaimsManagementTable;
