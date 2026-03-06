"use client";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";
import { useDeleteComplaint, useListComplaints, useUpdateComplaint } from "@/hooks/useComplaints";
import ComplaintGridCard from "./components/ComplaintGridCard";
import { useState } from "react";

const formatLabel = (value?: string | null) =>
  (value || "unknown")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const truncateText = (value?: string | null, maxLength = 80) => {
  if (!value) return "No details available";
  return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
};

const getComplaintTypeLabel = (value?: string | null) =>
  value === "personal" ? "Personal" : "Community";

const ComplaintsPage = () => {
  const { data: complaints = [], isLoading, error } = useListComplaints();
  const updateComplaintMutation = useUpdateComplaint();
  const deleteComplaintMutation = useDeleteComplaint();
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Complaints Management" subName="Community Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading complaints...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageTitle title="Complaints Management" subName="Community Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                Error loading complaints: {error.message}
                <div className="mt-3">
                  <Button variant="primary" onClick={() => window.location.reload()}>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStatusUpdate = async (
    complaintId: string,
    status: "pending" | "in_progress" | "resolved",
  ) => {
    setFeedback(null);
    try {
      const now = new Date().toISOString();
      const updates: Record<string, string | null> = {
        status,
        updated_at: now,
      };
      if (status === "in_progress") {
        updates.in_progress_at = now;
        updates.resolved_at = null;
      } else if (status === "resolved") {
        updates.resolved_at = now;
      } else if (status === "pending") {
        updates.in_progress_at = null;
        updates.resolved_at = null;
        updates.resolution_notes = null;
      }
      await updateComplaintMutation.mutateAsync({ id: complaintId, data: updates });
      setFeedback({
        variant: "success",
        message: `Complaint ${complaintId.slice(0, 8)} updated to ${formatLabel(status)}.`,
      });
    } catch (mutationError) {
      console.error("Failed to update complaint status:", mutationError);
      setFeedback({
        variant: "danger",
        message: `Failed to update complaint ${complaintId.slice(0, 8)}.`,
      });
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!window.confirm("Delete this complaint? This action cannot be undone.")) return;
    setFeedback(null);
    try {
      await deleteComplaintMutation.mutateAsync(complaintId);
      setFeedback({
        variant: "success",
        message: `Complaint ${complaintId.slice(0, 8)} deleted.`,
      });
    } catch (mutationError) {
      console.error("Failed to delete complaint:", mutationError);
      setFeedback({
        variant: "danger",
        message: `Failed to delete complaint ${complaintId.slice(0, 8)}.`,
      });
    }
  };

  return (
    <>
      <PageTitle title="Complaints Management" subName="Community Management" />
      
      {/* Dashboard Components */}
      <ComplaintGridCard />
      
      {/* Complaints Table */}
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={"h4"} className="mb-0">
                  All Complaints ({complaints?.length || 0})
                </CardTitle>
              </div>
              <span className="badge bg-light-subtle text-muted border">
                Real-time list
              </span>
            </CardHeader>
            {feedback ? (
              <Alert
                variant={feedback.variant}
                className="m-3 mb-0"
                dismissible
                onClose={() => setFeedback(null)}
              >
                {feedback.message}
              </Alert>
            ) : null}
            <div className="table-responsive">
              <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Complaint Details</th>
                    <th>Resident</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-muted">
                        No complaints found.
                      </td>
                    </tr>
                  ) : complaints.map((complaint) => {
                    const actionConfig =
                      complaint.status === "pending"
                        ? {
                            title: "Start Progress",
                            icon: "ri:play-line",
                            variant: "soft-warning",
                            nextStatus: "in_progress" as const,
                          }
                        : complaint.status === "in_progress"
                          ? {
                              title: "Mark as Resolved",
                              icon: "ri:check-line",
                              variant: "soft-success",
                              nextStatus: "resolved" as const,
                            }
                          : {
                              title: "Reopen Complaint",
                              icon: "ri:refresh-line",
                              variant: "soft-secondary",
                              nextStatus: "pending" as const,
                            };

                    return (
                    <tr key={complaint.id}>
                      <td>
                        <div className="d-flex align-items-start gap-3">
                          <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered">
                            <IconifyIcon
                              icon="ri:feedback-line"
                              className="fs-18 text-primary"
                            />
                          </div>
                          <div className="flex-grow-1">
                            <Link 
                              href={`/complaints/${complaint.id}`}
                              className="text-decoration-none"
                            >
                              <h6 className="mb-1 text-dark hover-primary">
                                {complaint.subject}
                              </h6>
                              <p className="text-muted mb-0 fs-13 hover-primary">
                                {truncateText(complaint.details)}
                              </p>
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{complaint.reporter_name || "N/A"}</div>
                          <small className="text-muted">
                            Unit: {complaint.unit?.number || complaint.unit?.unit_number || "N/A"}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${complaint.complaint_type === 'personal' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'} py-1 px-2 fs-13`}>
                          {getComplaintTypeLabel(complaint.complaint_type)}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info py-1 px-2 fs-13">
                          {formatLabel(complaint.category || "uncategorized")}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getPriorityBadgeClass(
                            complaint.priority
                          )} py-1 px-2 fs-13`}
                        >
                          {formatLabel(complaint.priority || "medium")}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusBadgeClass(
                            complaint.status
                          )} py-1 px-2 fs-13`}
                        >
                          {formatLabel(complaint.status || "pending")}
                        </span>
                      </td>
                      <td>{formatDate(complaint.created_at)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/complaints/${complaint.id}`}>
                            <Button 
                              variant="light" 
                              size="sm"
                              className="d-flex align-items-center"
                            >
                              <IconifyIcon
                                icon="solar:eye-broken"
                                className="align-middle fs-18"
                              />
                            </Button>
                          </Link>
                          <Button
                            variant={actionConfig.variant}
                            size="sm"
                            onClick={() => handleStatusUpdate(complaint.id, actionConfig.nextStatus)}
                            disabled={updateComplaintMutation.isPending}
                            title={actionConfig.title}
                          >
                            <IconifyIcon
                              icon={actionConfig.icon}
                              className="align-middle fs-18"
                            />
                          </Button>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            onClick={() => handleDeleteComplaint(complaint.id)}
                            disabled={deleteComplaintMutation.isPending}
                          >
                            <IconifyIcon
                              icon="ri:delete-bin-line"
                              className="align-middle fs-18"
                            />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <CardFooter className="d-flex align-items-center justify-content-between">
              <p className="text-muted mb-0">
                Showing <span className="fw-semibold">{complaints.length}</span> live complaint
                {complaints.length === 1 ? "" : "s"}.
              </p>
              <span className="text-muted fs-13">
                Updates sync automatically when complaint records change.
              </span>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ComplaintsPage;
