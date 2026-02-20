import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "react-bootstrap";
import { useUpdateEmergencyAlert, useDeleteEmergencyAlert } from "@/hooks/useEmergencyAlerts";
import { toast } from "react-hot-toast";

// Define the alert type structure - updated to match database schema
type Alert = {
  id: string;
  title: string;
  description: string | null;
  alert_type: string;
  priority: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

interface EmergencyAlertsAreaProps {
  selectedAlert: Alert | null;
}

const EmergencyAlertsArea = ({ selectedAlert }: EmergencyAlertsAreaProps) => {
  // Hook mutations for alert actions
  const updateAlertMutation = useUpdateEmergencyAlert(selectedAlert?.id || '');
  const deleteAlertMutation = useDeleteEmergencyAlert();

  // Helper functions
  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "medical":
        return "ri:hospital-line";
      case "fire":
        return "ri:fire-line";
      case "security":
        return "ri:shield-line";
      case "maintenance":
        return "ri:tools-line";
      default:
        return "ri:alarm-line";
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case "medical":
        return "danger";
      case "fire":
        return "danger";
      case "security":
        return "warning";
      case "maintenance":
        return "primary";
      default:
        return "secondary";
    }
  };

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

  // Action handlers
  const handleMarkAsResolved = async () => {
    if (!selectedAlert) return;
    
    try {
      await updateAlertMutation.mutateAsync({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      });
      toast.success('Alert marked as resolved');
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const handleAssignToTeam = () => {
    toast('Assign to team functionality - coming soon', { icon: 'ℹ️' });
  };

  const handleEscalate = async () => {
    if (!selectedAlert) return;
    
    try {
      await updateAlertMutation.mutateAsync({
        priority: 'high',
      });
      toast.success('Alert escalated to high priority');
    } catch (error) {
      console.error('Error escalating alert:', error);
      toast.error('Failed to escalate alert');
    }
  };

  const handleDelete = async () => {
    if (!selectedAlert) return;
    
    if (window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      try {
        await deleteAlertMutation.mutateAsync(selectedAlert.id);
        toast.success('Alert deleted successfully');
      } catch (error) {
        console.error('Error deleting alert:', error);
        toast.error('Failed to delete alert');
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

  return (
    <CardBody>
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar-lg bg-${getAlertColor(selectedAlert.alert_type)} bg-opacity-10 rounded flex-centered`}>
            <IconifyIcon icon={getAlertIcon(selectedAlert.alert_type)} className={`fs-32 text-${getAlertColor(selectedAlert.alert_type)}`} />
          </div>
          <div>
            <h5 className="mb-1">{selectedAlert.title}</h5>
            <p className="text-muted mb-0">
              Type: <span className="fw-medium">{selectedAlert.alert_type}</span>
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
              <DropdownItem onClick={handleMarkAsResolved}>Mark as Resolved</DropdownItem>
              <DropdownItem onClick={handleAssignToTeam}>Assign to Team</DropdownItem>
              <DropdownItem onClick={handleEscalate}>Escalate</DropdownItem>
              <DropdownItem onClick={handleDelete} className="text-danger">Delete</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="alert-details">
        <div className="mb-4">
          <h6 className="mb-2">Alert Details</h6>
          <div className="bg-light rounded p-3">
            <p className="mb-0">{selectedAlert.description}</p>
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
                <span><strong>Type:</strong> {selectedAlert.alert_type}</span>
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
            {selectedAlert.alert_type === "medical" && (
              <Button variant="danger" size="sm">
                <IconifyIcon icon="ri:phone-line" className="me-1" />
                Call Ambulance
              </Button>
            )}
            {(selectedAlert.alert_type === "fire" || selectedAlert.alert_type === "security") && (
              <Button variant="warning" size="sm">
                <IconifyIcon icon="ri:shield-line" className="me-1" />
                Alert Security
              </Button>
            )}
            {selectedAlert.alert_type === "fire" && (
              <Button variant="danger" size="sm">
                <IconifyIcon icon="ri:fire-line" className="me-1" />
                Fire Department
              </Button>
            )}
            <Button variant="primary" size="sm">
              <IconifyIcon icon="ri:user-add-line" className="me-1" />
              Contact Resident
            </Button>
            <Button variant="info" size="sm">
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
                className={`rounded-circle bg-${getAlertColor(selectedAlert.alert_type)} d-flex align-items-center justify-content-center`}
                style={{
                  width: '32px',
                  height: '32px',
                  minWidth: '32px',
                  marginRight: '16px'
                }}
              >
                <IconifyIcon icon={getAlertIcon(selectedAlert.alert_type)} className="text-white fs-16" />
              </div>
              <div className="timeline-content flex-grow-1">
                <h6 className="mb-1">Alert Reported</h6>
                <p className="text-muted mb-1">{selectedAlert.title} - {selectedAlert.alert_type} emergency detected</p>
                <small className="text-muted">{formatTime(selectedAlert.created_at)}</small>
              </div>
            </div>
            
            {selectedAlert.status === "active" && (
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
                  <h6 className="mb-1">Response Team Notified</h6>
                  <p className="text-muted mb-1">Emergency response team has been alerted and is preparing to respond</p>
                  <small className="text-muted">{formatTime(selectedAlert.created_at)}</small>
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
                  <small className="text-muted">{formatTime(selectedAlert.updated_at)}</small>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h6 className="mb-2">Status Update</h6>
          <div className={`bg-${selectedAlert.status === "active" ? "warning" : "success"} bg-opacity-10 border border-${selectedAlert.status === "active" ? "warning" : "success"} rounded p-3`}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <IconifyIcon icon={selectedAlert.status === "active" ? "ri:time-line" : "ri:check-line"} className={`text-${selectedAlert.status === "active" ? "warning" : "success"}`} />
              <span className={`fw-medium text-${selectedAlert.status === "active" ? "warning" : "success"}`}>
                {selectedAlert.status === "active" ? "In Progress" : "Resolved"}
              </span>
            </div>
            <p className="mb-0 text-dark">
              {selectedAlert.status === "active" 
                ? "Emergency response is currently in progress. Monitoring situation and coordinating with relevant teams."
                : "Emergency situation has been successfully resolved. All safety protocols were followed and situation is under control."
              }
            </p>
          </div>
        </div>

        <div className="d-flex gap-2">
          {selectedAlert.status === "active" ? (
            <>
              <Button variant="success" className="flex-fill">
                <IconifyIcon icon="ri:check-line" className="me-1" />
                Mark as Resolved
              </Button>
              <Button variant="outline-primary" className="flex-fill">
                <IconifyIcon icon="ri:edit-line" className="me-1" />
                Update Status
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline-warning" className="flex-fill">
                <IconifyIcon icon="ri:restart-line" className="me-1" />
                Reopen Alert
              </Button>
              <Button variant="outline-primary" className="flex-fill">
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
