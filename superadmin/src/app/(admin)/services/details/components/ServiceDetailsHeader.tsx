"use client";

import Link from "next/link";
import { Alert, Badge, Card, CardBody, Col, Row } from "react-bootstrap";
import { useSearchParams } from "next/navigation";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getServiceDisplayName, getServiceStatus, useGetService } from "@/hooks/useServices";

const formatLabel = (value?: string | null) => {
  if (!value) return "N/A";
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatMoney = (amount?: number | null) =>
  Number(amount || 0) > 0
    ? new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
      }).format(Number(amount || 0))
    : "Free";

const ServiceDetailsHeader = () => {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id") || "";
  const { data: service, isLoading, error } = useGetService(serviceId);

  if (!serviceId) {
    return <Alert variant="danger">A service id is required to view service details.</Alert>;
  }

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardBody className="text-center py-5">Loading service details...</CardBody>
      </Card>
    );
  }

  if (error || !service) {
    return <Alert variant="danger">Unable to load this service.</Alert>;
  }

  const status = getServiceStatus(service);

  return (
    <Card className="mb-4">
      <CardBody>
        <Row className="g-3 align-items-start">
          <Col xl={8}>
            <div className="d-flex align-items-start gap-3">
              <div className="avatar-lg bg-primary-subtle rounded-3 d-flex align-items-center justify-content-center">
                <IconifyIcon icon="solar:settings-bold-duotone" className="fs-30 text-primary" />
              </div>
              <div>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <Badge bg={status === "active" ? "success" : "secondary"}>{formatLabel(status)}</Badge>
                  <Badge bg="light" text="dark" className="border">
                    {formatLabel(service.category)}
                  </Badge>
                </div>
                <h3 className="mb-2">{getServiceDisplayName(service)}</h3>
                <p className="text-muted mb-3">{service.description || "No description has been added for this service yet."}</p>
                <div className="d-flex flex-wrap gap-4 text-muted fs-13">
                  <span>
                    <strong className="text-dark">Pricing:</strong> {formatMoney((service as any).base_price)}
                  </span>
                  <span>
                    <strong className="text-dark">Community:</strong> {(service as any).communities?.name || "All Communities"}
                  </span>
                  <span>
                    <strong className="text-dark">Created:</strong> {service.created_at ? new Date(service.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Col>
          <Col xl={4}>
            <div className="d-grid gap-2">
              <Link href="/services" className="btn btn-outline-secondary">
                Back to Services
              </Link>
              <Link href={`/service-requests?serviceId=${service.id}`} className="btn btn-outline-primary">
                View Service Requests
              </Link>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ServiceDetailsHeader;
