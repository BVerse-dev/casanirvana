"use client";
import React from "react";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { usePaymentAnalyticsSummary } from "@/hooks/usePaymentAnalyticsSummary";

const PaymentMetrics = () => {
  const {
    averageCompletedPayment,
    collectionRateByAmount,
    currentMonthGrowthRate,
    error,
    failedTransactions,
    isLoading,
    statusCounts,
    totalRevenue,
  } = usePaymentAnalyticsSummary();

  const formatAmount = (amount: number) => `GH₵ ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

  if (error) {
    return (
      <Col xl={12}>
        <Card className="card-height-100">
          <CardBody className="text-center text-muted py-4">Payment metrics are unavailable right now.</CardBody>
        </Card>
      </Col>
    );
  }

  // Show empty state if no metrics
  if (statusCounts.completed + statusCounts.inFlight + statusCounts.failed + statusCounts.open === 0) {
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
      value: formatAmount(totalRevenue),
      change:
        currentMonthGrowthRate === null
          ? "No prior month"
          : `${currentMonthGrowthRate >= 0 ? "+" : ""}${currentMonthGrowthRate.toFixed(1)}%`,
      changeType: currentMonthGrowthRate === null || currentMonthGrowthRate >= 0 ? "increase" : "decrease",
      icon: "ri:money-dollar-circle-line",
      color: "success",
      bgColor: "success-subtle",
    },
    {
      title: "Avg Payment",
      value: formatAmount(averageCompletedPayment),
      change: `${statusCounts.completed.toLocaleString()} settled`,
      changeType: "increase",
      icon: "ri:calculator-line",
      color: "info",
      bgColor: "info-subtle",
    },
    {
      title: "Collection Rate",
      value: `${collectionRateByAmount.toFixed(1)}%`,
      change: `${statusCounts.inFlight + statusCounts.open} pending/open`,
      changeType: "increase",
      icon: "ri:percent-line",
      color: "warning",
      bgColor: "warning-subtle",
    },
    {
      title: "Failed Payments",
      value: failedTransactions.toString(),
      change: `${statusCounts.failed} total`,
      changeType: failedTransactions === 0 ? "increase" : "decrease",
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
