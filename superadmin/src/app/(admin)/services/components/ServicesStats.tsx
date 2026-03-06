"use client";

import { Card, CardBody, Col, Row } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getServiceDisplayName, isServiceActive, type Service } from "@/hooks/useServices";

interface ServicesStatsProps {
  services: Service[];
  serviceRequests: Array<{
    status?: string | null;
    total_amount?: number | null;
    service_id?: string | number | null;
    services?: Service | null;
  }>;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);

const ServicesStats = ({ services, serviceRequests }: ServicesStatsProps) => {
  const totalServices = services.length;
  const activeServices = services.filter((service) => isServiceActive(service)).length;
  const activeQueue = serviceRequests.filter((request) => ["pending", "in_progress"].includes(String(request.status || "pending"))).length;
  const completedRevenue = serviceRequests
    .filter((request) => request.status === "completed")
    .reduce((sum, request) => sum + Number(request.total_amount || 0), 0);

  const servicesByDemand = new Map<string, number>();
  serviceRequests.forEach((request) => {
    const key = String(request.service_id || request.services?.id || "");
    if (!key) return;
    servicesByDemand.set(key, (servicesByDemand.get(key) || 0) + 1);
  });

  const topService = services
    .slice()
    .sort((left, right) => (servicesByDemand.get(String(right.id)) || 0) - (servicesByDemand.get(String(left.id)) || 0))[0];

  const cards = [
    {
      title: "Total Services",
      value: String(totalServices),
      subtitle: `${activeServices} currently active`,
      icon: "solar:widget-5-bold-duotone",
      tone: "primary",
    },
    {
      title: "Active Queue",
      value: String(activeQueue),
      subtitle: "Pending + in progress requests",
      icon: "solar:clock-circle-bold-duotone",
      tone: "warning",
    },
    {
      title: "Completed Revenue",
      value: formatMoney(completedRevenue),
      subtitle: "Closed service request value",
      icon: "solar:wallet-money-bold-duotone",
      tone: "success",
    },
    {
      title: "Top Service",
      value: topService ? getServiceDisplayName(topService) : "N/A",
      subtitle: topService ? `${servicesByDemand.get(String(topService.id)) || 0} requests` : "No requests yet",
      icon: "solar:medal-ribbons-star-bold-duotone",
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
                <div className={`avatar-md rounded-3 bg-${card.tone}-subtle d-flex align-items-center justify-content-center flex-shrink-0`}>
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

export default ServicesStats;
