"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Nav, Spinner } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
// Components
import ProviderManagementTable from './components/ProviderManagementTable';
import AirtimeTransactionsTable from './components/AirtimeTransactionsTable';
import AirtimeMetricCard from './components/AirtimeMetricCard';
import AirtimeProviderPerformance from './components/AirtimeProviderPerformance';
import AirtimeSuccessRateChart from './components/AirtimeSuccessRateChart';
import AddProviderModal from './components/AddProviderModal';
// Hook
import { useAirtimeService } from '@/hooks/useAirtimeService';

const AirtimeServicesPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'transactions'>('overview');
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [editProvider, setEditProvider] = useState(null);

  // Fetch metrics from database
  const { metrics, loading, error } = useAirtimeService();

  // Format number with commas
  const formatNumber = (num: number) => num.toLocaleString();
  // Format currency
  const formatCurrency = (num: number) => `₦${num.toLocaleString()}`;

  return (
    <>
      <PageTitle title="Airtime Services" subName="Management Dashboard" />

      {/* Top navigation tabs */}
      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            className="nav-bordered"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as any)}
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

      {activeTab === 'overview' && (
        <>
          {/* Key metrics */}
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

          {/* Charts and analytics */}
          <Row>
            <Col xl={8}>
              <AirtimeProviderPerformance />
            </Col>
            <Col xl={4}>
              <AirtimeSuccessRateChart />
            </Col>
          </Row>

          {/* Recent transactions preview */}
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
            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
              onClick={() => {
                setEditProvider(null);
                setShowAddProviderModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Provider
            </Button>
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

      {/* Add/Edit Provider Modal */}
      <AddProviderModal
        show={showAddProviderModal}
        onHide={() => setShowAddProviderModal(false)}
        onSave={handleSaveProvider}
        editProvider={editProvider}
      />
    </>
  );

  // Handler for saving provider data
  function handleSaveProvider(providerData: any) {
    // In a real application, this would call an API to save the provider
    console.log('Saving provider data:', providerData);

    // For now, just show a success message
    alert(editProvider
      ? `Provider ${providerData.name} updated successfully!`
      : `Provider ${providerData.name} added successfully!`
    );
  }
};

export default AirtimeServicesPage;
