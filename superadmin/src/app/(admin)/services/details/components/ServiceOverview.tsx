"use client";

import { Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";
import { useSearchParams } from "next/navigation";

import { getServiceDisplayName, getServiceFeatureLabels, getServiceStatus, useGetService } from "@/hooks/useServices";
import { useListServiceRequests } from "@/hooks/useServiceRequests";

const formatCurrency = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatBasePrice = (amount?: number | null) =>
  Number(amount || 0) > 0
    ? formatCurrency(amount)
    : "Free";

const formatRating = (rating?: number | null, ratingCount?: number | null) => {
  if (!Number(ratingCount || 0)) {
    return "No ratings recorded";
  }

  return `${Number(rating || 0).toFixed(1)} / 5 (${Number(ratingCount || 0)} reviews)`;
};

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
  const completedRequests = requests.filter((request) => request.status === "completed").length;
  const completedRevenue = requests
    .filter((request) => request.status === "completed")
    .reduce((sum, request) => sum + Number(request.total_amount || 0), 0);
  const averageRequestValue = requests.length
    ? requests.reduce((sum, request) => sum + Number(request.total_amount || 0), 0) / requests.length
    : 0;
  const featureLabels = getServiceFeatureLabels(service);
  const serviceStatus = getServiceStatus(service);

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
                <small className="text-muted d-block">Base Price</small>
                <span className="fw-semibold">{formatBasePrice((service as any).base_price)}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Status</small>
                <span className="fw-semibold">
                  {serviceStatus.charAt(0).toUpperCase() + serviceStatus.slice(1)}
                </span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Community</small>
                <span className="fw-semibold">{(service as any).communities?.name || "Not assigned"}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Features</small>
                <span className="fw-semibold">{featureLabels.length ? featureLabels.join(", ") : "Not configured"}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Provider Contact</small>
                <span className="fw-semibold">{(service as any).provider_contact || "Not provided"}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Rating</small>
                <span className="fw-semibold">
                  {formatRating((service as any).rating, (service as any).rating_count)}
                </span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Last Updated</small>
                <span className="fw-semibold">
                  {service.updated_at ? new Date(service.updated_at).toLocaleString() : "N/A"}
                </span>
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
              <span className="text-muted">Completed requests</span>
              <span className="fw-semibold">{completedRequests}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Completed value</span>
              <span className="fw-semibold">{formatCurrency(completedRevenue)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Average request value</span>
              <span className="fw-semibold">{formatCurrency(averageRequestValue)}</span>
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
