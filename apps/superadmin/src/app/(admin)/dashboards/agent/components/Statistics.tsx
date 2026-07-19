"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useResidentSummary } from "@/hooks/useResidentDashboard";
import { Card, CardBody, Col } from "react-bootstrap";

interface StatCardProps {
  amount: string;
  icon: string;
  title: string;
  detail?: string;
  variant: string;
}

const StatCard = ({ amount, icon, title, detail, variant }: StatCardProps) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="mb-2 fs-15 fw-medium">{title}</p>
            <h3 className="text-dark fw-bold d-flex align-items-center gap-2 mb-1">{amount}</h3>
            {detail ? <small className="text-muted">{detail}</small> : null}
          </div>
          <div>
            <div className={`avatar-md bg-${variant} bg-opacity-10 rounded flex-centered`}>
              <IconifyIcon icon={icon} width={32} height={32} className={`text-${variant}`} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const Statistics = () => {
  const { data: residentSummary, error, isLoading } = useResidentSummary();

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Col md={6} xl={3} key={i}>
            <Card>
              <CardBody>
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-8"></span>
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
        <Card>
          <CardBody className="text-center text-muted py-4">
            Resident dashboard metrics are unavailable right now.
          </CardBody>
        </Card>
      </Col>
    );
  }

  const statData = [
    {
      title: "Total Residents",
      amount: residentSummary?.totalResidents.toString() || "0",
      detail: `${residentSummary?.inactiveResidents || 0} inactive`,
      icon: "solar:users-group-two-rounded-broken",
      variant: "primary",
    },
    {
      title: "Active Residents",
      amount: residentSummary?.activeResidents.toString() || "0",
      detail: `${residentSummary?.newResidentsThisMonth || 0} added this month`,
      icon: "solar:user-check-broken",
      variant: "success",
    },
    {
      title: "Occupancy Rate",
      amount: `${residentSummary?.occupancyRate || 0}%`,
      detail: "Occupied units across the current portfolio",
      icon: "solar:home-2-broken",
      variant: "warning",
    },
    {
      title: "Open Maintenance",
      amount: residentSummary?.maintenanceRequests.toString() || "0",
      detail: `${residentSummary?.averageStayDuration || 0} months average stay`,
      icon: "solar:settings-broken",
      variant: "info",
    },
  ];

  return (
    <>
      {statData.map((item, idx) => (
        <Col md={6} xl={3} key={idx}>
          <StatCard {...item} />
        </Col>
      ))}
    </>
  );
};

export default Statistics;
