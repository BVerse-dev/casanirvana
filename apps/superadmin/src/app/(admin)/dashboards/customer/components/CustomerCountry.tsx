"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardDashboardSnapshot } from "@/hooks/useGuardDashboard";
import { Card, CardBody, Col, ProgressBar, Row } from "react-bootstrap";

const GuardCountry = () => {
  const { data: dashboard, isLoading, isError } = useGuardDashboardSnapshot();
  const cards = dashboard?.locationCards || [];

  if (isLoading) {
    return (
      <Row className="g-3 mb-4">
        {[1, 2, 3, 4].map((item) => (
          <Col md={6} key={item}>
            <Card><CardBody className="placeholder-glow"><span className="placeholder col-7" /><span className="placeholder col-10 mt-3" /></CardBody></Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (isError) {
    return <Card className="mb-4"><CardBody className="text-center text-danger py-4">Guard staffing data could not be loaded.</CardBody></Card>;
  }

  if (cards.length === 0) {
    return <Card className="mb-4"><CardBody className="text-center text-muted py-4">No community guard staffing records are available.</CardBody></Card>;
  }

  return (
    <Row className="g-3 mb-4">
      {cards.map((location) => (
        <Col md={6} key={location.id}>
          <Card className="h-100">
            <CardBody>
              <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                <div>
                  <p className="text-muted mb-1">Community staffing</p>
                  <h5 className="mb-0">{location.location}</h5>
                </div>
                <span className="avatar-sm rounded bg-primary-subtle text-primary flex-centered">
                  <IconifyIcon icon="solar:shield-user-broken" width={22} height={22} />
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>{location.activeGuards} assigned</span>
                <span className="text-muted">{location.totalGuards} required</span>
              </div>
              <ProgressBar now={location.progress} variant={location.progress >= 100 ? "success" : "primary"} className="mb-3" />
              <div className="d-flex justify-content-between align-items-center">
                <span className={location.progress >= 100 ? "text-success" : "text-warning"}>{location.detail}</span>
                <span className="text-muted">Avg. salary: GH₵ {location.avgSalary.toLocaleString()}</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default GuardCountry;
