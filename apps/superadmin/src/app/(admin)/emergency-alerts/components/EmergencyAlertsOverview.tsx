"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardTitle, Col, Row, ProgressBar } from "react-bootstrap";
import { normalizeEmergencyAlertStatus, useListEmergencyAlerts } from "@/hooks/useEmergencyAlerts";
import { getEmergencyAlertTypeMeta, normalizeEmergencyAlertType } from "@/lib/emergencyAlertTypes";

const EmergencyAlertsOverview = () => {
  // Fetch emergency alerts data from the scoped admin API contract.
  const { data: alerts = [], isLoading, error } = useListEmergencyAlerts();

  // Calculate emergency statistics
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter((a) => normalizeEmergencyAlertStatus(a.status) === "active").length;
  const criticalAlerts = alerts.filter((a) => a.priority === "high" || a.priority === "critical").length;
  const pendingAlerts = alerts.filter((a) => normalizeEmergencyAlertStatus(a.status) === "pending").length;
  const resolvedAlerts = alerts.filter((a) => normalizeEmergencyAlertStatus(a.status) === "resolved").length;
  
  // Calculate response metrics (DB-backed, no placeholders)
  const acknowledgedStatuses = new Set(["investigating", "escalated", "resolved"]);
  const acknowledgedAlerts = alerts.filter((alert) =>
    acknowledgedStatuses.has(String(alert.status || "").toLowerCase()),
  ).length;
  const acknowledgedPercentage = totalAlerts > 0 ? (acknowledgedAlerts / totalAlerts) * 100 : 0;

  const responseDurationsMinutes = alerts
    .filter((alert) => normalizeEmergencyAlertStatus(alert.status) === "resolved" && alert.resolved_at)
    .map((alert) => {
      const startedAt = new Date(alert.created_at).getTime();
      const resolvedAt = new Date(alert.resolved_at as string).getTime();
      const deltaMs = resolvedAt - startedAt;
      return Number.isFinite(deltaMs) && deltaMs >= 0 ? deltaMs / 60000 : null;
    })
    .filter((value): value is number => typeof value === "number");

  const averageResponseTimeMinutes =
    responseDurationsMinutes.length > 0
      ? responseDurationsMinutes.reduce((sum, value) => sum + value, 0) /
        responseDurationsMinutes.length
      : null;
  const averageResponseTimeLabel =
    averageResponseTimeMinutes === null ? "N/A" : `${averageResponseTimeMinutes.toFixed(1)}min`;

  // Calculate percentages for progress bars
  const activePercentage = totalAlerts > 0 ? (activeAlerts / totalAlerts) * 100 : 0;
  const criticalPercentage = totalAlerts > 0 ? (criticalAlerts / totalAlerts) * 100 : 0;
  const pendingPercentage = totalAlerts > 0 ? (pendingAlerts / totalAlerts) * 100 : 0;

  // Get alert type breakdown
  const alertTypeCounts = alerts.reduce((acc, alert) => {
    const normalizedType = normalizeEmergencyAlertType(alert.alert_type);
    acc[normalizedType] = (acc[normalizedType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topAlertTypes = Object.entries(alertTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // Show loading state
  if (isLoading) {
    return (
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="bg-gradient-emergency text-white border-0 shadow-lg">
            <CardBody className="p-4 text-center">
              <div className="d-flex align-items-center justify-content-center">
                <div className="spinner-border text-white me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading emergency alerts...</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  // Show error state
  if (error) {
    return (
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="bg-gradient-emergency text-white border-0 shadow-lg">
            <CardBody className="p-4">
              <div className="d-flex align-items-center">
                <IconifyIcon icon="ri:error-warning-line" className="fs-24 text-warning me-2" />
                <span>Failed to load emergency alerts data</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mb-4">
      <Col xl={12}>
        <Card className="bg-gradient-emergency text-white border-0 shadow-lg">
          <CardBody className="p-4">
            <Row className="align-items-center">
              <Col lg={8}>
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar-lg bg-white bg-opacity-20 rounded-circle flex-centered me-3">
                    <IconifyIcon
                      icon="solar:siren-bold-duotone"
                      className="fs-24 text-white"
                    />
                  </div>
                  <div>
                    <CardTitle as="h3" className="text-white mb-1">
                      Emergency Alerts Overview
                    </CardTitle>
                    <p className="text-white-75 mb-0">
                      Real-time emergency monitoring and response metrics
                    </p>
                  </div>
                </div>

                <Row className="g-4">
                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Active Alerts</span>
                      <span className="text-white fw-semibold">{activeAlerts}/{totalAlerts}</span>
                    </div>
                    <ProgressBar 
                      now={activePercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                    >
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${activePercentage}%` }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Critical Severity</span>
                      <span className="text-white fw-semibold">{criticalAlerts}/{totalAlerts}</span>
                    </div>
                    <ProgressBar 
                      now={criticalPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                    >
                      <div 
                        className="progress-bar bg-light" 
                        style={{ width: `${criticalPercentage}%`, backgroundColor: '#ffffff !important' }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Pending Response</span>
                      <span className="text-white fw-semibold">{pendingAlerts}/{totalAlerts}</span>
                    </div>
                    <ProgressBar 
                      now={pendingPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                    >
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ width: `${pendingPercentage}%`, backgroundColor: '#dc3545 !important' }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Acknowledgment Rate</span>
                      <span className="text-white fw-semibold">{acknowledgedPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-white-75 small">Avg Response: {averageResponseTimeLabel}</span>
                      <span className="text-light small">
                        <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                        24/7 Monitoring
                      </span>
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col lg={4}>
                <div className="text-center">
                  <div className="mb-3">
                    <h2 className="text-white display-6 fw-bold mb-1">{activeAlerts}</h2>
                    <p className="text-white-75 mb-0">Active Alerts</p>
                  </div>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="bg-white bg-opacity-10 rounded-2 p-2">
                        <div className="text-white fw-semibold">{resolvedAlerts}</div>
                        <div className="text-white-75 small">Resolved</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-white bg-opacity-10 rounded-2 p-2">
                        <div className="text-white fw-semibold">{criticalAlerts}</div>
                        <div className="text-white-75 small">Critical</div>
                      </div>
                    </div>
                  </div>
                  
                  {topAlertTypes.length > 0 && (
                    <div className="bg-white bg-opacity-10 rounded-3 p-3">
                      <h6 className="text-white mb-2">
                        <IconifyIcon icon="solar:danger-triangle-bold" className="me-1" />
                        Alert Types
                      </h6>
                      {topAlertTypes.map(([type, count]) => (
                        <div key={type} className="d-flex align-items-center justify-content-between mb-1">
                          <span className="text-white-75 small">{getEmergencyAlertTypeMeta(type).label}</span>
                          <span className="text-white fw-semibold small">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EmergencyAlertsOverview;
