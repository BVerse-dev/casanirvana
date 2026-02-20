"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Nav, Spinner } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Components
import BillMetricCard from './components/BillMetricCard';
import BillerManagementTable from './components/BillerManagementTable';
import BillTransactionsTable from './components/BillTransactionsTable';
import BillPaymentTrendsChart from './components/BillPaymentTrendsChart';
import BillCategoryDistributionChart from './components/BillCategoryDistributionChart';
import PaymentValidationRules from './components/PaymentValidationRules';
import AddBillerModal from './components/AddBillerModal';
// Hook
import { useBillPaymentService } from '@/hooks/useBillPaymentService';

const BillPaymentPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billers' | 'transactions' | 'validation'>('overview');
  const [showAddBillerModal, setShowAddBillerModal] = useState(false);
  const [editBiller, setEditBiller] = useState(null);

  // Fetch metrics from database
  const { metrics, loading, error } = useBillPaymentService();

  // Format helpers
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `₦${num.toLocaleString()}`;

  return (
    <>
      <PageTitle title="Bill Payments" subName="Management Dashboard" />

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
              <Nav.Link eventKey="billers">
                <IconifyIcon icon="ri:building-line" className="me-1" /> Billers
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="transactions">
                <IconifyIcon icon="ri:exchange-dollar-line" className="me-1" /> Transactions
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="validation">
                <IconifyIcon icon="ri:shield-check-line" className="me-1" /> Validation Rules
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
                <BillMetricCard
                  title="Total Transactions"
                  value={formatNumber(metrics?.totalTransactions || 0)}
                  growth={`+${metrics?.growth?.transactions || 0}%`}
                  icon="ri:bill-line"
                  variant="primary"
                />
              </Col>
              <Col xl={3} md={6}>
                <BillMetricCard
                  title="Transaction Volume"
                  value={formatCurrency(metrics?.revenue || 0)}
                  growth={`+${metrics?.growth?.revenue || 0}%`}
                  icon="ri:money-dollar-circle-line"
                  variant="success"
                />
              </Col>
              <Col xl={3} md={6}>
                <BillMetricCard
                  title="Success Rate"
                  value={`${(metrics?.successRate || 0).toFixed(1)}%`}
                  growth={`+${metrics?.growth?.successRate || 0}%`}
                  icon="ri:check-double-line"
                  variant="info"
                />
              </Col>
              <Col xl={3} md={6}>
                <BillMetricCard
                  title="Active Billers"
                  value={String(metrics?.activeProviders || 0)}
                  growth="0%"
                  icon="ri:building-line"
                  variant="warning"
                />
              </Col>
            </Row>
          )}

          {/* Charts and analytics */}
          <Row>
            <Col xl={8}>
              <BillPaymentTrendsChart />
            </Col>
            <Col xl={4}>
              <BillCategoryDistributionChart />
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
              <BillTransactionsTable limit={5} />
            </Card.Body>
          </Card>
        </>
      )}

      {activeTab === 'billers' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Biller Management</Card.Title>
            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
              onClick={() => {
                setEditBiller(null);
                setShowAddBillerModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Biller
            </Button>
          </Card.Header>
          <Card.Body>
            <BillerManagementTable />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Bill Payment Transactions</Card.Title>
          </Card.Header>
          <Card.Body>
            <BillTransactionsTable showFilters={true} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'validation' && (
        <PaymentValidationRules />
      )}

      {/* Add/Edit Biller Modal */}
      <AddBillerModal
        show={showAddBillerModal}
        onHide={() => setShowAddBillerModal(false)}
        onSave={handleSaveBiller}
        editBiller={editBiller}
      />
    </>
  );

  // Handler for saving biller data
  function handleSaveBiller(billerData: any) {
    // In a real application, this would call an API to save the biller
    console.log('Saving biller data:', billerData);

    // For now, just show a success message
    alert(editBiller
      ? `Biller ${billerData.name} updated successfully!`
      : `Biller ${billerData.name} added successfully!`
    );
  }
};

export default BillPaymentPage;
