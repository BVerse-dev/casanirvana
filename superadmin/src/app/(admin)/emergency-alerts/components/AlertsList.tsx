"use client";

import { Alert, CardBody, Form } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { EmergencyAlertRecord } from "@/hooks/useEmergencyAlerts";
import { formatEmergencyAlertStatusLabel, normalizeEmergencyAlertStatus } from "@/hooks/useEmergencyAlerts";
import { getEmergencyAlertTypeMeta } from "@/lib/emergencyAlertTypes";

type AlertsListProps = {
  alerts: EmergencyAlertRecord[];
  isLoading: boolean;
  error: unknown;
  query: string;
  selectedAlertId: string | null;
  onAlertSelect: (alert: EmergencyAlertRecord) => void;
  onQueryChange: (query: string) => void;
};

const getStatusBadgeClass = (status: string | null) => {
  switch (normalizeEmergencyAlertStatus(status)) {
    case "resolved":
      return "bg-success-subtle text-success";
    case "investigating":
      return "bg-info-subtle text-info";
    case "escalated":
      return "bg-danger-subtle text-danger";
    case "pending":
      return "bg-secondary-subtle text-secondary";
    case "active":
    default:
      return "bg-warning-subtle text-warning";
  }
};

const AlertsList = ({ alerts, isLoading, error, query, selectedAlertId, onAlertSelect, onQueryChange }: AlertsListProps) => {
  return (
    <CardBody className="p-0 h-100">
      <div className="p-3 border-bottom">
        <h5 className="mb-1">Emergency Queue</h5>
        <p className="text-muted mb-3 fs-13">Review live emergency alerts and select one to manage.</p>
        <Form.Control value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search title, unit, community" />
      </div>

      {error ? (
        <div className="p-3">
          <Alert variant="danger" className="mb-0">
            Failed to load emergency alerts.
          </Alert>
        </div>
      ) : isLoading ? (
        <div className="p-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : alerts.length ? (
        <div style={{ maxHeight: 720, overflowY: "auto" }}>
          {alerts.map((alert) => {
            const alertTypeMeta = getEmergencyAlertTypeMeta(alert.alert_type);
            const isSelected = selectedAlertId === alert.id;
            const unitLabel = alert.units ? `${alert.units.block || ""}-${alert.units.number || alert.units.unit_number || ""}`.replace(/^-/, "") : null;

            return (
              <button
                key={alert.id}
                type="button"
                className={`w-100 text-start border-0 border-bottom bg-transparent p-3 ${isSelected ? "bg-primary bg-opacity-10" : ""}`}
                onClick={() => onAlertSelect(alert)}
              >
                <div className="d-flex gap-3">
                  <div className={`avatar-sm bg-${alertTypeMeta.color} bg-opacity-10 rounded flex-centered`}>
                    <IconifyIcon icon={alertTypeMeta.icon} className={`fs-18 text-${alertTypeMeta.color}`} />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <h6 className="mb-0 text-truncate">{alert.title}</h6>
                      <small className="text-muted flex-shrink-0">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="text-muted mb-2 fs-13">
                      {alert.description ? (alert.description.length > 88 ? `${alert.description.slice(0, 88)}...` : alert.description) : "No description provided."}
                    </p>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <span className={`badge bg-${alertTypeMeta.color}-subtle text-${alertTypeMeta.color}`}>{alertTypeMeta.label}</span>
                      <span className={`badge ${getStatusBadgeClass(alert.status)}`}>{formatEmergencyAlertStatusLabel(alert.status)}</span>
                      <span className="badge bg-light text-dark">{String(alert.priority || "medium").toUpperCase()}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted fs-13 gap-2">
                      <span>{alert.communities?.name || "Unassigned Community"}</span>
                      <span>{unitLabel || "No Unit"}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-muted">
          <IconifyIcon icon="ri:alarm-warning-line" className="fs-32 mb-2" />
          <p className="mb-0">No emergency alerts match the current filters.</p>
        </div>
      )}
    </CardBody>
  );
};

export default AlertsList;
