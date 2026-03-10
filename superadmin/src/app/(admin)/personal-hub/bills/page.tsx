"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Nav, Spinner } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ExpressPayCatalogSyncNotice from '../components/ExpressPayCatalogSyncNotice';
import BillMetricCard from './components/BillMetricCard';
import BillerManagementTable from './components/BillerManagementTable';
import BillTransactionsTable from './components/BillTransactionsTable';
import BillPaymentTrendsChart from './components/BillPaymentTrendsChart';
import BillCategoryDistributionChart from './components/BillCategoryDistributionChart';
import PaymentValidationRules from './components/PaymentValidationRules';
import { useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';
import { useBillPaymentService } from '@/hooks/useBillPaymentService';

const BillPaymentPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billers' | 'transactions' | 'validation'>('overview');
  const [syncFeedback, setSyncFeedback] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);
  const { metrics, loading, error, refetch } = useBillPaymentService();
  const { providers: catalogProviders, syncCatalog, isSyncing } = useAdminPersonalHubCatalog({
    serviceType: 'bill_payment',
  });

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `GH₵${num.toLocaleString()}`;

  const handleSyncCatalog = async () => {
    try {
      const result = await syncCatalog();
      await refetch();
      setSyncFeedback({
        variant: 'success',
        message: `ExpressPay bill-payment catalog synced successfully. Imported ${result.data.imported_count} provider records.`,
      });
    } catch (syncError) {
      setSyncFeedback({
        variant: 'danger',
        message: syncError instanceof Error ? syncError.message : 'Failed to sync ExpressPay bill-payment catalog.',
      });
    }
  };

  return (
    <>
      <PageTitle title="Bill Payments" subName="Management Dashboard" />

      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            className="nav-bordered"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as 'overview' | 'billers' | 'transactions' | 'validation')}
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
                <IconifyIcon icon="ri:shield-check-line" className="me-1" /> Provider Validation
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
        description="Billers in this workspace are sourced from the cached ExpressPay Bill Payments catalog. Manual biller creation is disabled so utility and TV payment flows stay aligned with provider-supported identifiers and account-query rules."
        secondaryNote="Use catalog sync when ExpressPay updates supported utility, TV, or other bill-payment services for your merchant profile."
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

          <Row>
            <Col xl={8}>
              <BillPaymentTrendsChart />
            </Col>
            <Col xl={4}>
              <BillCategoryDistributionChart />
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
              <BillTransactionsTable limit={5} />
            </Card.Body>
          </Card>
        </>
      )}

      {activeTab === 'billers' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Biller Management</Card.Title>
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

      {activeTab === 'validation' && <PaymentValidationRules />}
    </>
  );
};

export default BillPaymentPage;
