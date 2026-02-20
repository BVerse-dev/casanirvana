"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, Col } from "react-bootstrap";
import { useResidentSummary } from "@/hooks/useResidentDashboard";

interface StatCardProps {
  amount: string;
  icon: string;
  title: string;
  change?: number;
  variant: string;
}

const StatCard = ({ amount, icon, title, change, variant }: StatCardProps) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="mb-2 fs-15 fw-medium">
              {title} &nbsp;{" "}
              {change && (
                <span className="badge text-success bg-success-subtle fs-11 icons-center">
                  <IconifyIcon width={11} height={11} icon="ri:arrow-up-line" />
                  {change}%
                </span>
              )}{" "}
            </p>
            <h3 className="text-dark fw-bold d-flex align-items-center gap-2 mb-0">
              {amount}
            </h3>
          </div>
          <div>
            <div
              className={`avatar-md bg-${variant} bg-opacity-10 rounded flex-centered`}
            >
              <IconifyIcon
                icon={icon}
                width={32}
                height={32}
                className={`text-${variant}`}
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const Statistics = () => {
  const { data: residentSummary, isLoading } = useResidentSummary();

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

  const statData = [
    {
      title: "Total Residents",
      amount: residentSummary?.totalResidents.toString() || "0",
      icon: "solar:users-group-two-rounded-broken",
      variant: "primary",
    },
    {
      title: "Active Residents",
      amount: residentSummary?.activeResidents.toString() || "0",
      icon: "solar:user-check-broken",
      change: residentSummary?.newResidentsThisMonth || 0,
      variant: "success",
    },
    {
      title: "Occupancy Rate",
      amount: `${residentSummary?.occupancyRate || 0}%`,
      icon: "solar:home-2-broken",
      variant: "warning",
    },
    {
      title: "Avg Stay Duration",
      amount: `${residentSummary?.averageStayDuration || 0} months`,
      icon: "solar:calendar-date-broken",
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
