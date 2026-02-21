"use client";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Button } from "react-bootstrap";
import { useGetServiceRequest, useUpdateServiceRequest } from "@/hooks/useServiceRequests";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useState } from "react";
import Link from "next/link";

const ServiceRequestDetailsPage = () => {
  const params = useParams();
  const requestId = params.id as string;
  const { data: serviceRequest, isLoading, error } = useGetServiceRequest(requestId);
  const updateServiceRequest = useUpdateServiceRequest();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusUpdate = async (status: "in_progress" | "completed") => {
    if (!serviceRequest?.id) return;
    setActionError(null);

    try {
      await updateServiceRequest.mutateAsync({
        id: serviceRequest.id,
        status,
        completion_date: status === "completed" ? new Date().toISOString().slice(0, 10) : null,
      });
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Failed to update service request status.";
      setActionError(message);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title="Service Request Details" subName="Service Requests Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading service request details...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error || !serviceRequest) {
    return (
      <>
        <PageTitle title="Service Request Details" subName="Service Requests Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                {error ? "Error loading service request" : "Service request not found"}
                <div className="mt-3">
                  <Link href="/service-requests" className="btn btn-primary">
                    Back to Service Requests
                  </Link>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-subtle text-success";
      case "in_progress":
        return "bg-warning-subtle text-warning";
      case "pending":
        return "bg-info-subtle text-info";
      case "cancelled":
        return "bg-danger-subtle text-danger";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount?: number | null) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(Number(amount || 0));
  };

  const serviceName = serviceRequest.services?.name || serviceRequest.title || "Service Request";

  return (
    <>
      <PageTitle title="Service Request Details" subName="Service Requests Management" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
            <div className="d-flex justify-content-between align-items-center">
              <Link 
                href="/service-requests" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Service Requests
              </Link>
              <div className="d-flex gap-2">
                {serviceRequest.status === "pending" && (
                  <>
                    <Button
                      variant="warning"
                      onClick={() => handleStatusUpdate("in_progress")}
                      disabled={updateServiceRequest.isPending}
                    >
                      <IconifyIcon icon="ri:play-line" className="me-1" />
                      Start Service
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => handleStatusUpdate("completed")}
                      disabled={updateServiceRequest.isPending}
                    >
                      <IconifyIcon icon="ri:check-line" className="me-1" />
                      Mark as Completed
                    </Button>
                  </>
                )}
                {serviceRequest.status === "in_progress" && (
                  <Button
                    variant="success"
                    onClick={() => handleStatusUpdate("completed")}
                    disabled={updateServiceRequest.isPending}
                  >
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
            {actionError && (
              <div className="alert alert-danger mt-3 mb-0">{actionError}</div>
            )}
          </Col>
        </Row>

      <Row>
        {/* Main Service Request Information */}
        <Col xl={8}>
          <Card className="mb-4">
            <CardHeader className="border-bottom">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <CardTitle as="h4" className="mb-1">
                    {serviceName}
                  </CardTitle>
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <Badge className={`py-1 px-2 fs-13 ${getStatusBadgeClass(serviceRequest.status || "pending")}`}>
                      {(serviceRequest.status || "pending").replace("_", " ").toUpperCase()}
                    </Badge>
                    <Badge className="bg-info-subtle text-info py-1 px-2 fs-13">
                      {serviceRequest.services?.category}
                    </Badge>
                    <Badge className="bg-primary-subtle text-primary py-1 px-2 fs-13">
                      {formatCurrency(serviceRequest.total_amount)}
                    </Badge>
                  </div>
                </div>
                <div className="text-muted fs-13">
                  <div>ID: #{serviceRequest.id}</div>
                  <div>Requested: {formatDate(serviceRequest.created_at)}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardBody>
              <div className="mb-4">
                <h6 className="mb-2">Service Details</h6>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <small className="text-muted">Service Name</small>
                    <div className="fw-medium">{serviceName}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Category</small>
                    <div className="fw-medium text-capitalize">{serviceRequest.services?.category || "General"}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Preferred Date</small>
                    <div className="fw-medium">
                      {serviceRequest.preferred_date
                        ? new Date(serviceRequest.preferred_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not specified"}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Total Amount</small>
                    <div className="fw-medium text-success">{formatCurrency(serviceRequest.total_amount)}</div>
                  </div>
                </div>
              </div>

              {(serviceRequest.description || serviceRequest.request_details) && (
                <div className="mb-4">
                  <h6 className="mb-2">Service Instructions</h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0 text-muted">{serviceRequest.description || serviceRequest.request_details}</p>
                  </div>
                </div>
              )}

              {serviceRequest.services?.description && (
                <div className="mb-4">
                  <h6 className="mb-2">Service Description</h6>
                  <p className="text-muted mb-0 lh-base">{serviceRequest.services.description}</p>
                </div>
              )}

              <div>
                <h6 className="mb-3">Timeline</h6>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker bg-primary"></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">Service Request Created</h6>
                      <small className="text-muted">{formatDate(serviceRequest.created_at)}</small>
                    </div>
                  </div>
                  {serviceRequest.updated_at && serviceRequest.updated_at !== serviceRequest.created_at && (
                    <div className="timeline-item">
                      <div className="timeline-marker bg-warning"></div>
                      <div className="timeline-content">
                        <h6 className="mb-1">Last Updated</h6>
                        <small className="text-muted">{formatDate(serviceRequest.updated_at)}</small>
                      </div>
                    </div>
                  )}
                  {serviceRequest.status === "completed" && (
                    <div className="timeline-item">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <h6 className="mb-1">Service Completed</h6>
                        <small className="text-muted">{formatDate(serviceRequest.updated_at)}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xl={4}>
          {/* Resident Information */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="ri:user-line" className="me-2" />
                Resident Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center mb-3">
                <div className="avatar-lg bg-primary bg-opacity-10 rounded flex-centered me-3">
                  <IconifyIcon icon="ri:user-fill" className="fs-24 text-primary" />
                </div>
                <div>
                  <h6 className="mb-1">
                    {[serviceRequest.user_profile?.first_name, serviceRequest.user_profile?.last_name]
                      .filter(Boolean)
                      .join(" ") || serviceRequest.user_profile?.email || "Resident"}
                  </h6>
                  <p className="text-muted mb-0 fs-13">Resident</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted">Unit</small>
                    <div className="fw-medium">{serviceRequest.units?.number || serviceRequest.units?.unit_number || "N/A"}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Block</small>
                    <div className="fw-medium">{serviceRequest.units?.block || "N/A"}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Community</small>
                  <div className="fw-medium">{serviceRequest.units?.community?.name || "N/A"}</div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Email</small>
                  <div className="fw-medium">{serviceRequest.user_profile?.email || "N/A"}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-2">
                {serviceRequest.status === "pending" && (
                  <>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleStatusUpdate("in_progress")}
                      disabled={updateServiceRequest.isPending}
                    >
                      <IconifyIcon icon="ri:play-line" className="me-1" />
                      Start Service
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusUpdate("completed")}
                      disabled={updateServiceRequest.isPending}
                    >
                      <IconifyIcon icon="ri:check-line" className="me-1" />
                      Mark as Completed
                    </Button>
                  </>
                )}
                {serviceRequest.status === "in_progress" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusUpdate("completed")}
                    disabled={updateServiceRequest.isPending}
                  >
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Mark as Completed
                  </Button>
                )}
                <Link href="/service-requests" className="btn btn-outline-secondary btn-sm">
                  <IconifyIcon icon="ri:list-check-3" className="me-1" />
                  Back to Requests List
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Request Metadata */}
          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="ri:file-info-line" className="me-2" />
                Request Metadata
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Status</span>
                  <span className="fw-semibold text-capitalize">
                    {serviceRequest.status?.replace("_", " ") || "pending"}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Priority</span>
                  <span className="fw-semibold text-capitalize">{serviceRequest.priority || "medium"}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Created</span>
                  <span className="fw-semibold">{formatDate(serviceRequest.created_at)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Last Updated</span>
                  <span className="fw-semibold">{formatDate(serviceRequest.updated_at)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Amount</span>
                  <span className="fw-semibold">{formatCurrency(serviceRequest.total_amount)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ServiceRequestDetailsPage;
