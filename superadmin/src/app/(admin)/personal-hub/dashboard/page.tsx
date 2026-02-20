"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
// Components
import ServiceMetricCard from './components/ServiceMetricCard';
import TransactionActivityChart from './components/TransactionActivityChart';
import ServicePopularityChart from './components/ServicePopularityChart';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import SystemAlertsPanel from './components/SystemAlertsPanel';
// Hooks
import { usePersonalHubDashboard } from '@/hooks/usePersonalHubDashboard';

const PersonalHubDashboard = () => {
  const [period, setPeriod] = useState('30')
  const { metrics, serviceMetrics, loading, error, refreshMetrics } = usePersonalHubDashboard(period)

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
      <PageTitle title="Personal Hub" subName="Service Management Dashboard" />
      
      {/* Key metrics summary */}
      <Row>
        <Col xl={3} md={6}>
          <ServiceMetricCard 
            title="Total Transactions" 
            value={metrics?.totalTransactions.toLocaleString() || '0'} 
            growth="+12.3%"
            icon="ri:exchange-dollar-line"
            variant="primary"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard 
            title="Total Volume" 
            value={`₦${metrics?.totalVolume.toLocaleString() || '0'}`} 
            growth="+8.4%"
            icon="ri:money-dollar-circle-line"
            variant="success"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard 
            title="Total Commission" 
            value={`₦${metrics?.totalCommission.toLocaleString() || '0'}`} 
            growth="+15.7%"
            icon="ri:wallet-line"
            variant="info"
          />
        </Col>
        <Col xl={3} md={6}>
          <ServiceMetricCard 
            title="Success Rate" 
            value={`${metrics?.averageSuccessRate.toFixed(1) || '0'}%`} 
            growth="+0.2%"
            icon="ri:pulse-line"
            variant="warning"
          />
        </Col>
      </Row>
      
      {/* Transaction activity charts */}
      <Row>
        <Col xl={8}>
          <TransactionActivityChart data={metrics?.dailyTrends || []} />
        </Col>
        <Col xl={4}>
          <ServicePopularityChart serviceMetrics={serviceMetrics} />
        </Col>
      </Row>
      
      {/* Recent transactions and alerts */}
      <Row>
        <Col xl={8}>
          <RecentTransactionsTable transactions={metrics?.recentTransactions || []} />
        </Col>
        <Col xl={4}>
          <SystemAlertsPanel />
        </Col>
      </Row>
    </>
  );
};

export default PersonalHubDashboard;
