"use client";
import React from "react";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { useListPayments } from "@/hooks/usePayments";

const PaymentMetrics = () => {
  const { data: payments = [], isLoading } = useListPayments();

  // Calculate real metrics from payment data
  const calculateMetrics = () => {
    if (!payments.length) return null;

    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const completedPayments = payments.filter(p => p.status === 'completed');
    const avgPayment = completedPayments.length > 0 
      ? totalRevenue / completedPayments.length 
      : 0;

    const collectionRate = payments.length > 0 
      ? (completedPayments.length / payments.length) * 100 
      : 0;

    const failedPayments = payments.filter(p => p.status === 'failed').length;

    // Calculate monthly changes (simplified - comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentPayments = payments.filter(p => 
      p.payment_date && new Date(p.payment_date) >= thirtyDaysAgo
    );
    const previousPayments = payments.filter(p => 
      p.payment_date && 
      new Date(p.payment_date) >= sixtyDaysAgo && 
      new Date(p.payment_date) < thirtyDaysAgo
    );

    const recentRevenue = recentPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const previousRevenue = previousPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const revenueChange = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const recentAvg = recentPayments.length > 0 
      ? recentRevenue / recentPayments.filter(p => p.status === 'completed').length 
      : 0;
    const previousAvg = previousPayments.length > 0 
      ? previousRevenue / previousPayments.filter(p => p.status === 'completed').length 
      : 0;

    const avgPaymentChange = previousAvg > 0 
      ? ((recentAvg - previousAvg) / previousAvg) * 100 
      : 0;

    const recentCollectionRate = recentPayments.length > 0 
      ? (recentPayments.filter(p => p.status === 'completed').length / recentPayments.length) * 100 
      : 0;
    const previousCollectionRate = previousPayments.length > 0 
      ? (previousPayments.filter(p => p.status === 'completed').length / previousPayments.length) * 100 
      : 0;

    const collectionRateChange = previousCollectionRate > 0 
      ? recentCollectionRate - previousCollectionRate 
      : 0;

    const recentFailedCount = recentPayments.filter(p => p.status === 'failed').length;
    const previousFailedCount = previousPayments.filter(p => p.status === 'failed').length;
    const failedPaymentChange = recentFailedCount - previousFailedCount;

    return {
      totalRevenue,
      avgPayment,
      collectionRate,
      failedPayments,
      revenueChange,
      avgPaymentChange,
      collectionRateChange,
      failedPaymentChange
    };
  };

  const metrics = calculateMetrics();

  // Show loading state
  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((index) => (
          <Col xl={3} lg={6} key={index}>
            <Card className="card-height-100">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="placeholder-glow">
                      <span className="placeholder col-6"></span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="placeholder-glow">
                      <span className="placeholder col-12" style={{height: '48px', width: '48px', borderRadius: '50%'}}></span>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-4">
                  <div>
                    <div className="placeholder-glow">
                      <span className="placeholder col-8"></span>
                      <span className="placeholder col-6"></span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </>
    );
  }

  // Show empty state if no metrics
  if (!metrics) {
    return (
      <>
        {[1, 2, 3, 4].map((index) => (
          <Col xl={3} lg={6} key={index}>
            <Card className="card-height-100">
              <CardBody className="text-center">
                <p className="text-muted">No payment data available</p>
              </CardBody>
            </Card>
          </Col>
        ))}
      </>
    );
  }

  const metricsData = [
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      change: `${metrics.revenueChange >= 0 ? '+' : ''}${metrics.revenueChange.toFixed(1)}%`,
      changeType: metrics.revenueChange >= 0 ? "increase" : "decrease",
      icon: "ri:money-dollar-circle-line",
      color: "success",
      bgColor: "success-subtle",
    },
    {
      title: "Avg Payment",
      value: `$${metrics.avgPayment.toLocaleString()}`,
      change: `${metrics.avgPaymentChange >= 0 ? '+' : ''}${metrics.avgPaymentChange.toFixed(1)}%`,
      changeType: metrics.avgPaymentChange >= 0 ? "increase" : "decrease", 
      icon: "ri:calculator-line",
      color: "info",
      bgColor: "info-subtle",
    },
    {
      title: "Collection Rate",
      value: `${metrics.collectionRate.toFixed(1)}%`,
      change: `${metrics.collectionRateChange >= 0 ? '+' : ''}${metrics.collectionRateChange.toFixed(1)}%`,
      changeType: metrics.collectionRateChange >= 0 ? "increase" : "decrease",
      icon: "ri:percent-line",
      color: "warning",
      bgColor: "warning-subtle",
    },
    {
      title: "Failed Payments",
      value: metrics.failedPayments.toString(),
      change: `${metrics.failedPaymentChange >= 0 ? '+' : ''}${metrics.failedPaymentChange}`,
      changeType: metrics.failedPaymentChange <= 0 ? "increase" : "decrease", // Less failed is good
      icon: "ri:error-warning-line",
      color: "danger",
      bgColor: "danger-subtle",
    },
  ];

  return (
    <>
      {metricsData.map((metric, index) => (
        <Col xl={3} lg={6} key={index}>
          <Card className="card-height-100">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-uppercase fw-medium text-muted mb-0">
                    {metric.title}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`avatar-sm bg-${metric.bgColor} rounded d-flex align-items-center justify-content-center`}>
                    <i className={`${metric.icon} text-${metric.color} fs-22 d-flex align-items-center justify-content-center`} style={{ width: '100%', height: '100%' }}></i>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-2">
                    {metric.value}
                  </h4>
                  <span className={`badge bg-${metric.changeType === 'increase' ? 'success' : 'danger'}-subtle text-${metric.changeType === 'increase' ? 'success' : 'danger'} mb-0 fs-11`}>
                    <i className={`ri:arrow-${metric.changeType === 'increase' ? 'up' : 'down'}-line align-middle`}></i>{" "}
                    {metric.change}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </>
  );
};

export default PaymentMetrics;
