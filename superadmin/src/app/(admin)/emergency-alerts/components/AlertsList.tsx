import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { CardBody, TabContent, TabPane } from "react-bootstrap";
import { useListEmergencyAlerts } from "@/hooks/useEmergencyAlerts";
import {
  getEmergencyAlertTypeMeta,
  isEmergencyTypeMatch,
} from "@/lib/emergencyAlertTypes";

// Define the alert type structure
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

interface AlertsListProps {
  onAlertSelect: (alert: Alert) => void;
  selectedAlert: Alert | null;
}

const AlertsList = ({ onAlertSelect, selectedAlert }: AlertsListProps) => {
  // Fetch emergency alerts data from Supabase
  const { data: alerts = [], isLoading, error } = useListEmergencyAlerts();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render alert item component
  const renderAlertItem = (alert: Alert) => {
    const alertTypeMeta = getEmergencyAlertTypeMeta(alert.alert_type);
    return (
      <div
        key={alert.id}
        className={`p-3 border-bottom cursor-pointer email-item ${
          selectedAlert?.id === alert.id ? "bg-primary bg-opacity-10 border-primary" : ""
        }`}
        onClick={() => onAlertSelect(alert)}
      >
        <div className="d-flex align-items-start gap-3">
          <div className={`avatar-sm bg-${alertTypeMeta.color} bg-opacity-10 rounded flex-centered`}>
            <IconifyIcon
              icon={alertTypeMeta.icon}
              className={`fs-18 text-${alertTypeMeta.color}`}
            />
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="mb-1">{alert.title}</h6>
              <small className="text-muted">{formatTime(alert.created_at)}</small>
            </div>
            <p className="text-muted mb-1 fs-13">
              {alert.description
                ? alert.description.length > 60
                  ? `${alert.description.substring(0, 60)}...`
                  : alert.description
                : "No description available"}
            </p>
            <div className="d-flex align-items-center gap-2">
              <span
                className={`badge bg-${alertTypeMeta.color}-subtle text-${alertTypeMeta.color} px-2 py-1 fs-12`}
              >
                {alertTypeMeta.label}
              </span>
              {alert.priority === "high" && (
                <span className="badge bg-danger-subtle text-danger px-2 py-1 fs-12">
                  High Priority
                </span>
              )}
              <span
                className={`badge ${
                  alert.status === "active"
                    ? "bg-warning-subtle text-warning"
                    : alert.status === "resolved"
                      ? "bg-success-subtle text-success"
                      : "bg-info-subtle text-info"
                } px-2 py-1 fs-12`}
              >
                {alert.status ? alert.status.charAt(0).toUpperCase() + alert.status.slice(1) : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <CardBody className="p-0">
        <div className="p-3 border-bottom">
          <h5 className="mb-0">Emergency Alerts</h5>
          <small className="text-muted">Loading...</small>
        </div>
        <div className="p-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </CardBody>
    );
  }

  // Error state
  if (error) {
    return (
      <CardBody className="p-0">
        <div className="p-3 border-bottom">
          <h5 className="mb-0">Emergency Alerts</h5>
          <small className="text-danger">Error loading alerts</small>
        </div>
        <div className="p-4 text-center">
          <IconifyIcon icon="ri:error-warning-line" className="fs-32 text-danger mb-2" />
          <p className="text-muted">Failed to load alerts data</p>
        </div>
      </CardBody>
    );
  }

  return (
    <CardBody className="p-0">
      <div className="p-3 border-bottom">
        <h5 className="mb-0">Emergency Alerts</h5>
        <small className="text-muted">{alerts.length} total alerts</small>
      </div>
      <TabContent style={{ maxHeight: "600px", overflowY: "auto" }}>
        <TabPane eventKey="active">
          <div className="p-2">
            {alerts
              .filter((alert: Alert) => alert.status === "active")
              .map((alert: Alert) => renderAlertItem(alert))}
          </div>
        </TabPane>
        <TabPane eventKey="resolved">
          <div className="p-2">
            {alerts
              .filter((alert: Alert) => alert.status === "resolved")
              .map((alert: Alert) => renderAlertItem(alert))}
          </div>
        </TabPane>
        <TabPane eventKey="all">
          <div className="p-2">
            {alerts.map((alert: Alert) => renderAlertItem(alert))}
          </div>
        </TabPane>
        <TabPane eventKey="medical">
          <div className="p-2">
            {alerts
              .filter((alert: Alert) => isEmergencyTypeMatch(alert.alert_type, "medical"))
              .map((alert: Alert) => renderAlertItem(alert))}
          </div>
        </TabPane>
        <TabPane eventKey="fire">
          <div className="p-2">
            {alerts
              .filter((alert: Alert) => isEmergencyTypeMatch(alert.alert_type, "fire"))
              .map((alert: Alert) => renderAlertItem(alert))}
          </div>
        </TabPane>
        <TabPane eventKey="security">
          <div className="p-2">
            {alerts
              .filter((alert: Alert) => isEmergencyTypeMatch(alert.alert_type, "security"))
              .map((alert: Alert) => renderAlertItem(alert))}
          </div>
        </TabPane>
        <TabPane eventKey="maintenance">
          <div className="p-2">
            {alerts
              .filter((alert: Alert) => isEmergencyTypeMatch(alert.alert_type, "maintenance"))
              .map((alert: Alert) => renderAlertItem(alert))}
          </div>
        </TabPane>
      </TabContent>
    </CardBody>
  );
};

export default AlertsList;
