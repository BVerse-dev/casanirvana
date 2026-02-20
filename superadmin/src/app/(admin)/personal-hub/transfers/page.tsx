"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Nav, Spinner } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Components
import TransferMetricCard from './components/TransferMetricCard';
import TransferServicesTable from './components/TransferServicesTable';
import TransferTransactionsTable from './components/TransferTransactionsTable';
import TransferVolumeChart from './components/TransferVolumeChart';
import TransferCorridorChart from './components/TransferCorridorChart';
import ComplianceMonitoring from './components/ComplianceMonitoring';
import AddServiceModal from './components/AddServiceModal';
// Hook
import { useMoneyTransferService } from '@/hooks/useMoneyTransferService';

const MoneyTransferPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'transactions' | 'compliance'>('overview');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editService, setEditService] = useState(null);

  // Fetch metrics from database
  const { metrics, loading, error } = useMoneyTransferService();

  // Format helpers
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `₦${num.toLocaleString()}`;

  return (
    <>
      <PageTitle title="Money Transfer" subName="Management Dashboard" />

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
                <IconifyIcon icon="ri:shield-check-line" className="me-1" /> Compliance
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

          {/* Charts and analytics */}
          <Row>
            <Col xl={8}>
              <TransferVolumeChart />
            </Col>
            <Col xl={4}>
              <TransferCorridorChart />
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
              <TransferTransactionsTable limit={5} />
            </Card.Body>
          </Card>
        </>
      )}

      {activeTab === 'services' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Transfer Services</Card.Title>
            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
              onClick={() => {
                setEditService(null);
                setShowAddServiceModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Service
            </Button>
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

      {activeTab === 'compliance' && (
        <ComplianceMonitoring />
      )}

      {/* Add/Edit Service Modal */}
      <AddServiceModal
        show={showAddServiceModal}
        onHide={() => setShowAddServiceModal(false)}
        onSave={handleSaveService}
        editService={editService}
      />
    </>
  );

  // Handler for saving service data
  function handleSaveService(serviceData: any) {
    // In a real application, this would call an API to save the service
    console.log('Saving transfer service:', serviceData);

    // For now, just show a success message
    alert(editService
      ? `Service ${serviceData.name} updated successfully!`
      : `Service ${serviceData.name} added successfully!`
    );
  }
};

export default MoneyTransferPage;
