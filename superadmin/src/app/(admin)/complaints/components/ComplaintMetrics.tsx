"use client";
import React from "react";
import { Card, CardBody, Col } from "react-bootstrap";
import { useComplaintMetrics } from "@/hooks/useComplaints";

const ComplaintMetrics = () => {
  const { data: metrics, isLoading } = useComplaintMetrics();

  if (isLoading || !metrics) {
    return (
      <>
        {[1, 2, 3, 4].map((_, index) => (
          <Col xl={3} lg={6} key={index}>
            <Card className="card-height-100">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="placeholder-glow">
                      <span className="placeholder col-8"></span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="avatar-sm bg-light rounded">
                      <div className="placeholder-glow">
                        <span className="placeholder col-12 h-100"></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-4">
                  <div>
                    <div className="placeholder-glow">
                      <span className="placeholder col-6"></span>
                    </div>
                    <div className="placeholder-glow mt-2">
                      <span className="placeholder col-4"></span>
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

  const metricCards = [
    {
      title: "Total Complaints",
      value: metrics.total.toString(),
      change: metrics.recentComplaints > 0 ? `+${metrics.recentComplaints} this week` : "0 this week",
      changeType: metrics.recentComplaints > 0 ? "increase" : "neutral",
      icon: "ri:feedback-line",
      color: "primary",
      bgColor: "primary-subtle",
    },
    {
      title: "Resolution Rate",
      value: `${metrics.resolutionRate}%`,
      change: `${metrics.resolved}/${metrics.total} resolved`,
      changeType: metrics.resolutionRate >= 80 ? "increase" : metrics.resolutionRate >= 60 ? "neutral" : "decrease",
      icon: "ri:check-double-line",
      color: "success",
      bgColor: "success-subtle",
    },
    {
      title: "In Progress",
      value: metrics.inProgress.toString(),
      change: `${metrics.pending} pending`,
      changeType: metrics.inProgress > 0 ? "warning" : "success",
      icon: "ri:time-line",
      color: "info",
      bgColor: "info-subtle",
    },
    {
      title: "High Priority",
      value: metrics.high.toString(),
      change: metrics.high > 0 ? `${metrics.high} urgent` : "No urgent items",
      changeType: metrics.high > 0 ? "warning" : "success",
      icon: "ri:alarm-warning-line",
      color: "warning",
      bgColor: "warning-subtle",
    },
  ];

  return (
    <>
      {metricCards.map((metric, index) => (
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
                  <span className={`badge bg-${
                    metric.changeType === 'increase' ? 'success' : 
                    metric.changeType === 'decrease' ? 'danger' : 
                    metric.changeType === 'warning' ? 'warning' : 
                    'secondary'
                  }-subtle text-${
                    metric.changeType === 'increase' ? 'success' : 
                    metric.changeType === 'decrease' ? 'danger' : 
                    metric.changeType === 'warning' ? 'warning' : 
                    'secondary'
                  } mb-0 fs-11`}>
                    {metric.changeType === 'increase' && (
                      <i className="ri:arrow-up-line align-middle"></i>
                    )}
                    {metric.changeType === 'decrease' && (
                      <i className="ri:arrow-down-line align-middle"></i>
                    )}
                    {metric.changeType === 'warning' && (
                      <i className="ri:alert-line align-middle"></i>
                    )}{" "}
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

export default ComplaintMetrics;
