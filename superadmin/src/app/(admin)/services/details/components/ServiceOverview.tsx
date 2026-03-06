"use client";

import { Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";
import { useSearchParams } from "next/navigation";

import { getServiceDisplayName, useGetService } from "@/hooks/useServices";
import { useListServiceRequests } from "@/hooks/useServiceRequests";

const formatMoney = (amount?: number | null) =>
  Number(amount || 0) > 0
    ? new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
      }).format(Number(amount || 0))
    : "Free";

const formatList = (items?: string[] | null) => (items && items.length ? items.join(", ") : "Not configured");

const ServiceOverview = () => {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id") || "";
  const { data: service } = useGetService(serviceId);
  const { data: requests = [] } = useListServiceRequests(serviceId);

  if (!service) {
    return null;
  }

  const recentRequests = requests.slice(0, 5);
  const activeRequests = requests.filter((request) => ["pending", "in_progress"].includes(String(request.status || "pending"))).length;

  return (
    <Row className="g-4 mb-4">
      <Col xl={8}>
        <Card className="h-100">
          <CardHeader>
            <CardTitle as="h5" className="mb-0">
              {getServiceDisplayName(service)} Overview
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Row className="g-3">
              <Col md={6}>
                <small className="text-muted d-block">Description</small>
                <span className="fw-semibold">{service.description || "No service description has been added yet."}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Pricing Model</small>
                <span className="fw-semibold">{formatMoney((service as any).base_price)}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Availability</small>
                <span className="fw-semibold">{(service as any).availability || "Not specified"}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Duration</small>
                <span className="fw-semibold">{(service as any).duration || "Not specified"}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Features</small>
                <span className="fw-semibold">{formatList((service as any).features)}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Tags</small>
                <span className="fw-semibold">{formatList((service as any).tags)}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Requirements</small>
                <span className="fw-semibold">{(service as any).requirements || "No requirements documented."}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Target Market</small>
                <span className="fw-semibold">{(service as any).target_market || "General residents"}</span>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
      <Col xl={4}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle as="h5" className="mb-0">
              Operational Snapshot
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Active requests</span>
              <span className="fw-semibold">{activeRequests}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Total requests</span>
              <span className="fw-semibold">{requests.length}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Commission rate</span>
              <span className="fw-semibold">{Number((service as any).commission_rate || 0)}%</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Community</span>
              <span className="fw-semibold">{(service as any).communities?.name || "All Communities"}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h5" className="mb-0">
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardBody>
            {recentRequests.length ? (
              <div className="d-grid gap-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="border rounded p-3">
                    <div className="fw-semibold">{request.title || request.services?.name || "Service Request"}</div>
                    <div className="text-muted fs-12 mb-1">{request.user_profile?.email || "Resident"}</div>
                    <div className="text-muted fs-12">{request.created_at ? new Date(request.created_at).toLocaleString() : "N/A"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">No service requests recorded for this service yet.</p>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ServiceOverview;
