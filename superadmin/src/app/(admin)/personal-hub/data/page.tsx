"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Nav, Spinner } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
// Components
import DataMetricCard from './components/DataMetricCard';
import ProviderManagementTable from './components/ProviderManagementTable';
import DataPackagesTable from './components/DataPackagesTable';
import DataTransactionsTable from './components/DataTransactionsTable';
import DataUsageChart from './components/DataUsageChart';
import DataPackagePopularityChart from './components/DataPackagePopularityChart';
import AddProviderModal from './components/AddProviderModal';
import AddPackageModal from './components/AddPackageModal';
// Hook
import { useDataService } from '@/hooks/useDataService';

const DataServicesPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'packages' | 'transactions'>('overview');
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [editProvider, setEditProvider] = useState(null);
  const [editPackage, setEditPackage] = useState(null);

  // Fetch metrics from database
  const { metrics, providers, loading, error } = useDataService();

  // Format helpers
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `₦${num.toLocaleString()}`;

  return (
    <>
      <PageTitle title="Data Services" subName="Management Dashboard" />

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

          {/* Charts and analytics */}
          <Row>
            <Col xl={8}>
              <DataUsageChart />
            </Col>
            <Col xl={4}>
              <DataPackagePopularityChart />
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
              <DataTransactionsTable limit={5} />
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

      {activeTab === 'packages' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Data Packages</Card.Title>
            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
              onClick={() => {
                setEditPackage(null);
                setShowAddPackageModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Package
            </Button>
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

      {/* Add/Edit Provider Modal */}
      <AddProviderModal
        show={showAddProviderModal}
        onHide={() => setShowAddProviderModal(false)}
        onSave={handleSaveProvider}
        editProvider={editProvider}
      />

      {/* Add/Edit Package Modal */}
      <AddPackageModal
        show={showAddPackageModal}
        onHide={() => setShowAddPackageModal(false)}
        onSave={handleSavePackage}
        editPackage={editPackage}
        providers={providers.map(p => ({ id: p.id, name: p.provider_name }))}
      />
    </>
  );

  // Handler for saving provider data
  function handleSaveProvider(providerData: any) {
    // In a real application, this would call an API to save the provider
    console.log('Saving data provider:', providerData);

    // For now, just show a success message
    alert(editProvider
      ? `Provider ${providerData.name} updated successfully!`
      : `Provider ${providerData.name} added successfully!`
    );
  }

  // Handler for saving package data
  function handleSavePackage(packageData: any) {
    // In a real application, this would call an API to save the package
    console.log('Saving data package:', packageData);

    // For now, just show a success message
    alert(editPackage
      ? `Package ${packageData.name} updated successfully!`
      : `Package ${packageData.name} added successfully!`
    );
  }
};

export default DataServicesPage;
