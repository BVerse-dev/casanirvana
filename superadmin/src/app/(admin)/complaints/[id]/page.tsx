"use client";
import { useParams } from "next/navigation";
import { Alert, Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Button, Tab, Tabs } from "react-bootstrap";
import { useComplaintMetrics, useGetComplaint, useUpdateComplaint } from "@/hooks/useComplaints";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useState } from "react";
import Link from "next/link";
import ComplaintComments from "../components/ComplaintComments";
import ComplaintActions from "../components/ComplaintActions";

const formatLabel = (value?: string | null) =>
  (value || "unknown")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const buildActionSuccessMessage = (status: "pending" | "in_progress" | "resolved") => {
  switch (status) {
    case "in_progress":
      return "Complaint moved to In Progress.";
    case "resolved":
      return "Complaint marked as Resolved.";
    default:
      return "Complaint reopened successfully.";
  }
};

const ComplaintDetailsPage = () => {
  const params = useParams();
  const complaintId = params.id as string;
  const { data: complaint, isLoading, error } = useGetComplaint(complaintId);
  const { data: complaintMetrics } = useComplaintMetrics();
  const updateComplaintMutation = useUpdateComplaint(complaintId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Complaint Details" subName="Operations" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading complaint details...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error || !complaint) {
    return (
      <>
        <PageTitle title="Complaint Details" subName="Operations" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                <h5>
                  {error ? "Error Loading Complaint" : "Complaint Not Found"}
                </h5>
                <p className="text-muted mb-3">
                  {error ? `Error: ${error.message}` : `No complaint found with ID: ${complaintId}`}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Link href="/complaints" className="btn btn-primary">
                    <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
                    Back to Complaints
                  </Link>
                  <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                    <IconifyIcon icon="ri:refresh-line" className="me-1" />
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  const getStatusBadgeClass = (status?: string | null) => {
    switch (status) {
      case "resolved":
        return "bg-success-subtle text-success";
      case "in_progress":
        return "bg-info-subtle text-info";
      case "pending":
        return "bg-warning-subtle text-warning";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const getPriorityBadgeClass = (priority?: string | null) => {
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

  const getComplaintType = (complaintType: string) => {
    return complaintType === 'personal' ? 'Personal' : 'Community';
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

  const handleStatusChange = async (
    status: "pending" | "in_progress" | "resolved",
    options?: { resolutionNotes?: string },
  ) => {
    await updateComplaintMutation.mutateAsync({
      status,
      ...(options?.resolutionNotes ? { resolution_notes: options.resolutionNotes } : {}),
    });
  };

  const handlePriorityChange = async (
    priority: "low" | "medium" | "high",
    options?: { reason?: string },
  ) => {
    await updateComplaintMutation.mutateAsync({
      priority,
      ...(options?.reason ? { resolution: `Priority update: ${options.reason}` } : {}),
    });
  };

  const runSafeAction = async (
    action: () => Promise<void>,
    successMessage: string,
  ) => {
    setFeedback(null);
    try {
      await action();
      setFeedback({
        variant: "success",
        message: successMessage,
      });
    } catch (mutationError) {
      console.error("Complaint action failed:", mutationError);
      setFeedback({
        variant: "danger",
        message: "Failed to apply complaint action. Please try again.",
      });
      throw mutationError;
    }
  };

  const timelineEvents = [
    complaint.created_at
      ? {
          key: "filed",
          title: "Complaint Filed",
          description: "The complaint was submitted into the complaints workflow.",
          timestamp: complaint.created_at,
          markerClass: "bg-primary",
        }
      : null,
    complaint.in_progress_at
      ? {
          key: "in-progress",
          title: "Marked In Progress",
          description: "The complaint is currently being handled by operations.",
          timestamp: complaint.in_progress_at,
          markerClass: "bg-info",
        }
      : null,
    complaint.resolved_at
      ? {
          key: "resolved",
          title: "Complaint Resolved",
          description: "The complaint was resolved and closed by the admin team.",
          timestamp: complaint.resolved_at,
          markerClass: "bg-success",
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    title: string;
    description: string;
    timestamp: string;
    markerClass: string;
  }>;

  const canStartProgress = complaint.status === "pending";
  const canResolve = complaint.status === "pending" || complaint.status === "in_progress";
  const canReopen = complaint.status === "resolved";

  return (
    <>
      <PageTitle title="Complaint Details" subName="Operations" />
      
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/complaints" 
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
              Back to Complaints
            </Link>
            <div className="d-flex gap-2">
              {canStartProgress && (
                <>
                  <Button
                    variant="warning"
                    onClick={() =>
                      void runSafeAction(
                        () => handleStatusChange("in_progress"),
                        buildActionSuccessMessage("in_progress"),
                      )
                    }
                    disabled={updateComplaintMutation.isPending}
                  >
                    <IconifyIcon icon="ri:play-line" className="me-1" />
                    Start Progress
                  </Button>
                </>
              )}
              {canResolve && (
                <>
                  <Button
                    variant="success"
                    onClick={() =>
                      void runSafeAction(
                        () => handleStatusChange("resolved"),
                        buildActionSuccessMessage("resolved"),
                      )
                    }
                    disabled={updateComplaintMutation.isPending}
                  >
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Mark as Resolved
                  </Button>
                </>
              )}
              {canReopen && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    void runSafeAction(
                      () => handleStatusChange("pending"),
                      buildActionSuccessMessage("pending"),
                    )
                  }
                  disabled={updateComplaintMutation.isPending}
                >
                  <IconifyIcon icon="ri:refresh-line" className="me-1" />
                  Reopen
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

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
          <Card className="mb-4">
            <CardHeader className="border-bottom">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <CardTitle as="h4" className="mb-1">
                    {complaint.subject}
                  </CardTitle>
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <Badge className={`py-1 px-2 fs-13 ${getStatusBadgeClass(complaint.status)}`}>
                      {formatLabel(complaint.status || "pending")}
                    </Badge>
                    <Badge className={`py-1 px-2 fs-13 ${getPriorityBadgeClass(complaint.priority)}`}>
                      {formatLabel(complaint.priority || "medium")} Priority
                    </Badge>
                    <Badge className="bg-info-subtle text-info py-1 px-2 fs-13">
                      {formatLabel(complaint.category || "uncategorized")}
                    </Badge>
                    <Badge className="bg-primary-subtle text-primary py-1 px-2 fs-13">
                      {getComplaintType(complaint.complaint_type)}
                    </Badge>
                  </div>
                </div>
                <div className="text-muted fs-13">
                  <div>ID: #{complaint.id}</div>
                  <div>Filed: {formatDate(complaint.created_at)}</div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Tabs defaultActiveKey="details" className="mb-3">
                <Tab eventKey="details" title="Details">
                  <div className="mb-4">
                    <h6 className="mb-2">Description</h6>
                    <p className="text-muted mb-0 lh-base">
                      {complaint.details || 'No details available'}
                    </p>
                  </div>

                  {/* Attachments Section */}
                  {complaint.images && complaint.images.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Attachments ({complaint.images.length})</h6>
                      <Row className="g-3">
                        {complaint.images.map((image, index) => (
                          <Col md={3} key={index}>
                            <div 
                              className="border rounded overflow-hidden cursor-pointer"
                              onClick={() => setSelectedImage(image)}
                              style={{ height: "120px" }}
                            >
                              <img
                                src={image}
                                alt={`Attachment ${index + 1}`}
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {/* Resolution Notes */}
                  {complaint.resolution_notes && complaint.resolved_at && (
                    <div className="mb-4">
                      <h6 className="mb-2">Resolution Notes</h6>
                      <div className="p-3 bg-success-subtle rounded">
                        <p className="mb-0 text-success-emphasis">
                          {complaint.resolution_notes}
                        </p>
                        {complaint.resolved_by_profile && (
                          <small className="text-muted">
                            Resolved by: {`${(complaint.resolved_by_profile as any)?.first_name || ""} ${(complaint.resolved_by_profile as any)?.last_name || ""}`.trim() ||
                              (complaint.resolved_by_profile as any)?.full_name ||
                              "N/A"}
                          </small>
                        )}
                        {complaint.resolved_by_profile_id && !complaint.resolved_by_profile && (
                          <small className="text-muted">
                            Resolved by: {complaint.resolved_by_profile_id.substring(0, 8)}...
                          </small>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div>
                    <h6 className="mb-3">Timeline</h6>
                    <div className="timeline">
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
                
                <Tab eventKey="comments" title="Comments">
                  <ComplaintComments complaintId={complaintId} />
                </Tab>
                
                <Tab eventKey="actions" title="Actions">
                  <ComplaintActions
                    complaint={complaint}
                    isUpdating={updateComplaintMutation.isPending}
                    onStatusChange={(status, options) =>
                      runSafeAction(
                        () => handleStatusChange(status, options),
                        buildActionSuccessMessage(status),
                      )
                    }
                    onPriorityChange={(priority, options) =>
                      runSafeAction(
                        () => handlePriorityChange(priority, options),
                        `Complaint priority updated to ${formatLabel(priority)}.`,
                      )
                    }
                  />
                </Tab>
              </Tabs>
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
                    {complaint.reporter_name}
                    {!complaint.reporter_profile && complaint.raised_by && (
                      <small className="text-muted d-block">ID: {complaint.raised_by.substring(0, 8)}...</small>
                    )}
                  </h6>
                  <p className="text-muted mb-0 fs-13">{complaint.reporter_email || "Resident"}</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted">Unit</small>
                    <div className="fw-medium">
                      {complaint.unit?.number || complaint.unit?.unit_number || "N/A"}
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Block</small>
                    <div className="fw-medium">{complaint.unit?.block || "N/A"}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Community</small>
                  <div className="fw-medium">{complaint.community?.name || "N/A"}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-2">
                {canResolve && (
                  <>
                    {canStartProgress ? (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() =>
                          void runSafeAction(
                            () => handleStatusChange("in_progress"),
                            buildActionSuccessMessage("in_progress"),
                          )
                        }
                        disabled={updateComplaintMutation.isPending}
                      >
                        <IconifyIcon icon="ri:play-line" className="me-1" />
                        Start Progress
                      </Button>
                    ) : null}
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        void runSafeAction(
                          () => handleStatusChange("resolved"),
                          buildActionSuccessMessage("resolved"),
                        )
                      }
                      disabled={updateComplaintMutation.isPending}
                    >
                      <IconifyIcon icon="ri:check-line" className="me-1" />
                      Mark as Resolved
                    </Button>
                  </>
                )}
                {canReopen ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      void runSafeAction(
                        () => handleStatusChange("pending"),
                        buildActionSuccessMessage("pending"),
                      )
                    }
                    disabled={updateComplaintMutation.isPending}
                  >
                    <IconifyIcon icon="ri:refresh-line" className="me-1" />
                    Reopen Complaint
                  </Button>
                ) : null}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() =>
                    void runSafeAction(
                      () => handlePriorityChange("high"),
                      "Complaint escalated to High priority.",
                    )
                  }
                  disabled={complaint.priority === "high" || updateComplaintMutation.isPending}
                >
                  <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                  Escalate Issue
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                Related Statistics
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="row g-3 text-center">
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-primary">{complaintMetrics?.total ?? "-"}</h5>
                    <small className="text-muted">Total Complaints</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-success">{complaintMetrics?.resolved ?? "-"}</h5>
                    <small className="text-muted">Resolved</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-warning">{complaintMetrics?.inProgress ?? "-"}</h5>
                    <small className="text-muted">In Progress</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-danger">{complaintMetrics?.pending ?? "-"}</h5>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={() => setSelectedImage(null)}
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
                  onClick={() => setSelectedImage(null)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={selectedImage} 
                  alt="Attachment Preview" 
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComplaintDetailsPage;
