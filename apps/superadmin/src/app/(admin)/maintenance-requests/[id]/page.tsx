"use client";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Button, Tab, Tabs, Alert } from "react-bootstrap";
import { useGetMaintenanceRequest, useMaintenanceRequestsSubscription, useUpdateMaintenanceRequest } from "@/hooks/useMaintenanceRequests";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const formatStatusLabel = (value?: string | null) =>
  (value || "unknown")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return "TBD";
  return `GH₵${Number(value).toLocaleString()}`;
};

const getResolutionTimestamp = (request: {
  completed_at?: string | null;
  resolved_at?: string | null;
}) => request.completed_at || request.resolved_at || null;

const getStatusActionLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Closed";
    case "in_progress":
      return "Work In Progress";
    case "pending":
      return "Awaiting Action";
    case "cancelled":
      return "Cancelled";
    default:
      return formatStatusLabel(status);
  }
};

const MaintenanceRequestDetailsPage = () => {
  useMaintenanceRequestsSubscription();
  const params = useParams();
  const requestId = params.id as string;
  const { data: request, isLoading, error } = useGetMaintenanceRequest(requestId);
  const updateMaintenanceRequest = useUpdateMaintenanceRequest(requestId);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Maintenance Request Details" subName="Maintenance Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading maintenance request details...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error || !request) {
    return (
      <>
        <PageTitle title="Maintenance Request Details" subName="Maintenance Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                {error ? "Error loading maintenance request" : "Maintenance request not found"}
                <div className="mt-3">
                  <Link href="/maintenance-requests" className="btn btn-primary">
                    Back to Maintenance Requests
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
      case "pending":
        return "bg-warning-subtle text-warning";
      case "in_progress":
        return "bg-info-subtle text-info";
      case "cancelled":
        return "bg-secondary-subtle text-secondary";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-danger-subtle text-danger";
      case "medium":
        return "bg-warning-subtle text-warning";
      case "low":
        return "bg-success-subtle text-success";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const attachments = Array.isArray(request.images)
    ? request.images.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const timelineEvents = [
    request.created_at
      ? {
          key: "created",
          title: "Request Submitted",
          description: "Initial maintenance request submitted by resident",
          timestamp: request.created_at,
          markerClass: "bg-primary",
          iconClass: "text-primary",
        }
      : null,
    request.status === "in_progress" && request.updated_at && request.updated_at !== request.created_at
      ? {
          key: "in-progress",
          title: "Marked In Progress",
          description: "Request is actively being handled by the maintenance team",
          timestamp: request.updated_at,
          markerClass: "bg-warning",
          iconClass: "text-warning",
        }
      : null,
    getResolutionTimestamp(request)
      ? {
          key: "resolved",
          title: request.status === "completed" ? "Request Completed" : "Request Resolved",
          description:
            request.status === "completed"
              ? "Maintenance work has been completed and closed"
              : "Request was resolved and updated in the system",
          timestamp: getResolutionTimestamp(request) as string,
          markerClass: "bg-success",
          iconClass: "text-success",
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    title: string;
    description: string;
    timestamp: string;
    markerClass: string;
    iconClass: string;
  }>;

  const handleStatusUpdate = async (newStatus: "pending" | "in_progress" | "completed" | "cancelled") => {
    if (!request || request.status === newStatus) return;

    setFeedback(null);

    try {
      await updateMaintenanceRequest.mutateAsync({
        status: newStatus,
      });
      setFeedback({
        variant: "success",
        message: `Maintenance request #${request.id} updated to ${formatStatusLabel(newStatus)}.`,
      });
    } catch (error) {
      console.error("Error updating maintenance request status:", error);
      setFeedback({
        variant: "danger",
        message: `Failed to update maintenance request #${request.id}.`,
      });
    }
  };

  const handleToggleResolve = async () => {
    const currentStatus = request?.status || "pending";
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await handleStatusUpdate(newStatus);
  };

  const canMarkInProgress = request.status === "pending";
  const canMarkCompleted = ["pending", "in_progress"].includes(request.status);
  const canReopen = request.status === "completed";
  const requesterName = request.requester_profile?.full_name || "Unknown User";
  const assignedToName = request.assigned_profile?.full_name || "Unassigned";
  const resolvedByName = request.resolved_by_profile?.full_name || "Not recorded";

  return (
    <>
      <PageTitle title="Maintenance Request Details" subName="Maintenance Management" />

      <Row className="mb-4">
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-lg bg-primary bg-opacity-10 rounded flex-centered">
                    <IconifyIcon
                      icon="ri:tools-line"
                      className="fs-24 text-primary"
                    />
                  </div>
                  <div>
                    <h4 className="mb-1">{request.title}</h4>
                    <p className="text-muted mb-0">Request ID: #{request.id}</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Badge className={`${getStatusBadgeClass(request.status)} fs-12 d-inline-flex align-items-center`}>
                    {formatStatusLabel(request.status)}
                  </Badge>
                  <Link href="/maintenance-requests" className="btn btn-outline-secondary">
                    <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
                    Back to List
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Status Cards */}
      <Row className="mb-4">
        <Col xl={3} lg={6}>
          <Card 
            className="border-0 h-100"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Status</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    {formatStatusLabel(request.status).toUpperCase()}
                  </h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:time-line" className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card 
            className="border-0 h-100"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Priority</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    {formatStatusLabel(request.priority).toUpperCase()}
                  </h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:flag-line" className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card 
            className="border-0 h-100"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Type</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">{request.request_type || 'General'}</h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:tools-line" className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card 
            className="border-0 h-100"
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Estimated Cost</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    {formatMoney(request.estimated_cost)}
                  </h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:money-dollar-circle-line" className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col xl={8}>
          {feedback ? (
            <Alert
              variant={feedback.variant}
              className="mb-3"
              dismissible
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          ) : null}
          <Card>
            <CardHeader>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || "details")}
                className="nav-tabs-custom"
              >
                <Tab eventKey="details" title="Request Details">
                  <div className="tab-content mt-3">
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Description</h6>
                      <p className="text-muted mb-0">{request.description || "No description provided."}</p>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Request Information</h6>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Request Type:</label>
                            <p className="mb-0 fw-medium">{formatStatusLabel(request.request_type || "general")}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Priority Level:</label>
                            <p className="mb-0">
                              <Badge className={`${getPriorityBadgeClass(request.priority)} fs-12`}>
                                {formatStatusLabel(request.priority).toUpperCase()}
                              </Badge>
                            </p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Date Requested:</label>
                            <p className="mb-0 fw-medium">{request.created_at ? formatDate(request.created_at) : "N/A"}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Last Updated:</label>
                            <p className="mb-0 fw-medium">{request.updated_at ? formatDate(request.updated_at) : "N/A"}</p>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Cost Information</h6>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Estimated Cost:</label>
                            <p className="mb-0 fw-medium text-success">
                              {request.estimated_cost !== null ? formatMoney(request.estimated_cost) : "To be determined"}
                            </p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Actual Cost:</label>
                            <p className="mb-0 fw-medium text-success">
                              {request.actual_cost !== null ? formatMoney(request.actual_cost) : "Not recorded"}
                            </p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Assigned To:</label>
                            <p className="mb-0 fw-medium">{assignedToName}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Resolved By:</label>
                            <p className="mb-0 fw-medium">{resolvedByName}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Operational Status:</label>
                            <p className="mb-0">
                              <Badge className={`${getStatusBadgeClass(request.status)} fs-12`}>
                                {getStatusActionLabel(request.status)}
                              </Badge>
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="timeline" title="Timeline">
                  <div className="tab-content mt-3">
                    <div className="timeline-container">
                      {timelineEvents.map((event) => (
                        <div className="timeline-item" key={event.key}>
                          <div className={`timeline-marker ${event.markerClass}`}></div>
                          <div className="timeline-content">
                            <h6 className="mb-1">{event.title}</h6>
                            <p className="text-muted mb-1">{event.description}</p>
                            <small className="text-muted">{formatDate(event.timestamp)}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="attachments" title={`Attachments (${attachments.length})`}>
                  <div className="tab-content mt-3">
                    {attachments.length > 0 ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0 fw-semibold">Uploaded Attachments</h6>
                          <small className="text-muted">{attachments.length} file(s)</small>
                        </div>
                        <Row className="g-3">
                          {attachments.map((attachmentUrl, index) => (
                            <Col md={4} sm={6} key={`${attachmentUrl}-${index}`}>
                              <div className="border rounded overflow-hidden bg-light">
                                <button
                                  type="button"
                                  className="w-100 border-0 p-0 bg-transparent"
                                  onClick={() => setSelectedAttachment(attachmentUrl)}
                                  style={{ height: 160, cursor: "zoom-in" }}
                                >
                                  <img
                                    src={attachmentUrl}
                                    alt={`Maintenance attachment ${index + 1}`}
                                    className="w-100 h-100 object-fit-cover"
                                  />
                                </button>
                                <div className="d-flex justify-content-between align-items-center p-2 border-top">
                                  <small className="text-muted">Attachment {index + 1}</small>
                                  <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-primary py-0 px-2"
                                  >
                                    Open
                                  </a>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <IconifyIcon icon="ri:file-list-3-line" className="fs-48 text-muted mb-3" />
                        <h6 className="text-muted">No attachments available</h6>
                        <p className="text-muted mb-0">Files and images related to this request will appear here</p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </CardHeader>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xl={4}>
          {/* Requester Info */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Requester Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="avatar-md rounded-circle bg-primary bg-opacity-10 flex-centered">
                  {(() => {
                    const avatarImage = mapAvatarUrl(request.requester_profile?.avatar_url);
                    return avatarImage ? (
                      <Image
                        src={avatarImage}
                        alt={request.requester_profile?.full_name || "User"}
                        width={50}
                        height={50}
                        className="avatar-md rounded-circle"
                      />
                    ) : (
                      <IconifyIcon icon="ri:user-line" className="fs-20 text-primary" />
                    );
                  })()}
                </div>
                <div>
                  <h6 className="mb-1">{requesterName}</h6>
                  <p className="text-muted mb-0 fs-13">{request.requester_profile?.email || "N/A"}</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phone:</span>
                  <span className="fw-medium">{request.requester_profile?.phone || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Unit:</span>
                  <span className="fw-medium">{request.unit?.unit_number || request.unit?.number || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Block:</span>
                  <span className="fw-medium">{request.unit?.block || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span className="text-muted">Assigned To:</span>
                  <span className="fw-medium">{assignedToName}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={updateMaintenanceRequest.isPending || !canMarkInProgress}
                >
                  <IconifyIcon icon="ri:check-line" className="me-1" />
                  {updateMaintenanceRequest.isPending ? "Updating..." : "Mark as In Progress"}
                </Button>
                <Button 
                  variant={canReopen ? "warning" : "success"} 
                  size="sm"
                  onClick={handleToggleResolve}
                  disabled={updateMaintenanceRequest.isPending || (!canMarkCompleted && !canReopen)}
                >
                  <IconifyIcon icon={canReopen ? "ri:refresh-line" : "ri:check-double-line"} className="me-1" />
                  {updateMaintenanceRequest.isPending 
                    ? "Updating..." 
                    : (canReopen ? "Reopen Request" : "Mark as Completed")
                  }
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Status History
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="status-history">
                {timelineEvents.map((event) => (
                  <div className="d-flex align-items-center gap-3 mb-3" key={event.key}>
                    <div className={`avatar-xs ${event.markerClass} bg-opacity-10 rounded-circle flex-centered`}>
                      <IconifyIcon icon="ri:time-line" className={`fs-12 ${event.iconClass}`} />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fs-13">{event.title}</h6>
                      <p className="text-muted mb-0 fs-12">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {selectedAttachment && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setSelectedAttachment(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Attachment Preview</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAttachment(null)}
                />
              </div>
              <div className="modal-body text-center">
                <img src={selectedAttachment} alt="Maintenance attachment preview" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .timeline-container {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline-container::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e9ecef;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        
        .timeline-marker {
          position: absolute;
          left: -25px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #fff;
          z-index: 1;
        }
        
        .timeline-content {
          padding-left: 15px;
        }
      `}</style>
    </>
  );
};

export default MaintenanceRequestDetailsPage;
