import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Modal } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface ComplaintActionsProps {
  complaint: {
    id: string;
    status: string;
    priority: string;
    title: string;
  };
  onStatusChange?: (status: string) => void;
  onPriorityChange?: (priority: string) => void;
}

const ComplaintActions = ({ complaint, onStatusChange, onPriorityChange }: ComplaintActionsProps) => {
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolveComplaint = async () => {
    if (!resolutionNotes.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Resolving complaint with notes:", resolutionNotes);
    onStatusChange?.("resolved");
    
    setShowResolveModal(false);
    setResolutionNotes("");
    setIsSubmitting(false);
  };

  const handleEscalateComplaint = async () => {
    if (!escalationReason.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Escalating complaint with reason:", escalationReason);
    onPriorityChange?.("high");
    
    setShowEscalateModal(false);
    setEscalationReason("");
    setIsSubmitting(false);
  };

  const getStatusActions = () => {
    switch (complaint.status) {
      case "pending":
        return [
          {
            label: "Mark as In Progress",
            icon: "ri:play-line",
            variant: "warning",
            action: () => onStatusChange?.("in_progress"),
          },
          {
            label: "Resolve Complaint",
            icon: "ri:check-line",
            variant: "success",
            action: () => setShowResolveModal(true),
          },
        ];
      case "in_progress":
        return [
          {
            label: "Mark as Pending",
            icon: "ri:pause-line",
            variant: "secondary",
            action: () => onStatusChange?.("pending"),
          },
          {
            label: "Resolve Complaint",
            icon: "ri:check-line",
            variant: "success",
            action: () => setShowResolveModal(true),
          },
        ];
      case "resolved":
        return [
          {
            label: "Reopen Complaint",
            icon: "ri:restart-line",
            variant: "warning",
            action: () => onStatusChange?.("pending"),
          },
        ];
      default:
        return [];
    }
  };

  const statusActions = getStatusActions();

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
          {/* Status Actions */}
          <div className="mb-4">
            <h6 className="mb-3">Status Actions</h6>
            <div className="d-grid gap-2">
              {statusActions.map((action, index) => (
                <Button
                  key={index}
                  variant={`outline-${action.variant}`}
                  size="sm"
                  onClick={action.action}
                >
                  <IconifyIcon icon={action.icon} className="me-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Priority Actions */}
          <div className="mb-4">
            <h6 className="mb-3">Priority Actions</h6>
            <div className="d-grid gap-2">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowEscalateModal(true)}
                disabled={complaint.priority === "high"}
              >
                <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                Escalate Priority
              </Button>
              {complaint.priority !== "low" && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => onPriorityChange?.("low")}
                >
                  <IconifyIcon icon="ri:arrow-down-line" className="me-1" />
                  Lower Priority
                </Button>
              )}
            </div>
          </div>

          {/* Administrative Actions */}
          <div>
            <h6 className="mb-3">Administrative</h6>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" size="sm">
                <IconifyIcon icon="ri:edit-line" className="me-1" />
                Edit Details
              </Button>
              <Button variant="outline-info" size="sm">
                <IconifyIcon icon="ri:file-copy-line" className="me-1" />
                Duplicate Complaint
              </Button>
              <Button variant="outline-secondary" size="sm">
                <IconifyIcon icon="ri:download-line" className="me-1" />
                Export PDF
              </Button>
              <Button variant="outline-danger" size="sm">
                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                Archive
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Resolve Complaint Modal */}
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
              disabled={isSubmitting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResolveModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleResolveComplaint}
            disabled={!resolutionNotes.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Resolving...
              </>
            ) : (
              "Mark as Resolved"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Escalate Complaint Modal */}
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
              disabled={isSubmitting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEscalateModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleEscalateComplaint}
            disabled={!escalationReason.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
