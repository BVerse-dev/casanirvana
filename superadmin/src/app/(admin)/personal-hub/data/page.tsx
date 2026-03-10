"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Nav, Spinner } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ExpressPayCatalogSyncNotice from '../components/ExpressPayCatalogSyncNotice';
import DataMetricCard from './components/DataMetricCard';
import ProviderManagementTable from './components/ProviderManagementTable';
import DataPackagesTable from './components/DataPackagesTable';
import DataTransactionsTable from './components/DataTransactionsTable';
import DataUsageChart from './components/DataUsageChart';
import DataPackagePopularityChart from './components/DataPackagePopularityChart';
import { useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';
import { useDataService } from '@/hooks/useDataService';

const DataServicesPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'packages' | 'transactions'>('overview');
  const [syncFeedback, setSyncFeedback] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);
  const { metrics, loading, error, refetch } = useDataService();
  const { providers: catalogProviders, syncCatalog, isSyncing } = useAdminPersonalHubCatalog({
    serviceType: 'data',
  });

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `GH₵${num.toLocaleString()}`;

  const handleSyncCatalog = async () => {
    try {
      const result = await syncCatalog();
      await refetch();
      setSyncFeedback({
        variant: 'success',
        message: `ExpressPay data catalog synced successfully. Imported ${result.data.imported_count} provider records.`,
      });
    } catch (syncError) {
      setSyncFeedback({
        variant: 'danger',
        message: syncError instanceof Error ? syncError.message : 'Failed to sync ExpressPay data catalog.',
      });
    }
  };

  return (
    <>
      <PageTitle title="Data Services" subName="Management Dashboard" />

      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            className="nav-bordered"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as 'overview' | 'providers' | 'packages' | 'transactions')}
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
              <Nav.Link eventKey="packages">
                <IconifyIcon icon="ri:box-3-line" className="me-1" /> Packages
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
        description="Data providers in this workspace are sourced from the cached ExpressPay Bill Payments catalog. Manual provider creation is disabled so package availability stays aligned with the live ExpressPay service contract."
        secondaryNote="Package lists should be treated as provider query results. Use catalog sync when ExpressPay updates supported data services for your merchant profile."
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
                <DataMetricCard
                  title="Total Transactions"
                  value={formatNumber(metrics?.totalTransactions || 0)}
                  growth={`+${metrics?.growth?.transactions || 0}%`}
                  icon="ri:exchange-dollar-line"
                  variant="primary"
                />
              </Col>
              <Col xl={3} md={6}>
                <DataMetricCard
                  title="Revenue"
                  value={formatCurrency(metrics?.revenue || 0)}
                  growth={`+${metrics?.growth?.revenue || 0}%`}
                  icon="ri:money-dollar-circle-line"
                  variant="success"
                />
              </Col>
              <Col xl={3} md={6}>
                <DataMetricCard
                  title="Success Rate"
                  value={`${(metrics?.successRate || 0).toFixed(1)}%`}
                  growth={`+${metrics?.growth?.successRate || 0}%`}
                  icon="ri:check-double-line"
                  variant="info"
                />
              </Col>
              <Col xl={3} md={6}>
                <DataMetricCard
                  title="Active Providers"
                  value={String(metrics?.activeProviders || 0)}
                  growth="0%"
                  icon="ri:box-3-line"
                  variant="warning"
                />
              </Col>
            </Row>
          )}

          <Row>
            <Col xl={8}>
              <DataUsageChart />
            </Col>
            <Col xl={4}>
              <DataPackagePopularityChart />
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
              <DataTransactionsTable limit={5} />
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

      {activeTab === 'packages' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Data Packages</Card.Title>
            <span className="ms-auto text-muted small">Package options are sourced from ExpressPay query responses.</span>
          </Card.Header>
          <Card.Body>
            <DataPackagesTable />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Data Transactions</Card.Title>
          </Card.Header>
          <Card.Body>
            <DataTransactionsTable showFilters={true} />
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default DataServicesPage;
