"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface ServicesStatsProps {
  services: any[];
}

const ServicesStats = ({ services }: ServicesStatsProps) => {
  const totalServices = services.length;
  const activeServices = services.filter(service => service.is_active).length;
  const categoryStats = services.reduce((acc: any, service) => {
    acc[service.category] = (acc[service.category] || 0) + 1;
    return acc;
  }, {});
  
  const topCategory = Object.keys(categoryStats).length > 0 
    ? Object.keys(categoryStats).reduce((a, b) => categoryStats[a] > categoryStats[b] ? a : b)
    : 'N/A';

  const averagePrice = services.length > 0 
    ? services.filter(s => s.price).reduce((sum, s) => sum + (s.price || 0), 0) / services.filter(s => s.price).length
    : 0;

  const stats = [
    {
      title: "Total Services",
      value: totalServices,
      icon: "solar:settings-minimalistic-broken",
      color: "primary",
      bgColor: "bg-primary-subtle",
    },
    {
      title: "Active Services",
      value: activeServices,
      icon: "solar:shield-check-broken",
      color: "success",
      bgColor: "bg-success-subtle",
    },
    {
      title: "Top Category",
      value: topCategory,
      icon: "solar:tag-horizontal-broken",
      color: "warning",
      bgColor: "bg-warning-subtle",
    },
    {
      title: "Avg Price",
      value: `$${averagePrice.toFixed(0)}`,
      icon: "solar:dollar-minimalistic-broken",
      color: "info",
      bgColor: "bg-info-subtle",
    },
  ];

  return (
    <Row className="mb-4">
      {stats.map((stat, index) => (
        <Col xl={3} sm={6} key={index}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className={`avatar-sm rounded ${stat.bgColor} d-flex align-items-center justify-content-center me-3`}>
                  <IconifyIcon
                    icon={stat.icon}
                    className={`fs-20 text-${stat.color}`}
                  />
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-1 fw-bold">{stat.value}</h5>
                  <p className="mb-0 text-muted fs-13">{stat.title}</p>
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
