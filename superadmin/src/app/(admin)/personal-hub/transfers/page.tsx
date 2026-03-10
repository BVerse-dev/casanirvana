"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Nav, Spinner } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ExpressPayCatalogSyncNotice from '../components/ExpressPayCatalogSyncNotice';
import TransferMetricCard from './components/TransferMetricCard';
import TransferServicesTable from './components/TransferServicesTable';
import TransferTransactionsTable from './components/TransferTransactionsTable';
import TransferVolumeChart from './components/TransferVolumeChart';
import TransferCorridorChart from './components/TransferCorridorChart';
import ComplianceMonitoring from './components/ComplianceMonitoring';
import { useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';
import { useMoneyTransferService } from '@/hooks/useMoneyTransferService';

const MoneyTransferPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'transactions' | 'compliance'>('overview');
  const [syncFeedback, setSyncFeedback] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);
  const { metrics, loading, error, refetch } = useMoneyTransferService();
  const { providers: catalogProviders, syncCatalog, isSyncing } = useAdminPersonalHubCatalog({
    serviceType: 'money_transfer',
  });

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `GH₵${num.toLocaleString()}`;

  const handleSyncCatalog = async () => {
    try {
      const result = await syncCatalog();
      await refetch();
      setSyncFeedback({
        variant: 'success',
        message: `ExpressPay money-transfer catalog synced successfully. Imported ${result.data.imported_count} provider records.`,
      });
    } catch (syncError) {
      setSyncFeedback({
        variant: 'danger',
        message: syncError instanceof Error ? syncError.message : 'Failed to sync ExpressPay money-transfer catalog.',
      });
    }
  };

  return (
    <>
      <PageTitle title="Money Transfer" subName="Management Dashboard" />

      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            className="nav-bordered"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as 'overview' | 'services' | 'transactions' | 'compliance')}
          >
            <Nav.Item>
              <Nav.Link eventKey="overview">
                <IconifyIcon icon="ri:dashboard-line" className="me-1" /> Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="services">
                <IconifyIcon icon="ri:bank-line" className="me-1" /> Transfer Services
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="transactions">
                <IconifyIcon icon="ri:exchange-dollar-line" className="me-1" /> Transactions
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="compliance">
                <IconifyIcon icon="ri:shield-check-line" className="me-1" /> Operational Monitoring
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      <ExpressPayCatalogSyncNotice
        providers={catalogProviders}
        isSyncing={isSyncing}
        onSync={handleSyncCatalog}
        feedback={syncFeedback}
        description="Transfer services in this workspace are sourced from the cached ExpressPay Bill Payments catalog. Manual transfer-service creation is disabled so the user app and backend only expose flows that ExpressPay currently supports for your merchant profile."
        secondaryNote="Use catalog sync when ExpressPay enables or retires transfer rails such as mobile-money or bank transfer services."
      />

      {activeTab === 'overview' && (
        <>
          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <Row>
              <Col xl={3} md={6}>
                <TransferMetricCard
                  title="Total Transactions"
                  value={formatNumber(metrics?.totalTransactions || 0)}
                  growth={`+${metrics?.growth?.transactions || 0}%`}
                  icon="ri:exchange-dollar-line"
                  variant="primary"
                />
              </Col>
              <Col xl={3} md={6}>
                <TransferMetricCard
                  title="Volume"
                  value={formatCurrency(metrics?.revenue || 0)}
                  growth={`+${metrics?.growth?.revenue || 0}%`}
                  icon="ri:money-dollar-circle-line"
                  variant="success"
                />
              </Col>
              <Col xl={3} md={6}>
                <TransferMetricCard
                  title="Success Rate"
                  value={`${(metrics?.successRate || 0).toFixed(1)}%`}
                  growth={`+${metrics?.growth?.successRate || 0}%`}
                  icon="ri:check-double-line"
                  variant="info"
                />
              </Col>
              <Col xl={3} md={6}>
                <TransferMetricCard
                  title="Active Services"
                  value={String(metrics?.activeProviders || 0)}
                  growth="0%"
                  icon="ri:bank-line"
                  variant="warning"
                />
              </Col>
            </Row>
          )}

          <Row>
            <Col xl={8}>
              <TransferVolumeChart />
            </Col>
            <Col xl={4}>
              <TransferCorridorChart />
            </Col>
          </Row>

          <Card>
            <Card.Header className="d-flex align-items-center">
              <Card.Title className="mb-0">Recent Transactions</Card.Title>
              <Button
                variant="link"
                className="p-0 ms-auto"
                onClick={() => setActiveTab('transactions')}
              >
                View All <IconifyIcon icon="ri:arrow-right-line" />
              </Button>
            </Card.Header>
            <Card.Body>
              <TransferTransactionsTable limit={5} />
            </Card.Body>
          </Card>
        </>
      )}

      {activeTab === 'services' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Transfer Services</Card.Title>
          </Card.Header>
          <Card.Body>
            <TransferServicesTable />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Money Transfer Transactions</Card.Title>
          </Card.Header>
          <Card.Body>
            <TransferTransactionsTable showFilters={true} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'compliance' && <ComplianceMonitoring />}
    </>
  );
};

export default MoneyTransferPage;
