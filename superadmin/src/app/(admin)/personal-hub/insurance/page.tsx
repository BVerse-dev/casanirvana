"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Nav, Spinner } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Components
import InsuranceMetricCard from './components/InsuranceMetricCard';
import InsuranceProviderTable from './components/InsuranceProviderTable';
import PolicyManagementTable from './components/PolicyManagementTable';
import ClaimsManagementTable from './components/ClaimsManagementTable';
import InsuranceDistributionChart from './components/InsuranceDistributionChart';
import ClaimsAnalyticsChart from './components/ClaimsAnalyticsChart';
import AddProviderModal from './components/AddProviderModal';
// Hook
import { useInsuranceService } from '@/hooks/useInsuranceService';

const InsuranceServicesPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'policies' | 'claims'>('overview');
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [editProvider, setEditProvider] = useState(null);

  // Fetch metrics from database
  const { metrics, loading, error } = useInsuranceService();

  // Format helpers
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `₦${num.toLocaleString()}`;

  return (
    <>
      <PageTitle title="Insurance Services" subName="Management Dashboard" />

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
                <IconifyIcon icon="ri:building-4-line" className="me-1" /> Insurance Providers
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="policies">
                <IconifyIcon icon="ri:file-shield-line" className="me-1" /> Policies
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="claims">
                <IconifyIcon icon="ri:hand-coin-line" className="me-1" /> Claims
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
                <InsuranceMetricCard
                  title="Total Transactions"
                  value={formatNumber(metrics?.totalTransactions || 0)}
                  growth={`+${metrics?.growth?.transactions || 0}%`}
                  icon="ri:file-shield-line"
                  variant="primary"
                />
              </Col>
              <Col xl={3} md={6}>
                <InsuranceMetricCard
                  title="Premium Value"
                  value={formatCurrency(metrics?.revenue || 0)}
                  growth={`+${metrics?.growth?.revenue || 0}%`}
                  icon="ri:money-dollar-circle-line"
                  variant="success"
                />
              </Col>
              <Col xl={3} md={6}>
                <InsuranceMetricCard
                  title="Success Rate"
                  value={`${(metrics?.successRate || 0).toFixed(1)}%`}
                  growth={`+${metrics?.growth?.successRate || 0}%`}
                  icon="ri:check-double-line"
                  variant="warning"
                />
              </Col>
              <Col xl={3} md={6}>
                <InsuranceMetricCard
                  title="Active Providers"
                  value={String(metrics?.activeProviders || 0)}
                  growth="0%"
                  icon="ri:percent-line"
                  variant="info"
                />
              </Col>
            </Row>
          )}

          {/* Charts and analytics */}
          <Row>
            <Col xl={8}>
              <ClaimsAnalyticsChart />
            </Col>
            <Col xl={4}>
              <InsuranceDistributionChart />
            </Col>
          </Row>

          {/* Recent policies and claims */}
          <Row>
            <Col xl={6}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <Card.Title className="mb-0">Recent Policies</Card.Title>
                  <Button
                    variant="link"
                    className="p-0 ms-auto"
                    onClick={() => setActiveTab('policies')}
                  >
                    View All <IconifyIcon icon="ri:arrow-right-line" />
                  </Button>
                </Card.Header>
                <Card.Body>
                  <PolicyManagementTable limit={5} />
                </Card.Body>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <Card.Title className="mb-0">Recent Claims</Card.Title>
                  <Button
                    variant="link"
                    className="p-0 ms-auto"
                    onClick={() => setActiveTab('claims')}
                  >
                    View All <IconifyIcon icon="ri:arrow-right-line" />
                  </Button>
                </Card.Header>
                <Card.Body>
                  <ClaimsManagementTable limit={5} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'providers' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Insurance Providers</Card.Title>
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
            <InsuranceProviderTable />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'policies' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Policy Management</Card.Title>
          </Card.Header>
          <Card.Body>
            <PolicyManagementTable showFilters={true} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'claims' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Claims Processing</Card.Title>
          </Card.Header>
          <Card.Body>
            <ClaimsManagementTable showFilters={true} />
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
    console.log('Saving insurance provider:', providerData);

    // For now, just show a success message
    alert(editProvider
      ? `Provider ${providerData.name} updated successfully!`
      : `Provider ${providerData.name} added successfully!`
    );
  }
};

export default InsuranceServicesPage;
