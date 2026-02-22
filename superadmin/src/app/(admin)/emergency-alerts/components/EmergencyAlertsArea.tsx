import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "react-bootstrap";
import { useUpdateEmergencyAlert, useDeleteEmergencyAlert } from "@/hooks/useEmergencyAlerts";
import { toast } from "react-hot-toast";
import { getEmergencyAlertTypeMeta, isEmergencyTypeMatch } from "@/lib/emergencyAlertTypes";

// Define the alert type structure - updated to match database schema
type AlertProfile = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};

type Alert = {
  id: string;
  title: string;
  description: string | null;
  alert_type: string;
  priority: string | null;
  status: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: AlertProfile | null;
};

interface EmergencyAlertsAreaProps {
  selectedAlert: Alert | null;
}

const EmergencyAlertsArea = ({ selectedAlert }: EmergencyAlertsAreaProps) => {
  // Hook mutations for alert actions
  const updateAlertMutation = useUpdateEmergencyAlert(selectedAlert?.id || '');
  const deleteAlertMutation = useDeleteEmergencyAlert();

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeDetailed = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusMeta = (status: string | null) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: "ri:time-line",
          color: "secondary",
          description: "Alert received and queued for initial triage.",
        };
      case "active":
        return {
          label: "Active",
          icon: "ri:alarm-warning-line",
          color: "warning",
          description: "Emergency response is in progress and responders are being coordinated.",
        };
      case "investigating":
        return {
          label: "Investigating",
          icon: "ri:search-eye-line",
          color: "info",
          description: "The response team has acknowledged the alert and started investigation.",
        };
      case "escalated":
        return {
          label: "Escalated",
          icon: "ri:arrow-up-circle-line",
          color: "danger",
          description: "Alert has been escalated for critical response handling.",
        };
      case "resolved":
        return {
          label: "Resolved",
          icon: "ri:check-line",
          color: "success",
          description: "Emergency situation has been resolved and closed.",
        };
      default:
        return {
          label: "Unknown",
          icon: "ri:question-line",
          color: "secondary",
          description: "Alert status is not recognized.",
        };
    }
  };

  const updateAlert = async (
    updates: {
      status?: string | null;
      priority?: string | null;
      resolved_at?: string | null;
      resolved_by?: string | null;
    },
    successMessage: string,
    errorMessage: string,
  ) => {
    if (!selectedAlert) return;

    try {
      await updateAlertMutation.mutateAsync(updates);
      toast.success(successMessage);
    } catch (error) {
      console.error(errorMessage, error);
      toast.error(errorMessage);
    }
  };

  // Action handlers
  const handleMarkAsResolved = async () => {
    await updateAlert(
      {
        status: "resolved",
        resolved_at: new Date().toISOString(),
      },
      "Alert marked as resolved",
      "Failed to resolve alert",
    );
  };

  const handleAssignToTeam = async () => {
    await updateAlert(
      {
        status: "investigating",
      },
      "Alert assigned to response team",
      "Failed to assign alert",
    );
  };

  const handleEscalate = async () => {
    if (!selectedAlert) return;
    await updateAlert(
      {
        priority: "critical",
        status: selectedAlert.status === "resolved" ? "resolved" : "escalated",
      },
      "Alert escalated to critical priority",
      "Failed to escalate alert",
    );
  };

  const handleReopenAlert = async () => {
    await updateAlert(
      {
        status: "active",
        resolved_at: null,
        resolved_by: null,
      },
      "Alert reopened",
      "Failed to reopen alert",
    );
  };

  const handleUpdateStatus = async () => {
    if (!selectedAlert) return;

    const statusTransitionMap: Record<string, "active" | "investigating" | "escalated"> = {
      pending: "active",
      active: "investigating",
      investigating: "escalated",
      escalated: "active",
    };
    const currentStatus = selectedAlert.status || "active";
    const nextStatus = statusTransitionMap[currentStatus] || "active";

    await updateAlert(
      {
        status: nextStatus,
        resolved_at: null,
        resolved_by: null,
      },
      `Alert status updated to ${nextStatus.replace("_", " ")}`,
      "Failed to update alert status",
    );
  };

  const handleCallEmergencyServices = () => {
    if (typeof window === "undefined") {
      toast.error("Emergency dialing is unavailable in this environment.");
      return;
    }
    window.open("tel:112", "_self");
  };

  const handleContactResident = () => {
    if (!selectedAlert || typeof window === "undefined") return;

    const email = selectedAlert.user_profile?.email?.trim();
    const phone = selectedAlert.user_profile?.phone?.trim();

    if (email) {
      const subject = encodeURIComponent(`Emergency Alert Follow-up (${selectedAlert.id})`);
      window.open(`mailto:${encodeURIComponent(email)}?subject=${subject}`, "_self");
      return;
    }

    if (phone) {
      window.open(`tel:${phone}`, "_self");
      return;
    }

    toast.error("Resident contact details are unavailable for this alert.");
  };

  const handleNotifyManagement = async () => {
    await updateAlert(
      {
        status: "investigating",
      },
      "Management has been notified",
      "Failed to notify management",
    );
  };

  const handleGenerateReport = () => {
    if (!selectedAlert || typeof window === "undefined") return;

    try {
      const statusMeta = getStatusMeta(selectedAlert.status);
      const reportPayload = {
        report_type: "emergency_alert",
        generated_at: new Date().toISOString(),
        alert: {
          id: selectedAlert.id,
          title: selectedAlert.title,
          type: selectedAlert.alert_type,
          priority: selectedAlert.priority,
          status: selectedAlert.status,
          created_at: selectedAlert.created_at,
          updated_at: selectedAlert.updated_at,
          resolved_at: selectedAlert.resolved_at || null,
          description: selectedAlert.description,
        },
        reporter: selectedAlert.user_profile || null,
        summary: {
          status_label: statusMeta.label,
          status_description: statusMeta.description,
        },
      };

      const blob = new Blob([JSON.stringify(reportPayload, null, 2)], {
        type: "application/json",
      });

      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `emergency-alert-${selectedAlert.id}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);
      toast.success("Emergency report downloaded");
    } catch (error) {
      console.error("Failed to generate emergency report", error);
      toast.error("Failed to generate report");
    }
  };

  const handleDelete = async () => {
    if (!selectedAlert) return;

    if (window.confirm("Are you sure you want to delete this alert? This action cannot be undone.")) {
      try {
        await deleteAlertMutation.mutateAsync(selectedAlert.id);
        toast.success("Alert deleted successfully");
      } catch (error) {
        console.error("Error deleting alert:", error);
        toast.error("Failed to delete alert");
      }
    }
  };

  // Show default message if no alert is selected
  if (!selectedAlert) {
    return (
      <CardBody className="d-flex align-items-center justify-content-center h-100">
        <div className="text-center">
          <IconifyIcon icon="ri:alarm-line" className="fs-64 text-muted mb-3" />
          <h5 className="text-muted">Select an alert to view details</h5>
          <p className="text-muted">Click on any alert from the list to see its detailed information and actions.</p>
        </div>
      </CardBody>
    );
  }

  const alertTypeMeta = getEmergencyAlertTypeMeta(selectedAlert.alert_type);
  const statusMeta = getStatusMeta(selectedAlert.status);
  const isResolved = selectedAlert.status === "resolved";
  const isMutationPending = updateAlertMutation.isPending || deleteAlertMutation.isPending;

  return (
    <CardBody>
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar-lg bg-${alertTypeMeta.color} bg-opacity-10 rounded flex-centered`}>
            <IconifyIcon icon={alertTypeMeta.icon} className={`fs-32 text-${alertTypeMeta.color}`} />
          </div>
          <div>
            <h5 className="mb-1">{selectedAlert.title}</h5>
            <p className="text-muted mb-0">
              Type: <span className="fw-medium">{alertTypeMeta.label}</span>
            </p>
            <small className="text-muted">{formatTimeDetailed(selectedAlert.created_at)}</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge bg-${getPriorityColor(selectedAlert.priority)}-subtle text-${getPriorityColor(selectedAlert.priority)} px-3 py-2`}>
            {selectedAlert.priority ? selectedAlert.priority.toUpperCase() : 'UNKNOWN'} PRIORITY
          </span>
          <Dropdown>
            <DropdownToggle
              variant="light"
              size="sm"
              className="no-arrow"
              id="dropdown-basic"
            >
              <IconifyIcon icon="ri:more-2-line" />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={handleMarkAsResolved} disabled={isMutationPending || isResolved}>
                Mark as Resolved
              </DropdownItem>
              <DropdownItem onClick={handleAssignToTeam} disabled={isMutationPending || isResolved}>
                Assign to Team
              </DropdownItem>
              <DropdownItem onClick={handleEscalate} disabled={isMutationPending}>
                Escalate
              </DropdownItem>
              <DropdownItem onClick={handleDelete} className="text-danger" disabled={isMutationPending}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="alert-details">
        <div className="mb-4">
          <h6 className="mb-2">Alert Details</h6>
          <div className="bg-light rounded p-3">
            <p className="mb-0">{selectedAlert.description || "No description provided."}</p>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="mb-2">Alert Information</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:calendar-line" className="text-muted" />
                <span><strong>Alert ID:</strong> {selectedAlert.id}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:alarm-line" className="text-muted" />
                <span><strong>Type:</strong> {alertTypeMeta.label}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:time-line" className="text-muted" />
                <span><strong>Reported:</strong> {formatTimeDetailed(selectedAlert.created_at)}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:flag-line" className="text-muted" />
                <span><strong>Priority:</strong> {selectedAlert.priority}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:information-line" className="text-muted" />
                <span><strong>Status:</strong> {selectedAlert.status}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:refresh-line" className="text-muted" />
                <span><strong>Last Updated:</strong> {formatTimeDetailed(selectedAlert.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="mb-2">Response Actions</h6>
          <div className="d-flex flex-wrap gap-2">
            {isEmergencyTypeMatch(selectedAlert.alert_type, "medical") && (
              <Button variant="danger" size="sm" onClick={handleCallEmergencyServices}>
                <IconifyIcon icon="ri:phone-line" className="me-1" />
                Call Ambulance
              </Button>
            )}
            {(isEmergencyTypeMatch(selectedAlert.alert_type, "fire") ||
              isEmergencyTypeMatch(selectedAlert.alert_type, "security")) && (
              <Button variant="warning" size="sm" onClick={handleAssignToTeam} disabled={isMutationPending || isResolved}>
                <IconifyIcon icon="ri:shield-line" className="me-1" />
                Alert Security
              </Button>
            )}
            {isEmergencyTypeMatch(selectedAlert.alert_type, "fire") && (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await handleEscalate();
                  handleCallEmergencyServices();
                }}
                disabled={isMutationPending}
              >
                <IconifyIcon icon="ri:fire-line" className="me-1" />
                Fire Department
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleContactResident}>
              <IconifyIcon icon="ri:user-add-line" className="me-1" />
              Contact Resident
            </Button>
            <Button variant="info" size="sm" onClick={handleNotifyManagement} disabled={isMutationPending}>
              <IconifyIcon icon="ri:building-line" className="me-1" />
              Notify Management
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="mb-2">Response Timeline</h6>
          <div className="position-relative">
            {/* Timeline vertical line */}
            <div 
              className="position-absolute bg-light" 
              style={{
                left: '15px',
                top: '20px',
                bottom: '20px',
                width: '2px',
                zIndex: 1
              }}
            ></div>
            
            {/* Timeline items */}
            <div className="timeline-item d-flex align-items-start mb-3 position-relative" style={{ zIndex: 2 }}>
                <div 
                  className={`rounded-circle bg-${alertTypeMeta.color} d-flex align-items-center justify-content-center`}
                  style={{
                    width: '32px',
                    height: '32px',
                  minWidth: '32px',
                  marginRight: '16px'
                }}
                >
                  <IconifyIcon icon={alertTypeMeta.icon} className="text-white fs-16" />
                </div>
              <div className="timeline-content flex-grow-1">
                <h6 className="mb-1">Alert Reported</h6>
                <p className="text-muted mb-1">{selectedAlert.title} - {alertTypeMeta.label} emergency detected</p>
                <small className="text-muted">{formatTime(selectedAlert.created_at)}</small>
              </div>
            </div>
            
            {(selectedAlert.status === "active" ||
              selectedAlert.status === "investigating" ||
              selectedAlert.status === "escalated" ||
              selectedAlert.status === "resolved") && (
              <div className="timeline-item d-flex align-items-start mb-3 position-relative" style={{ zIndex: 2 }}>
                <div 
                  className="rounded-circle bg-warning d-flex align-items-center justify-content-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    marginRight: '16px'
                  }}
                >
                  <IconifyIcon icon="ri:time-line" className="text-white fs-16" />
                </div>
                <div className="timeline-content flex-grow-1">
                  <h6 className="mb-1">Response Team Engaged</h6>
                  <p className="text-muted mb-1">Emergency response team has acknowledged the alert and started response handling.</p>
                  <small className="text-muted">{formatTime(selectedAlert.updated_at)}</small>
                </div>
              </div>
            )}

            {selectedAlert.status === "escalated" && (
              <div className="timeline-item d-flex align-items-start mb-3 position-relative" style={{ zIndex: 2 }}>
                <div
                  className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    marginRight: '16px'
                  }}
                >
                  <IconifyIcon icon="ri:arrow-up-circle-line" className="text-white fs-16" />
                </div>
                <div className="timeline-content flex-grow-1">
                  <h6 className="mb-1">Alert Escalated</h6>
                  <p className="text-muted mb-1">Critical escalation triggered for immediate senior response.</p>
                  <small className="text-muted">{formatTime(selectedAlert.updated_at)}</small>
                </div>
              </div>
            )}
            
            {selectedAlert.status === "resolved" && (
              <div className="timeline-item d-flex align-items-start mb-3 position-relative" style={{ zIndex: 2 }}>
                <div 
                  className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    marginRight: '16px'
                  }}
                >
                  <IconifyIcon icon="ri:check-line" className="text-white fs-16" />
                </div>
                <div className="timeline-content flex-grow-1">
                  <h6 className="mb-1">Alert Resolved</h6>
                  <p className="text-muted mb-1">Emergency situation has been resolved successfully</p>
                  <small className="text-muted">{formatTime(selectedAlert.resolved_at || selectedAlert.updated_at)}</small>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h6 className="mb-2">Status Update</h6>
          <div className={`bg-${statusMeta.color} bg-opacity-10 border border-${statusMeta.color} rounded p-3`}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <IconifyIcon icon={statusMeta.icon} className={`text-${statusMeta.color}`} />
              <span className={`fw-medium text-${statusMeta.color}`}>{statusMeta.label}</span>
            </div>
            <p className="mb-0 text-dark">{statusMeta.description}</p>
          </div>
        </div>

        <div className="d-flex gap-2">
          {!isResolved ? (
            <>
              <Button
                variant="success"
                className="flex-fill"
                onClick={handleMarkAsResolved}
                disabled={isMutationPending}
              >
                <IconifyIcon icon="ri:check-line" className="me-1" />
                Mark as Resolved
              </Button>
              <Button
                variant="outline-primary"
                className="flex-fill"
                onClick={handleUpdateStatus}
                disabled={isMutationPending}
              >
                <IconifyIcon icon="ri:edit-line" className="me-1" />
                Update Status
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-warning"
                className="flex-fill"
                onClick={handleReopenAlert}
                disabled={isMutationPending}
              >
                <IconifyIcon icon="ri:restart-line" className="me-1" />
                Reopen Alert
              </Button>
              <Button variant="outline-primary" className="flex-fill" onClick={handleGenerateReport}>
                <IconifyIcon icon="ri:file-copy-line" className="me-1" />
                Generate Report
              </Button>
            </>
          )}
        </div>
      </div>
    </CardBody>
  );
};

export default EmergencyAlertsArea;
