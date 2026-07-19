"use client";

import { Card, CardBody, Col, Row } from "react-bootstrap";
import { useSearchParams } from "next/navigation";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGetService } from "@/hooks/useServices";
import { useListServiceRequests } from "@/hooks/useServiceRequests";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);

const ServiceStatsCards = () => {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id") || "";
  const { data: service } = useGetService(serviceId);
  const { data: requests = [] } = useListServiceRequests(serviceId);

  const pending = requests.filter((request) => request.status === "pending").length;
  const inProgress = requests.filter((request) => request.status === "in_progress").length;
  const completed = requests.filter((request) => request.status === "completed").length;
  const completedRevenue = requests
    .filter((request) => request.status === "completed")
    .reduce((sum, request) => sum + Number(request.total_amount || 0), 0);

  const cards = [
    {
      title: "Pending",
      value: String(pending),
      subtitle: "Waiting to start",
      icon: "solar:clock-circle-bold-duotone",
      tone: "warning",
    },
    {
      title: "In Progress",
      value: String(inProgress),
      subtitle: "Active service jobs",
      icon: "solar:play-circle-bold-duotone",
      tone: "info",
    },
    {
      title: "Completed",
      value: String(completed),
      subtitle: "Finished requests",
      icon: "solar:check-circle-bold-duotone",
      tone: "success",
    },
    {
      title: "Base Price / Revenue",
      value: service ? `${formatMoney(Number((service as any).base_price || 0))} / ${formatMoney(completedRevenue)}` : "N/A",
      subtitle: "Current price / completed value",
      icon: "solar:wallet-money-bold-duotone",
      tone: "primary",
    },
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((card) => (
        <Col xl={3} sm={6} key={card.title}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <p className="text-muted mb-2 fs-13">{card.title}</p>
                  <h5 className="mb-1">{card.value}</h5>
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

export default ServiceStatsCards;
