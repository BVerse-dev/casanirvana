import { useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Form, Modal } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { ComplaintWithContext } from "@/hooks/useComplaints";

interface ComplaintActionsProps {
  complaint: Pick<ComplaintWithContext, "id" | "status" | "priority" | "subject">;
  isUpdating?: boolean;
  onStatusChange: (
    status: "pending" | "in_progress" | "resolved",
    options?: { resolutionNotes?: string },
  ) => Promise<void>;
  onPriorityChange: (
    priority: "low" | "medium" | "high",
    options?: { reason?: string },
  ) => Promise<void>;
}

const ComplaintActions = ({
  complaint,
  isUpdating = false,
  onStatusChange,
  onPriorityChange,
}: ComplaintActionsProps) => {
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const runStatusAction = async (
    status: "pending" | "in_progress" | "resolved",
    options?: { resolutionNotes?: string },
  ) => {
    try {
      setActionError(null);
      await onStatusChange(status, options);
      if (status === "resolved") {
        setResolutionNotes("");
        setShowResolveModal(false);
      }
    } catch (error) {
      setActionError((error as Error).message || "Failed to update complaint status.");
    }
  };

  const runPriorityAction = async (priority: "low" | "medium" | "high", reason?: string) => {
    try {
      setActionError(null);
      await onPriorityChange(priority, reason ? { reason } : undefined);
      setEscalationReason("");
      setShowEscalateModal(false);
    } catch (error) {
      setActionError((error as Error).message || "Failed to update complaint priority.");
    }
  };

  const statusActions =
    complaint.status === "pending"
      ? [
          {
            label: "Mark as In Progress",
            icon: "ri:play-line",
            variant: "warning",
            action: () => runStatusAction("in_progress"),
          },
          {
            label: "Resolve Complaint",
            icon: "ri:check-line",
            variant: "success",
            action: () => setShowResolveModal(true),
          },
        ]
      : complaint.status === "in_progress"
        ? [
            {
              label: "Mark as Pending",
              icon: "ri:pause-line",
              variant: "secondary",
              action: () => runStatusAction("pending"),
            },
            {
              label: "Resolve Complaint",
              icon: "ri:check-line",
              variant: "success",
              action: () => setShowResolveModal(true),
            },
          ]
        : [
            {
              label: "Reopen Complaint",
              icon: "ri:restart-line",
              variant: "warning",
              action: () => runStatusAction("pending"),
            },
          ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle as="h5" className="mb-0">
            <IconifyIcon icon="ri:tools-line" className="me-2" />
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardBody>
          {actionError ? (
            <Alert variant="danger" className="mb-3">
              {actionError}
            </Alert>
          ) : null}

          <div className="mb-4">
            <h6 className="mb-3">Status Actions</h6>
            <div className="d-grid gap-2">
              {statusActions.map((action) => (
                <Button
                  key={action.label}
                  variant={`outline-${action.variant}`}
                  size="sm"
                  onClick={action.action}
                  disabled={isUpdating}
                >
                  <IconifyIcon icon={action.icon} className="me-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h6 className="mb-3">Priority Actions</h6>
            <div className="d-grid gap-2">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowEscalateModal(true)}
                disabled={complaint.priority === "high" || isUpdating}
              >
                <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                Escalate Priority
              </Button>
              {complaint.priority !== "low" ? (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => runPriorityAction("low")}
                  disabled={isUpdating}
                >
                  <IconifyIcon icon="ri:arrow-down-line" className="me-1" />
                  Lower Priority
                </Button>
              ) : null}
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal show={showResolveModal} onHide={() => setShowResolveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Resolve Complaint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Please provide resolution notes for complaint: <strong>{complaint.subject}</strong>
          </p>
          <Form.Group>
            <Form.Label>Resolution Notes *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Describe how the complaint was resolved..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              disabled={isUpdating}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResolveModal(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => runStatusAction("resolved", { resolutionNotes })}
            disabled={!resolutionNotes.trim() || isUpdating}
          >
            {isUpdating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Resolving...
              </>
            ) : (
              "Mark as Resolved"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEscalateModal} onHide={() => setShowEscalateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Escalate Complaint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Escalating complaint: <strong>{complaint.subject}</strong> to high priority.
          </p>
          <Form.Group>
            <Form.Label>Escalation Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Why is this complaint being escalated?"
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              disabled={isUpdating}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEscalateModal(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => runPriorityAction("high", escalationReason)}
            disabled={!escalationReason.trim() || isUpdating}
          >
            {isUpdating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Escalating...
              </>
            ) : (
              "Escalate"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ComplaintActions;
