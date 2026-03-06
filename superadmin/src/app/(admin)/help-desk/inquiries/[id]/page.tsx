"use client";

import { useEffect, useMemo, useState } from "react";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  useGetInquiry,
  useListAssignableInquiryAdmins,
  useUpdateInquiry,
} from "@/hooks/useInquiries";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"] as const;

const formatLabel = (value: string | null | undefined) => {
  if (!value) {
    return "N/A";
  }

  if (value === "suggestion" || value === "suggestions") {
    return "Suggestion";
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const statusBadgeClass = (status: string | null | undefined) => {
  switch (status) {
    case "open":
      return "bg-warning-subtle text-warning";
    case "in_progress":
      return "bg-info-subtle text-info";
    case "resolved":
      return "bg-success-subtle text-success";
    case "closed":
      return "bg-secondary-subtle text-secondary";
    default:
      return "bg-light text-muted";
  }
};

const normalizeAttachments = (attachments: unknown): string[] => {
  if (Array.isArray(attachments)) {
    return attachments.filter((item): item is string => typeof item === "string");
  }

  return [];
};

const getAttachmentLabel = (url: string) => {
  const lastSegment = url.split("/").pop();
  return lastSegment || url;
};

type TimelineEvent = {
  key: string;
  title: string;
  description: string;
  timestamp: string;
  markerClass: string;
};

const isTimelineEvent = (event: TimelineEvent | null): event is TimelineEvent => event !== null;

const InquiryDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const inquiryId = typeof params?.id === "string" ? params.id : "";

  const { data: inquiry, isLoading, error } = useGetInquiry(inquiryId);
  const { data: admins = [], isLoading: adminsLoading } = useListAssignableInquiryAdmins(
    inquiry?.community_id,
  );
  const updateInquiry = useUpdateInquiry();

  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!inquiry) {
      return;
    }

    const matchedAssignee = admins.find(
      (admin) => admin.id === inquiry.assigned_to || admin.user_id === inquiry.assigned_to,
    );

    setStatus(inquiry.status ?? "open");
    setAssignedTo(matchedAssignee ? matchedAssignee.user_id || matchedAssignee.id : inquiry.assigned_to ?? "");
    setAdminResponse(inquiry.admin_response ?? "");
    setResolutionNotes(inquiry.resolution_notes ?? "");
  }, [admins, inquiry]);

  const attachments = useMemo(() => normalizeAttachments(inquiry?.attachments), [inquiry?.attachments]);

  const availableStatusOptions = useMemo(() => {
    switch (inquiry?.status) {
      case "in_progress":
        return ["open", "in_progress", "resolved"] as const;
      case "resolved":
        return ["open", "resolved", "closed"] as const;
      case "closed":
        return ["open", "closed"] as const;
      case "open":
      default:
        return ["open", "in_progress", "resolved"] as const;
    }
  }, [inquiry?.status]);

  const handleSave = async (statusOverride?: (typeof STATUS_OPTIONS)[number]) => {
    if (!inquiryId) {
      return;
    }

    const nextStatus = statusOverride || (status as (typeof STATUS_OPTIONS)[number]);
    const nowIso = new Date().toISOString();

    setFeedback(null);

    try {
      await updateInquiry.mutateAsync({
        inquiryId,
        updates: {
          status: nextStatus,
          assigned_to: assignedTo || null,
          admin_response: adminResponse.trim() || null,
          resolution_notes:
            nextStatus === "open" ? null : resolutionNotes.trim() || null,
          resolved_at:
            nextStatus === "resolved" || nextStatus === "closed" ? nowIso : null,
        },
      });

      setFeedback({
        variant: "success",
        message: `Inquiry updated to ${formatLabel(nextStatus)}.`,
      });
    } catch (mutationError) {
      console.error("Failed to update inquiry:", mutationError);
      setFeedback({
        variant: "danger",
        message: "Failed to update inquiry. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title="Inquiry Details" subName="Help Desk" />
        <Card>
          <CardBody className="text-center py-5">Loading inquiry details...</CardBody>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageTitle title="Inquiry Details" subName="Help Desk" />
        <Alert variant="danger">Failed to load inquiry: {error.message}</Alert>
      </>
    );
  }

  if (!inquiry) {
    return (
      <>
        <PageTitle title="Inquiry Details" subName="Help Desk" />
        <Alert variant="warning">Inquiry not found.</Alert>
      </>
    );
  }

  const residentName = inquiry.user_profile?.full_name || inquiry.user_name || "Unknown Resident";
  const residentEmail = inquiry.user_profile?.email || inquiry.user_email || "N/A";
  const residentPhone = inquiry.user_profile?.phone || inquiry.user_phone || "N/A";
  const assignedAdminName =
    inquiry.assignee_profile?.full_name || inquiry.assignee_profile?.email || "Unassigned";
  const canStartProgress = inquiry.status === "open";
  const canResolve = inquiry.status === "open" || inquiry.status === "in_progress";
  const canClose = inquiry.status === "resolved";
  const canReopen = inquiry.status === "resolved" || inquiry.status === "closed";
  const rawTimelineEvents: Array<TimelineEvent | null> = [
    inquiry.created_at
      ? {
          key: "created",
          title: "Inquiry Submitted",
          description: "The resident opened a new help desk request.",
          timestamp: inquiry.created_at,
          markerClass: "bg-primary",
        }
      : null,
    inquiry.responded_at
      ? {
          key: "responded",
          title: "Admin Responded",
          description: "An admin response was added to the inquiry.",
          timestamp: inquiry.responded_at,
          markerClass: "bg-info",
        }
      : null,
    inquiry.resolved_at
      ? {
          key: "resolved",
          title: inquiry.status === "closed" ? "Inquiry Closed" : "Inquiry Resolved",
          description:
            inquiry.status === "closed"
              ? "The inquiry reached a terminal closed state."
              : "The inquiry was resolved by the operations team.",
          timestamp: inquiry.resolved_at,
          markerClass: inquiry.status === "closed" ? "bg-secondary" : "bg-success",
        }
      : null,
  ];
  const timelineEvents = rawTimelineEvents.filter(isTimelineEvent);

  return (
    <>
      <PageTitle title="Inquiry Details" subName="Help Desk" />

      <Row className="mb-3">
        <Col>
          <Link href="/help-desk/inquiries" className="btn btn-outline-secondary btn-sm">
            <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
            Back to Inquiry Queue
          </Link>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xl={7}>
          <Card>
            <CardHeader>
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <CardTitle as="h4" className="mb-2">
                    {inquiry.subject}
                  </CardTitle>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-info-subtle text-info">{formatLabel(inquiry.inquiry_type)}</span>
                    <span className="badge bg-light text-dark">Priority: {formatLabel(inquiry.priority)}</span>
                    <span className={`badge ${statusBadgeClass(inquiry.status)}`}>
                      Status: {formatLabel(inquiry.status)}
                    </span>
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {canStartProgress ? (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => void handleSave("in_progress")}
                      disabled={updateInquiry.isPending}
                    >
                      <IconifyIcon icon="ri:play-line" className="me-1" />
                      Start Progress
                    </Button>
                  ) : null}
                  {canResolve ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => void handleSave("resolved")}
                      disabled={updateInquiry.isPending}
                    >
                      <IconifyIcon icon="ri:check-line" className="me-1" />
                      Resolve
                    </Button>
                  ) : null}
                  {canClose ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleSave("closed")}
                      disabled={updateInquiry.isPending}
                    >
                      <IconifyIcon icon="ri:close-circle-line" className="me-1" />
                      Close
                    </Button>
                  ) : null}
                  {canReopen ? (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => void handleSave("open")}
                      disabled={updateInquiry.isPending}
                    >
                      <IconifyIcon icon="ri:refresh-line" className="me-1" />
                      Reopen
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardBody>
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

              <h6 className="text-muted text-uppercase mb-2">Resident Description</h6>
              <p className="mb-4">{inquiry.description}</p>

              <Row className="g-3">
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Resident</h6>
                  <p className="mb-0">{residentName}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Unit</h6>
                  <p className="mb-0">{inquiry.unit_number || "N/A"}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Email</h6>
                  <p className="mb-0">{residentEmail}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Phone</h6>
                  <p className="mb-0">{residentPhone}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Community</h6>
                  <p className="mb-0">{inquiry.community?.name || "N/A"}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Agency</h6>
                  <p className="mb-0">{inquiry.agency?.name || "N/A"}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Created</h6>
                  <p className="mb-0">{inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : "N/A"}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Last Updated</h6>
                  <p className="mb-0">{inquiry.updated_at ? new Date(inquiry.updated_at).toLocaleString() : "N/A"}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Assigned To</h6>
                  <p className="mb-0">{assignedAdminName}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Responded At</h6>
                  <p className="mb-0">
                    {inquiry.responded_at ? new Date(inquiry.responded_at).toLocaleString() : "Not responded yet"}
                  </p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase mb-1">Resolved At</h6>
                  <p className="mb-0">
                    {inquiry.resolved_at ? new Date(inquiry.resolved_at).toLocaleString() : "Not resolved yet"}
                  </p>
                </Col>
              </Row>

              {inquiry.admin_response ? (
                <div className="mt-4">
                  <h6 className="text-muted text-uppercase mb-2">Current Admin Response</h6>
                  <div className="p-3 rounded bg-info-subtle text-info-emphasis">
                    {inquiry.admin_response}
                  </div>
                </div>
              ) : null}

              {inquiry.resolution_notes && (inquiry.status === "resolved" || inquiry.status === "closed") ? (
                <div className="mt-4">
                  <h6 className="text-muted text-uppercase mb-2">Resolution Notes</h6>
                  <div className="p-3 rounded bg-success-subtle text-success-emphasis">
                    {inquiry.resolution_notes}
                  </div>
                </div>
              ) : null}

              <div className="mt-4">
                <h6 className="text-muted text-uppercase mb-2">Timeline</h6>
                <div className="timeline">
                  {timelineEvents.map((event) => (
                    <div className="timeline-item" key={event.key}>
                      <div className={`timeline-marker ${event.markerClass}`}></div>
                      <div className="timeline-content">
                        <h6 className="mb-1">{event.title}</h6>
                        <p className="text-muted mb-1">{event.description}</p>
                        <small className="text-muted">
                          {new Date(event.timestamp).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-muted text-uppercase mb-2">Attachments</h6>
                  <div className="d-flex flex-column gap-2">
                    {attachments.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="text-decoration-none">
                        <IconifyIcon icon="ri:attachment-2" className="me-1" />
                        {getAttachmentLabel(url)}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col xl={5}>
          <Card>
            <CardHeader>
              <CardTitle as="h4" className="mb-0">
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardBody>
              {updateInquiry.error && !feedback ? (
                <Alert variant="danger" className="mb-3">
                  {(updateInquiry.error as Error).message}
                </Alert>
              ) : null}

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                  {availableStatusOptions.map((option) => (
                    <option value={option} key={option}>
                      {formatLabel(option)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Assign To</Form.Label>
                <Form.Select
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                  disabled={adminsLoading}
                >
                  <option value="">Unassigned</option>
                  {admins.map((admin) => {
                    const label = admin.full_name || admin.email || admin.id;
                    const assignmentValue = admin.user_id || admin.id;
                    return (
                      <option value={assignmentValue} key={admin.id}>
                        {label} ({formatLabel(admin.role)})
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Admin Response</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={adminResponse}
                  onChange={(event) => setAdminResponse(event.target.value)}
                  placeholder="Write response visible to resident"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Resolution Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={resolutionNotes}
                  onChange={(event) => setResolutionNotes(event.target.value)}
                  placeholder="Internal notes for operations audit"
                />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="primary"
                  onClick={() => void handleSave()}
                  disabled={updateInquiry.isPending}
                >
                  {updateInquiry.isPending ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default InquiryDetailsPage;
