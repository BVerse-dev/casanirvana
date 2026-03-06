"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";

import PageTitle from "@/components/PageTitle";
import { useGetServiceRequest, useUpdateServiceRequest, formatServiceRequestStatusLabel } from "@/hooks/useServiceRequests";
import { getServiceDisplayName } from "@/hooks/useServices";

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : "N/A");
const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "N/A");

const getStatusVariant = (status?: string | null) => {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "cancelled":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
};

const ServiceRequestDetailsPage = () => {
  const params = useParams();
  const requestId = params.id as string;
  const { data: serviceRequest, isLoading, error } = useGetServiceRequest(requestId);
  const updateServiceRequest = useUpdateServiceRequest();
  const [feedback, setFeedback] = useState<{ variant: "success" | "danger"; message: string } | null>(null);

  const handleStatusUpdate = async (status: "in_progress" | "completed" | "cancelled" | "pending") => {
    if (!serviceRequest?.id) return;
    setFeedback(null);

    try {
      await updateServiceRequest.mutateAsync({
        id: serviceRequest.id,
        status,
        completion_date: status === "completed" ? new Date().toISOString().slice(0, 10) : null,
      });
      setFeedback({
        variant: "success",
        message: `Service request moved to ${formatServiceRequestStatusLabel(status)}.`,
      });
    } catch (updateError) {
      console.error("Failed to update service request status:", updateError);
      setFeedback({
        variant: "danger",
        message: "Failed to update service request status.",
      });
    }
  };

  const timeline = useMemo(() => {
    if (!serviceRequest) return [] as Array<{ key: string; title: string; timestamp: string; tone: string; description: string }>;

    const events = [
      serviceRequest.created_at
        ? {
            key: "created",
            title: "Request created",
            timestamp: serviceRequest.created_at,
            tone: "primary",
            description: "Resident submitted the service request.",
          }
        : null,
      serviceRequest.preferred_date
        ? {
            key: "preferred",
            title: "Preferred date requested",
            timestamp: serviceRequest.preferred_date,
            tone: "secondary",
            description: `Resident requested service for ${formatDate(serviceRequest.preferred_date)}.`,
          }
        : null,
      serviceRequest.scheduled_date
        ? {
            key: "scheduled",
            title: "Scheduled date",
            timestamp: serviceRequest.scheduled_date,
            tone: "info",
            description: "The request has a scheduled service date.",
          }
        : null,
      serviceRequest.completion_date
        ? {
            key: "completed",
            title: "Completion recorded",
            timestamp: serviceRequest.completion_date,
            tone: "success",
            description: "Completion date was recorded for this request.",
          }
        : null,
      serviceRequest.updated_at && serviceRequest.updated_at !== serviceRequest.created_at
        ? {
            key: "updated",
            title: "Last updated",
            timestamp: serviceRequest.updated_at,
            tone: serviceRequest.status === "cancelled" ? "danger" : serviceRequest.status === "completed" ? "success" : "warning",
            description: `Current status: ${formatServiceRequestStatusLabel(serviceRequest.status)}.`,
          }
        : null,
    ];

    return events.filter(Boolean) as Array<{ key: string; title: string; timestamp: string; tone: string; description: string }>;
  }, [serviceRequest]);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Service Request Details" subName="Operations" />
        <Card>
          <CardBody className="text-center py-5">Loading service request details...</CardBody>
        </Card>
      </>
    );
  }

  if (error || !serviceRequest) {
    return (
      <>
        <PageTitle title="Service Request Details" subName="Operations" />
        <Alert variant="danger">{error ? "Failed to load service request." : "Service request not found."}</Alert>
        <Link href="/service-requests" className="btn btn-outline-secondary btn-sm">
          Back to Service Requests
        </Link>
      </>
    );
  }

  const residentName =
    [serviceRequest.user_profile?.first_name, serviceRequest.user_profile?.last_name].filter(Boolean).join(" ") ||
    serviceRequest.user_profile?.email ||
    "Resident";
  const canStart = serviceRequest.status === "pending";
  const canComplete = serviceRequest.status === "pending" || serviceRequest.status === "in_progress";
  const canCancel = serviceRequest.status === "pending" || serviceRequest.status === "in_progress";
  const canReopen = serviceRequest.status === "completed" || serviceRequest.status === "cancelled";

  return (
    <>
      <PageTitle title="Service Request Details" subName="Operations" />

      <Row className="mb-3">
        <Col xl={12}>
          <Link href="/service-requests" className="btn btn-outline-secondary btn-sm">
            Back to Service Requests
          </Link>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    <Badge bg={getStatusVariant(serviceRequest.status)}>{formatServiceRequestStatusLabel(serviceRequest.status)}</Badge>
                    <Badge bg="light" text="dark" className="border">
                      Payment: {formatServiceRequestStatusLabel(serviceRequest.payment_status || "not_required")}
                    </Badge>
                  </div>
                  <h3 className="mb-2">{serviceRequest.title || getServiceDisplayName(serviceRequest.services) || "Service Request"}</h3>
                  <p className="text-muted mb-0">Request ID: {serviceRequest.id}</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {canStart ? (
                    <Button variant="info" size="sm" onClick={() => void handleStatusUpdate("in_progress")} disabled={updateServiceRequest.isPending}>
                      Start Service
                    </Button>
                  ) : null}
                  {canComplete ? (
                    <Button variant="success" size="sm" onClick={() => void handleStatusUpdate("completed")} disabled={updateServiceRequest.isPending}>
                      Mark Completed
                    </Button>
                  ) : null}
                  {canCancel ? (
                    <Button variant="danger" size="sm" onClick={() => void handleStatusUpdate("cancelled")} disabled={updateServiceRequest.isPending}>
                      Cancel
                    </Button>
                  ) : null}
                  {canReopen ? (
                    <Button variant="outline-secondary" size="sm" onClick={() => void handleStatusUpdate("pending")} disabled={updateServiceRequest.isPending}>
                      Reopen
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={8}>
          {feedback ? (
            <Alert variant={feedback.variant} dismissible onClose={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          ) : null}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Request Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Row className="g-3">
                <Col md={6}>
                  <small className="text-muted d-block">Service</small>
                  <span className="fw-semibold">{getServiceDisplayName(serviceRequest.services)}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Category</small>
                  <span className="fw-semibold">{formatServiceRequestStatusLabel(serviceRequest.services?.category || "general")}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Preferred Date</small>
                  <span className="fw-semibold">{formatDate(serviceRequest.preferred_date)}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Preferred Time</small>
                  <span className="fw-semibold">{serviceRequest.preferred_time || "Not set"}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Scheduled Date</small>
                  <span className="fw-semibold">{formatDate(serviceRequest.scheduled_date)}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Amount</small>
                  <span className="fw-semibold">{formatMoney(serviceRequest.total_amount)}</span>
                </Col>
                <Col md={12}>
                  <small className="text-muted d-block">Request Details</small>
                  <span className="fw-semibold">{serviceRequest.request_details || serviceRequest.description || "No request details provided."}</span>
                </Col>
                {serviceRequest.notes ? (
                  <Col md={12}>
                    <small className="text-muted d-block">Internal Notes</small>
                    <span className="fw-semibold">{serviceRequest.notes}</span>
                  </Col>
                ) : null}
              </Row>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Timeline
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-3">
                {timeline.map((event) => (
                  <div key={event.key} className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="fw-semibold">{event.title}</div>
                        <div className="text-muted fs-13">{event.description}</div>
                      </div>
                      <Badge bg={event.tone}>{formatDateTime(event.timestamp)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Resident Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Resident</span>
                <span className="fw-semibold">{residentName}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Email</span>
                <span className="fw-semibold">{serviceRequest.user_profile?.email || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Phone</span>
                <span className="fw-semibold">{serviceRequest.user_profile?.phone || "N/A"}</span>
              </div>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Assignment & Unit
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Assigned To</span>
                <span className="fw-semibold">
                  {[serviceRequest.assigned_profile?.first_name, serviceRequest.assigned_profile?.last_name].filter(Boolean).join(" ") || serviceRequest.assigned_profile?.email || "Unassigned"}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Unit</span>
                <span className="fw-semibold">{[serviceRequest.units?.block, serviceRequest.units?.number || serviceRequest.units?.unit_number].filter(Boolean).join("-") || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Community</span>
                <span className="fw-semibold">{serviceRequest.units?.community?.name || "N/A"}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardBody className="d-grid gap-2">
              {serviceRequest.services?.id ? (
                <Link href={`/services/details?id=${serviceRequest.services.id}`} className="btn btn-outline-primary">
                  View Service
                </Link>
              ) : null}
              <Link href="/service-requests" className="btn btn-outline-secondary">
                Back to Requests
              </Link>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ServiceRequestDetailsPage;
