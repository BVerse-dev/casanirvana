"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Nav, Spinner } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ExpressPayCatalogSyncNotice from '../components/ExpressPayCatalogSyncNotice';
import ProviderManagementTable from './components/ProviderManagementTable';
import AirtimeTransactionsTable from './components/AirtimeTransactionsTable';
import AirtimeMetricCard from './components/AirtimeMetricCard';
import AirtimeProviderPerformance from './components/AirtimeProviderPerformance';
import AirtimeSuccessRateChart from './components/AirtimeSuccessRateChart';
import { useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';
import { useAirtimeService } from '@/hooks/useAirtimeService';

const AirtimeServicesPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'transactions'>('overview');
  const [syncFeedback, setSyncFeedback] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);
  const { metrics, loading, error, refetch } = useAirtimeService();
  const { providers: catalogProviders, syncCatalog, isSyncing } = useAdminPersonalHubCatalog({
    serviceType: 'airtime',
  });

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `GH₵${num.toLocaleString()}`;

  const handleSyncCatalog = async () => {
    try {
      const result = await syncCatalog();
      await refetch();
      setSyncFeedback({
        variant: 'success',
        message: `ExpressPay airtime catalog synced successfully. Imported ${result.data.imported_count} provider records.`,
      });
    } catch (syncError) {
      setSyncFeedback({
        variant: 'danger',
        message: syncError instanceof Error ? syncError.message : 'Failed to sync ExpressPay airtime catalog.',
      });
    }
  };

  return (
    <>
      <PageTitle title="Airtime Services" subName="Management Dashboard" />

      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            className="nav-bordered"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as 'overview' | 'providers' | 'transactions')}
          >
            <Nav.Item>
              <Nav.Link eventKey="overview">
                <IconifyIcon icon="ri:dashboard-line" className="me-1" /> Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="providers">
                <IconifyIcon icon="ri:store-2-line" className="me-1" /> Providers
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="transactions">
                <IconifyIcon icon="ri:exchange-dollar-line" className="me-1" /> Transactions
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
        description="Airtime providers in this workspace are sourced from the cached ExpressPay Bill Payments catalog. Manual provider creation is disabled so the user app, backend, and admin surfaces stay on one provider contract."
        secondaryNote="Use catalog sync after ExpressPay enables, disables, or changes supported airtime services for your merchant profile."
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
                <AirtimeMetricCard
                  title="Total Transactions"
                  value={formatNumber(metrics?.totalTransactions || 0)}
                  growth={`+${metrics?.growth?.transactions || 0}%`}
                  icon="ri:exchange-dollar-line"
                  variant="primary"
                />
              </Col>
              <Col xl={3} md={6}>
                <AirtimeMetricCard
                  title="Revenue"
                  value={formatCurrency(metrics?.revenue || 0)}
                  growth={`+${metrics?.growth?.revenue || 0}%`}
                  icon="ri:money-dollar-circle-line"
                  variant="success"
                />
              </Col>
              <Col xl={3} md={6}>
                <AirtimeMetricCard
                  title="Success Rate"
                  value={`${(metrics?.successRate || 0).toFixed(1)}%`}
                  growth={`+${metrics?.growth?.successRate || 0}%`}
                  icon="ri:check-double-line"
                  variant="info"
                />
              </Col>
              <Col xl={3} md={6}>
                <AirtimeMetricCard
                  title="Active Providers"
                  value={String(metrics?.activeProviders || 0)}
                  growth="0%"
                  icon="ri:store-2-line"
                  variant="warning"
                />
              </Col>
            </Row>
          )}

          <Row>
            <Col xl={8}>
              <AirtimeProviderPerformance />
            </Col>
            <Col xl={4}>
              <AirtimeSuccessRateChart />
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
              <AirtimeTransactionsTable limit={5} />
            </Card.Body>
          </Card>
        </>
      )}

      {activeTab === 'providers' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Network Providers</Card.Title>
          </Card.Header>
          <Card.Body>
            <ProviderManagementTable />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Airtime Transactions</Card.Title>
          </Card.Header>
          <Card.Body>
            <AirtimeTransactionsTable showFilters={true} />
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default AirtimeServicesPage;
