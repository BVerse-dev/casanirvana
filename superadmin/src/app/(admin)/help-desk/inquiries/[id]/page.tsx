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

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const normalizeAttachments = (attachments: unknown): string[] => {
  if (Array.isArray(attachments)) {
    return attachments.filter((item): item is string => typeof item === "string");
  }

  return [];
};

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

  const handleSave = async () => {
    if (!inquiryId) {
      return;
    }

    await updateInquiry.mutateAsync({
      inquiryId,
      updates: {
        status,
        assigned_to: assignedTo || null,
        admin_response: adminResponse.trim() || null,
        resolution_notes: resolutionNotes.trim() || null,
      },
    });
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
              <CardTitle as="h4" className="mb-0">
                {inquiry.subject}
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <span className="badge bg-info-subtle text-info me-2">{formatLabel(inquiry.inquiry_type)}</span>
                <span className="badge bg-light text-dark me-2">Priority: {formatLabel(inquiry.priority)}</span>
                <span className="badge bg-light text-dark">Status: {formatLabel(inquiry.status)}</span>
              </div>

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
              </Row>

              {attachments.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-muted text-uppercase mb-2">Attachments</h6>
                  <div className="d-flex flex-column gap-2">
                    {attachments.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="text-decoration-none">
                        <IconifyIcon icon="ri:attachment-2" className="me-1" />
                        {url}
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
              {updateInquiry.error && (
                <Alert variant="danger" className="mb-3">
                  {(updateInquiry.error as Error).message}
                </Alert>
              )}

              {updateInquiry.isSuccess && (
                <Alert variant="success" className="mb-3">
                  Inquiry updated successfully.
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                  {STATUS_OPTIONS.map((option) => (
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
                  variant="outline-primary"
                  onClick={() => setStatus("in_progress")}
                  disabled={updateInquiry.isPending}
                >
                  Mark In Progress
                </Button>
                <Button variant="success" onClick={() => setStatus("resolved")} disabled={updateInquiry.isPending}>
                  Mark Resolved
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={updateInquiry.isPending}>
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
