'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TransactionReportTable from '../reports/components/TransactionReportTable';
import { PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';

type PersonalHubServiceType = 'airtime' | 'data' | 'bill_payment' | 'money_transfer' | 'insurance';

interface PersonalHubServiceTransactionsTableProps {
  serviceType: PersonalHubServiceType;
  showFilters?: boolean;
  limit?: number;
  description?: string;
}

const SERVICE_LABELS: Record<PersonalHubServiceType, string> = {
  airtime: 'airtime',
  data: 'data',
  bill_payment: 'bill payments',
  money_transfer: 'money transfers',
  insurance: 'insurance premium payments',
};

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

const DEFAULT_PREVIEW_FETCH_LIMIT = 12;
const DEFAULT_FULL_FETCH_LIMIT = 250;

const PersonalHubServiceTransactionsTable = ({
  serviceType,
  showFilters = false,
  limit,
  description,
}: PersonalHubServiceTransactionsTableProps) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [provider, setProvider] = useState('all');
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');

  const fetchLimit = showFilters
    ? DEFAULT_FULL_FETCH_LIMIT
    : Math.max(limit ?? DEFAULT_PREVIEW_FETCH_LIMIT, DEFAULT_PREVIEW_FETCH_LIMIT);

  const {
    transactions,
    transactionsTotal,
    transactionsReturned,
    transactionsTruncated,
    filters,
    loading,
    error,
    refreshReports,
  } = usePersonalHubReports({
    period,
    serviceTypes: [serviceType],
    statuses: status === 'all' ? [] : [status],
    providers: provider === 'all' ? [] : [provider],
    search,
    limit: fetchLimit,
  });

  const displayTransactions = useMemo(() => {
    if (showFilters || !limit) {
      return transactions;
    }

    return transactions.slice(0, limit);
  }, [limit, showFilters, transactions]);

  const providerOptions = filters?.options.providers ?? [];
  const statusOptions = filters?.options.statuses ?? [];
  const showPreviewLimitNote = !showFilters && Boolean(limit) && transactions.length > displayTransactions.length;

  return (
    <>
      {description ? (
        <Alert variant="light" className="border mb-3">
          <div className="d-flex align-items-start gap-2">
            <IconifyIcon icon="ri:information-line" className="fs-5 mt-1 text-primary" />
            <div>{description}</div>
          </div>
        </Alert>
      ) : null}

      {showFilters ? (
        <Card className="mb-3">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col xl={4} md={6}>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <Form.Control
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Reference, resident, recipient, provider..."
                    />
                    <Button variant="light" onClick={() => refreshReports()}>
                      <IconifyIcon icon="ri:search-line" />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xl={2} md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="all">All statuses</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xl={3} md={6}>
                <Form.Group>
                  <Form.Label>Provider</Form.Label>
                  <Form.Select value={provider} onChange={(event) => setProvider(event.target.value)}>
                    <option value="all">All providers</option>
                    {providerOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xl={2} md={6}>
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
              <Col xl={1} md={12}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearch('');
                    setStatus('all');
                    setProvider('all');
                    setPeriod('30');
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : null}

      {loading && transactions.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading {SERVICE_LABELS[serviceType]}...
        </div>
      ) : error ? (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center gap-3">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={() => refreshReports()}>
            Retry
          </Button>
        </Alert>
      ) : displayTransactions.length === 0 ? (
        <div className="py-5 text-center text-muted">
          <IconifyIcon icon="ri:file-search-line" className="fs-2 d-block mb-2" />
          No {SERVICE_LABELS[serviceType]} match the current filters.
        </div>
      ) : (
        <>
          {showPreviewLimitNote ? (
            <div className="text-muted small mb-2">
              Showing the newest {displayTransactions.length.toLocaleString('en-GH')} rows in this overview card.
            </div>
          ) : null}
          <TransactionReportTable
            transactions={displayTransactions}
            transactionsTotal={showFilters ? transactionsTotal : displayTransactions.length}
            transactionsReturned={showFilters ? transactionsReturned : displayTransactions.length}
            transactionsTruncated={showFilters ? transactionsTruncated : false}
            showServiceColumn={false}
          />
        </>
      )}
    </>
  );
};

export default PersonalHubServiceTransactionsTable;
