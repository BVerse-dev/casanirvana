"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Nav, Spinner } from 'react-bootstrap';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ExpressPayCatalogSyncNotice from '../components/ExpressPayCatalogSyncNotice';
import InsuranceMetricCard from './components/InsuranceMetricCard';
import InsuranceProviderTable from './components/InsuranceProviderTable';
import PolicyManagementTable from './components/PolicyManagementTable';
import ClaimsManagementTable from './components/ClaimsManagementTable';
import InsuranceDistributionChart from './components/InsuranceDistributionChart';
import ClaimsAnalyticsChart from './components/ClaimsAnalyticsChart';
import { useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';
import { useInsuranceService } from '@/hooks/useInsuranceService';

const InsuranceServicesPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'policies' | 'claims'>('overview');
  const [syncFeedback, setSyncFeedback] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);
  const { metrics, loading, error, refetch } = useInsuranceService();
  const { providers: catalogProviders, syncCatalog, isSyncing } = useAdminPersonalHubCatalog({
    serviceType: 'insurance',
  });
  const liveInsuranceProviders = catalogProviders.filter(
    (provider) => provider.is_active && provider.is_enabled_for_app && provider.supports_query && provider.supports_pay
  );
  const availabilityAlert = liveInsuranceProviders.length
    ? null
    : {
        variant: 'warning' as const,
        message:
          'The active ExpressPay catalog does not currently expose any live insurance providers for this merchant profile. Keep this workspace for historical premium-payment visibility only, and do not market insurance in the user app until insurers appear in the synced catalog.',
      };

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `GH₵${num.toLocaleString()}`;

  const handleSyncCatalog = async () => {
    try {
      const result = await syncCatalog();
      await refetch();
      setSyncFeedback({
        variant: 'success',
        message: `ExpressPay insurance catalog synced successfully. Imported ${result.data.imported_count} provider records.`,
      });
    } catch (syncError) {
      setSyncFeedback({
        variant: 'danger',
        message: syncError instanceof Error ? syncError.message : 'Failed to sync ExpressPay insurance catalog.',
      });
    }
  };

  return (
    <>
      <PageTitle title="Insurance Services" subName="Management Dashboard" />

      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            className="nav-bordered"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as 'overview' | 'providers' | 'policies' | 'claims')}
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
                <IconifyIcon icon="ri:file-shield-line" className="me-1" /> Policy Payments
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="claims">
                <IconifyIcon icon="ri:hand-coin-line" className="me-1" /> Claims Readiness
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
        availabilityAlert={availabilityAlert}
        description="Insurance providers in this workspace are sourced from the cached ExpressPay Bill Payments catalog. Manual provider creation is disabled so policy validation and payment flows stay aligned with the insurers ExpressPay actually supports."
        secondaryNote="Use catalog sync after ExpressPay updates the insurers or policy-payment services exposed to your merchant profile."
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

          <Row>
            <Col xl={8}>
              <ClaimsAnalyticsChart />
            </Col>
            <Col xl={4}>
              <InsuranceDistributionChart />
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <Card.Title className="mb-0">Recent Policy Payments</Card.Title>
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
                  <Card.Title className="mb-0">Claims Readiness</Card.Title>
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
          </Card.Header>
          <Card.Body>
            <InsuranceProviderTable />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'policies' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Policy Payment Records</Card.Title>
          </Card.Header>
          <Card.Body>
            <PolicyManagementTable showFilters={true} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'claims' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Claims Readiness & Follow-up</Card.Title>
          </Card.Header>
          <Card.Body>
            <ClaimsManagementTable showFilters={true} />
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default InsuranceServicesPage;
