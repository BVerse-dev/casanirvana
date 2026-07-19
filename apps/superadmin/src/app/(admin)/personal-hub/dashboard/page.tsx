"use client";

import React, { useState } from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';

import ServiceMetricCard from './components/ServiceMetricCard';
import TransactionActivityChart from './components/TransactionActivityChart';
import ServicePopularityChart from './components/ServicePopularityChart';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import SystemAlertsPanel from './components/SystemAlertsPanel';
import { PersonalHubDashboardPeriod, usePersonalHubDashboard } from '@/hooks/usePersonalHubDashboard';

const PersonalHubDashboard = () => {
  const [period, setPeriod] = useState<PersonalHubDashboardPeriod>('30');
  const { metrics, serviceMetrics, currencySymbol, loading, error } = usePersonalHubDashboard(period);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }

  return (
    <>
      <PageTitle title="Personal Hub" subName="Operational performance across resident services" />

      <Row>
        <Col xl={3} md={6}>
          <ServiceMetricCard 
            title="Total Transactions" 
            value={metrics?.totalTransactionsFormatted || '0'}
            trend={metrics?.growth.totalTransactions ?? null}
            icon="ri:exchange-dollar-line"
            variant="primary"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard 
            title="Total Volume" 
            value={metrics?.totalVolumeFormatted || `${currencySymbol}0`}
            trend={metrics?.growth.totalVolume ?? null}
            icon="ri:money-dollar-circle-line"
            variant="success"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard 
            title="Total Commission" 
            value={metrics?.totalCommissionFormatted || `${currencySymbol}0`}
            trend={metrics?.growth.totalCommission ?? null}
            icon="ri:wallet-line"
            variant="info"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard 
            title="Success Rate" 
            value={metrics?.averageSuccessRateFormatted || '0.0%'}
            trend={metrics?.growth.averageSuccessRate ?? null}
            icon="ri:pulse-line"
            variant="warning"
          />
        </Col>
      </Row>

      <Row>
        <Col xl={8}>
          <TransactionActivityChart
            data={metrics?.dailyTrends || []}
            period={period}
            onPeriodChange={setPeriod}
            currencySymbol={currencySymbol}
          />
        </Col>
        <Col xl={4}>
          <ServicePopularityChart serviceMetrics={serviceMetrics} />
        </Col>
      </Row>

      <Row>
        <Col xl={8}>
          <RecentTransactionsTable transactions={metrics?.recentTransactions || []} />
        </Col>
        <Col xl={4}>
          <SystemAlertsPanel alerts={metrics?.alerts || []} />
        </Col>
      </Row>
    </>
  );
};

export default PersonalHubDashboard;
