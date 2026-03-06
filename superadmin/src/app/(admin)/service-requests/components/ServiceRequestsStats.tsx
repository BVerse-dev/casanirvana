"use client";

import { Card, CardBody, Col, Row } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface ServiceRequestsStatsProps {
  serviceRequests: Array<{
    status?: string | null;
    total_amount?: number | null;
  }>;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);

const ServiceRequestsStats = ({ serviceRequests }: ServiceRequestsStatsProps) => {
  const total = serviceRequests.length;
  const activeQueue = serviceRequests.filter((request) => ["pending", "in_progress"].includes(String(request.status || "pending"))).length;
  const completed = serviceRequests.filter((request) => request.status === "completed").length;
  const completedRevenue = serviceRequests
    .filter((request) => request.status === "completed")
    .reduce((sum, request) => sum + Number(request.total_amount || 0), 0);

  const cards = [
    {
      title: "Total Requests",
      value: String(total),
      subtitle: "All recorded service jobs",
      icon: "solar:clipboard-list-bold-duotone",
      tone: "primary",
    },
    {
      title: "Active Queue",
      value: String(activeQueue),
      subtitle: "Pending + in progress",
      icon: "solar:clock-circle-bold-duotone",
      tone: "warning",
    },
    {
      title: "Completed",
      value: String(completed),
      subtitle: "Finished service jobs",
      icon: "solar:check-circle-bold-duotone",
      tone: "success",
    },
    {
      title: "Completed Revenue",
      value: formatMoney(completedRevenue),
      subtitle: "Value from closed requests",
      icon: "solar:wallet-money-bold-duotone",
      tone: "info",
    },
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((card) => (
        <Col xl={3} sm={6} key={card.title}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="text-muted mb-2 fs-13">{card.title}</p>
                  <h4 className="mb-1">{card.value}</h4>
                  <p className="text-muted mb-0 fs-12">{card.subtitle}</p>
                </div>
                <div className={`avatar-md rounded-3 bg-${card.tone}-subtle d-flex align-items-center justify-content-center`}>
                  <IconifyIcon icon={card.icon} className={`fs-26 text-${card.tone}`} />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ServiceRequestsStats;
