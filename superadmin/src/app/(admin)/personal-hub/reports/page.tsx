'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Nav, Row, Spinner } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ServiceMetricCard from '../dashboard/components/ServiceMetricCard';
import {
  PersonalHubExportFormat,
} from './components/ExportOptionsModal';
import AdvancedFiltersModal, { PersonalHubAdvancedFilters } from './components/AdvancedFiltersModal';
import ExportOptionsModal from './components/ExportOptionsModal';
import TransactionReportTable from './components/TransactionReportTable';
import RevenueByServiceChart from './components/RevenueByServiceChart';
import UserEngagementChart from './components/UserEngagementChart';
import ServiceUptimeChart from './components/ServiceUptimeChart';
import ErrorRateChart from './components/ErrorRateChart';
import ServiceAdoptionChart from './components/ServiceAdoptionChart';
import { PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
  { value: '365', label: '12 Months' },
];

const createCsvRow = (columns: string[]) =>
  columns
    .map((column) => {
      const value = column ?? '';
      const escaped = value.replaceAll('"', '""');
      return `"${escaped}"`;
    })
    .join(',');

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const PersonalHubReportsPage = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'financial' | 'engagement' | 'performance'>('transactions');
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<PersonalHubAdvancedFilters>({
    serviceTypes: [],
    statuses: [],
    providers: [],
    minAmount: '',
    maxAmount: '',
  });

  const {
    summary,
    filters,
    transactions,
    transactionsTotal,
    transactionsReturned,
    transactionsTruncated,
    charts,
    currencySymbol,
    loading,
    error,
    refreshReports,
  } = usePersonalHubReports({
    period,
    serviceTypes: advancedFilters.serviceTypes,
    statuses: advancedFilters.statuses,
    providers: advancedFilters.providers,
    search,
    minAmount: advancedFilters.minAmount,
    maxAmount: advancedFilters.maxAmount,
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (advancedFilters.serviceTypes.length > 0) count += 1;
    if (advancedFilters.statuses.length > 0) count += 1;
    if (advancedFilters.providers.length > 0) count += 1;
    if (advancedFilters.minAmount.trim() || advancedFilters.maxAmount.trim()) count += 1;
    return count;
  }, [advancedFilters, search]);

  const clearAllFilters = () => {
    setSearch('');
    setDraftSearch('');
    setAdvancedFilters({
      serviceTypes: [],
      statuses: [],
      providers: [],
      minAmount: '',
      maxAmount: '',
    });
  };

  const handleExport = (format: PersonalHubExportFormat) => {
    const filenameDate = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      downloadFile(
        JSON.stringify(
          {
            generated_at: new Date().toISOString(),
            period,
            filters: {
              search,
              ...advancedFilters,
            },
            summary,
            transactions,
          },
          null,
          2
        ),
        `personal-hub-report-${filenameDate}.json`,
        'application/json'
      );
      return;
    }

    const header = createCsvRow([
      'Reference',
      'Payment Record',
      'Service',
      'Provider',
      'Recipient',
      'Amount',
      'Status',
      'Resident',
      'Email',
      'Community',
      'Unit',
      'Created At',
      'Updated At',
    ]);
    const rows = transactions.map((transaction) =>
      createCsvRow([
        transaction.transaction_id || transaction.id,
        transaction.payment_id || '',
        transaction.service,
        transaction.provider || '',
        transaction.recipient_name || transaction.recipient_identifier || '',
        transaction.amount_formatted,
        transaction.status,
        transaction.user.name,
        transaction.user.email || '',
        transaction.community?.name || '',
        transaction.unit?.block ? `${transaction.unit.block}-${transaction.unit.number || ''}` : transaction.unit?.number || '',
        transaction.created_at || '',
        transaction.updated_at || '',
      ])
    );

    downloadFile([header, ...rows].join('\n'), `personal-hub-report-${filenameDate}.csv`, 'text/csv;charset=utf-8;');
  };

  if (loading && !summary) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 360 }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Unable to load Personal Hub reports</Alert.Heading>
        <p className="mb-0">{error}</p>
      </Alert>
    );
  }

  return (
    <>
      <PageTitle title="Personal Hub" subName="Reports and analytics across resident service activity" />

      <Card className="mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center gap-2">
          <div className="d-flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={period === option.value ? 'primary' : 'light'}
                size="sm"
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="ms-auto d-flex flex-wrap align-items-center gap-2">
            <Form.Control
              type="search"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Search reference, resident, provider, recipient..."
              style={{ minWidth: 280 }}
            />
            <Button variant="light" size="sm" onClick={() => setSearch(draftSearch.trim())}>
              <IconifyIcon icon="ri:search-line" className="me-1" />
              Search
            </Button>
            <Button variant="light" size="sm" onClick={() => setShowFiltersModal(true)}>
              <IconifyIcon icon="ri:filter-3-line" className="me-1" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="light" size="sm" onClick={clearAllFilters}>
                Clear
              </Button>
            )}
            <Button variant="light" size="sm" onClick={() => refreshReports()}>
              <IconifyIcon icon="ri:refresh-line" className="me-1" />
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowExportModal(true)}>
              <IconifyIcon icon="ri:download-2-line" className="me-1" />
              Export
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col xl={3} md={6}>
          <ServiceMetricCard
            title="Total Transactions"
            value={summary?.total_transactions_formatted || '0'}
            trend={summary?.growth.total_transactions ?? null}
            icon="ri:exchange-dollar-line"
            variant="primary"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard
            title="Total Volume"
            value={summary?.total_volume_formatted || `${currencySymbol}0`}
            trend={summary?.growth.total_volume ?? null}
            icon="ri:money-dollar-circle-line"
            variant="success"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard
            title="Active Users"
            value={summary?.active_users_formatted || '0'}
            trend={summary?.growth.active_users ?? null}
            icon="ri:user-heart-line"
            variant="info"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard
            title="Success Rate"
            value={summary?.average_success_rate_formatted || '0.0%'}
            trend={summary?.growth.average_success_rate ?? null}
            icon="ri:pulse-line"
            variant="warning"
          />
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            className="nav-bordered"
            activeKey={activeTab}
            onSelect={(value) => setActiveTab((value as typeof activeTab) || 'transactions')}
          >
            <Nav.Item>
              <Nav.Link eventKey="transactions">
                <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                Transactions
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="financial">
                <IconifyIcon icon="ri:bar-chart-grouped-line" className="me-1" />
                Financial
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="engagement">
                <IconifyIcon icon="ri:user-heart-line" className="me-1" />
                Engagement
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="performance">
                <IconifyIcon icon="ri:dashboard-line" className="me-1" />
                Performance
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {activeTab === 'transactions' && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <div>
              <h4 className="mb-1">Transaction Report</h4>
              <p className="text-muted mb-0">Resident-facing Personal Hub transactions across the selected reporting window.</p>
            </div>
            <div className="text-muted small">
              {transactionsTotal.toLocaleString('en-GH')} filtered result{transactionsTotal === 1 ? '' : 's'}
            </div>
          </Card.Header>
          <Card.Body>
            <TransactionReportTable
              transactions={transactions}
              transactionsTotal={transactionsTotal}
              transactionsReturned={transactionsReturned}
              transactionsTruncated={transactionsTruncated}
            />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'financial' && (
        <Row>
          <Col xl={8}>
            <Card>
              <Card.Header>
                <h4 className="mb-1">Revenue by Service</h4>
                <p className="text-muted mb-0">Gross Personal Hub transaction volume grouped by service.</p>
              </Card.Header>
              <Card.Body>
                <RevenueByServiceChart items={charts?.revenue_by_service || []} currencySymbol={currencySymbol} />
              </Card.Body>
            </Card>
          </Col>
          <Col xl={4}>
            <Card>
              <Card.Header>
                <h4 className="mb-1">Current Financial Snapshot</h4>
                <p className="text-muted mb-0">Key outcomes for the active reporting window.</p>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="text-muted small">Successful Transactions</div>
                    <div className="fw-semibold fs-5">{summary?.successful_transactions_formatted || '0'}</div>
                  </div>
                  <div>
                    <div className="text-muted small">Failed Transactions</div>
                    <div className="fw-semibold fs-5">{summary?.failed_transactions_formatted || '0'}</div>
                  </div>
                  <div>
                    <div className="text-muted small">Loaded Export Rows</div>
                    <div className="fw-semibold fs-5">{transactionsReturned.toLocaleString('en-GH')}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === 'engagement' && (
        <Row>
          <Col xl={8}>
            <Card>
              <Card.Header>
                <h4 className="mb-1">User Engagement Trend</h4>
                <p className="text-muted mb-0">Active users and transaction volume over the selected period.</p>
              </Card.Header>
              <Card.Body>
                <UserEngagementChart items={charts?.user_engagement || []} />
              </Card.Body>
            </Card>
          </Col>
          <Col xl={4}>
            <Card>
              <Card.Header>
                <h4 className="mb-1">Service Adoption</h4>
                <p className="text-muted mb-0">How widely each Personal Hub service is being used.</p>
              </Card.Header>
              <Card.Body>
                <ServiceAdoptionChart items={charts?.service_adoption || []} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === 'performance' && (
        <Row>
          <Col xl={6}>
            <Card>
              <Card.Header>
                <h4 className="mb-1">Service Success Rate</h4>
                <p className="text-muted mb-0">Terminal success percentage by service in the selected period.</p>
              </Card.Header>
              <Card.Body>
                <ServiceUptimeChart items={charts?.service_performance || []} />
              </Card.Body>
            </Card>
          </Col>
          <Col xl={6}>
            <Card>
              <Card.Header>
                <h4 className="mb-1">Service Failure Rate</h4>
                <p className="text-muted mb-0">Observed failed transaction percentage by service.</p>
              </Card.Header>
              <Card.Body>
                <ErrorRateChart items={charts?.service_performance || []} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <AdvancedFiltersModal
        show={showFiltersModal}
        onHide={() => setShowFiltersModal(false)}
        onApplyFilters={setAdvancedFilters}
        currentFilters={advancedFilters}
        options={filters?.options || { services: [], statuses: [], providers: [] }}
      />

      <ExportOptionsModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        onExport={handleExport}
        transactionsTotal={transactionsTotal}
        transactionsReturned={transactionsReturned}
        transactionsTruncated={transactionsTruncated}
      />
    </>
  );
};

export default PersonalHubReportsPage;
