"use client";

import { Card, CardBody, CardHeader, CardTitle, Col, ProgressBar, Row } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";

type CommunityAnalyticsSummary = {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalResidents: number;
  residentsWithAssignedUnits: number;
  adminCount: number;
  committeeCount: number;
};

interface CommunityAnalyticsProps {
  summary: CommunityAnalyticsSummary;
}

const CommunityAnalytics = ({ summary }: CommunityAnalyticsProps) => {
  const residentAssignmentRate =
    summary.totalResidents > 0 ? Math.round((summary.residentsWithAssignedUnits / summary.totalResidents) * 100) : 0;

  const cards = [
    {
      title: "Occupancy",
      value: `${summary.occupancyRate}%`,
      subtitle: `${summary.occupiedUnits} occupied`,
      icon: "solar:home-2-bold-duotone",
      color: "primary",
    },
    {
      title: "Vacant Units",
      value: summary.vacantUnits.toString(),
      subtitle: `${summary.totalUnits} total units`,
      icon: "solar:home-broken",
      color: "warning",
    },
    {
      title: "Residents",
      value: summary.totalResidents.toString(),
      subtitle: `${residentAssignmentRate}% assigned to units`,
      icon: "solar:users-group-rounded-bold-duotone",
      color: "success",
    },
    {
      title: "Directory Roles",
      value: `${summary.adminCount + summary.committeeCount}`,
      subtitle: `${summary.adminCount} admins, ${summary.committeeCount} committee`,
      icon: "solar:shield-user-bold-duotone",
      color: "info",
    },
  ];

  return (
    <Row className="mb-4">
      <Col lg={12} className="mb-4">
        <Row>
          {cards.map((card) => (
            <Col lg={3} md={6} className="mb-3" key={card.title}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted mb-1">{card.title}</div>
                      <h3 className="mb-1">{card.value}</h3>
                      <div className="text-muted small">{card.subtitle}</div>
                    </div>
                    <div className={`avatar-lg rounded-circle bg-${card.color}-subtle d-flex align-items-center justify-content-center`}>
                      <IconifyIcon icon={card.icon} className={`fs-24 text-${card.color}`} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      <Col lg={8}>
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Community Snapshot</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Occupied Units</span>
                <span className="fw-semibold">
                  {summary.occupiedUnits} / {summary.totalUnits}
                </span>
              </div>
              <ProgressBar now={summary.occupancyRate} variant="primary" />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Residents Assigned to Units</span>
                <span className="fw-semibold">
                  {summary.residentsWithAssignedUnits} / {summary.totalResidents}
                </span>
              </div>
              <ProgressBar now={residentAssignmentRate} variant="success" />
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small mb-1">Occupied Units</div>
                  <h4 className="mb-0">{summary.occupiedUnits}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small mb-1">Vacant Units</div>
                  <h4 className="mb-0">{summary.vacantUnits}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small mb-1">Directory Leadership</div>
                  <h4 className="mb-0">{summary.adminCount + summary.committeeCount}</h4>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      <Col lg={4}>
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Role Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Admins</span>
                <span className="fw-semibold">{summary.adminCount}</span>
              </div>
              <ProgressBar now={summary.totalResidents > 0 ? (summary.adminCount / summary.totalResidents) * 100 : 0} variant="info" />
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Committee</span>
                <span className="fw-semibold">{summary.committeeCount}</span>
              </div>
              <ProgressBar
                now={summary.totalResidents > 0 ? (summary.committeeCount / summary.totalResidents) * 100 : 0}
                variant="warning"
              />
            </div>
            <div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">General Members</span>
                <span className="fw-semibold">
                  {Math.max(summary.totalResidents - summary.adminCount - summary.committeeCount, 0)}
                </span>
              </div>
              <ProgressBar
                now={
                  summary.totalResidents > 0
                    ? (Math.max(summary.totalResidents - summary.adminCount - summary.committeeCount, 0) / summary.totalResidents) * 100
                    : 0
                }
                variant="secondary"
              />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default CommunityAnalytics;
