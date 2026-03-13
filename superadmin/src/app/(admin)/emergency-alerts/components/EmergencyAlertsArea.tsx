"use client";

import { useMemo } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from "react-bootstrap";
import { toast } from "react-hot-toast";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { EmergencyAlertRecord } from "@/hooks/useEmergencyAlerts";
import { formatEmergencyAlertStatusLabel, normalizeEmergencyAlertStatus, useDeleteEmergencyAlert, useUpdateEmergencyAlert } from "@/hooks/useEmergencyAlerts";
import { getEmergencyAlertTypeMeta, normalizeEmergencyAlertType } from "@/lib/emergencyAlertTypes";

type EmergencyAlertsAreaProps = {
  selectedAlert: EmergencyAlertRecord | null;
};

const getPriorityVariant = (priority?: string | null) => {
  switch (String(priority || "").toLowerCase()) {
    case "critical":
    case "high":
      return "danger";
    case "low":
      return "success";
    case "medium":
    default:
      return "warning";
  }
};

const getStatusVariant = (status?: string | null) => {
  switch (normalizeEmergencyAlertStatus(status)) {
    case "resolved":
      return "success";
    case "investigating":
      return "info";
    case "escalated":
      return "danger";
    case "pending":
      return "secondary";
    case "active":
    default:
      return "warning";
  }
};

const formatActorName = (profile?: EmergencyAlertRecord["user_profile"] | EmergencyAlertRecord["resolved_by_profile"] | null) => {
  if (!profile) {
    return "Unknown";
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return fullName || profile.email || profile.phone || "Unknown";
};

const formatUnitLabel = (alert: EmergencyAlertRecord) => {
  if (!alert.units) {
    return "Not linked";
  }

  return `${alert.units.block || ""}-${alert.units.number || alert.units.unit_number || ""}`.replace(/^-/, "") || "Not linked";
};

const EmergencyAlertsArea = ({ selectedAlert }: EmergencyAlertsAreaProps) => {
  const updateAlertMutation = useUpdateEmergencyAlert();
  const deleteAlertMutation = useDeleteEmergencyAlert();

  const lifecycleEvents = useMemo(() => {
    if (!selectedAlert) {
      return [];
    }

    const events = [
      {
        key: "reported",
        title: "Reported",
        description: "Emergency alert created in the system.",
        timestamp: selectedAlert.created_at,
        variant: "primary",
        icon: "ri:alarm-warning-line",
      },
    ];

    const status = normalizeEmergencyAlertStatus(selectedAlert.status);
    if (selectedAlert.updated_at && selectedAlert.updated_at !== selectedAlert.created_at && status !== "resolved") {
      events.push({
        key: "status",
        title: `Status updated to ${formatEmergencyAlertStatusLabel(selectedAlert.status)}`,
        description: "The alert lifecycle state changed after the initial report.",
        timestamp: selectedAlert.updated_at,
        variant: getStatusVariant(selectedAlert.status),
        icon: "ri:refresh-line",
      });
    }

    if (selectedAlert.resolved_at) {
      events.push({
        key: "resolved",
        title: "Resolved",
        description: `Closed by ${formatActorName(selectedAlert.resolved_by_profile)}.`,
        timestamp: selectedAlert.resolved_at,
        variant: "success",
        icon: "ri:check-line",
      });
    }

    return events;
  }, [selectedAlert]);

  const updateAlert = async (
    updates: { status?: string | null; priority?: string | null },
    successMessage: string,
  ) => {
    if (!selectedAlert) {
      return;
    }

    try {
      await updateAlertMutation.mutateAsync({
        id: selectedAlert.id,
        ...updates,
      });
      toast.success(successMessage);
    } catch {
      toast.error("Failed to update emergency alert.");
    }
  };

  const handleDelete = async () => {
    if (!selectedAlert) {
      return;
    }

    if (!window.confirm(`Delete "${selectedAlert.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteAlertMutation.mutateAsync(selectedAlert.id);
      toast.success("Emergency alert deleted.");
    } catch {
      toast.error("Failed to delete emergency alert.");
    }
  };

  const handleContactResident = () => {
    if (!selectedAlert || typeof window === "undefined") {
      return;
    }

    const email = selectedAlert.user_profile?.email?.trim();
    const phone = selectedAlert.user_profile?.phone?.trim();

    if (phone) {
      window.open(`tel:${phone}`, "_self");
      return;
    }

    if (email) {
      const subject = encodeURIComponent(`Emergency Alert Follow-up (${selectedAlert.id})`);
      window.open(`mailto:${encodeURIComponent(email)}?subject=${subject}`, "_self");
      return;
    }

    toast.error("No resident contact details are available.");
  };

  const handleCallEmergencyServices = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.open("tel:112", "_self");
  };

  const handleDownloadReport = () => {
    if (!selectedAlert || typeof window === "undefined") {
      return;
    }

    const blob = new Blob(
      [
        JSON.stringify(
          {
            id: selectedAlert.id,
            title: selectedAlert.title,
            type: selectedAlert.alert_type,
            priority: selectedAlert.priority,
            status: selectedAlert.status,
            community: selectedAlert.communities?.name || null,
            unit: formatUnitLabel(selectedAlert),
            reported_by: formatActorName(selectedAlert.user_profile),
            resolved_by: formatActorName(selectedAlert.resolved_by_profile),
            created_at: selectedAlert.created_at,
            updated_at: selectedAlert.updated_at,
            resolved_at: selectedAlert.resolved_at,
            description: selectedAlert.description,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `emergency-alert-${selectedAlert.id}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (!selectedAlert) {
    return (
      <CardBody className="d-flex align-items-center justify-content-center" style={{ minHeight: 520 }}>
        <div className="text-center text-muted">
          <IconifyIcon icon="ri:alarm-warning-line" className="fs-56 mb-3" />
          <h5 className="mb-2">Select an alert</h5>
          <p className="mb-0">Choose an emergency alert from the queue to review its details and manage the response.</p>
        </div>
      </CardBody>
    );
  }

  const alertTypeMeta = getEmergencyAlertTypeMeta(selectedAlert.alert_type);
  const isResolved = normalizeEmergencyAlertStatus(selectedAlert.status) === "resolved";
  const isPending = updateAlertMutation.isPending || deleteAlertMutation.isPending;
  const canEscalate = !["resolved", "escalated"].includes(normalizeEmergencyAlertStatus(selectedAlert.status));
  const canInvestigate = ["pending", "active"].includes(normalizeEmergencyAlertStatus(selectedAlert.status));

  return (
    <CardBody>
      <div className="d-flex flex-wrap justify-content-between gap-3 border-bottom pb-3 mb-4">
        <div className="d-flex gap-3">
          <div className={`avatar-lg bg-${alertTypeMeta.color} bg-opacity-10 rounded flex-centered`}>
            <IconifyIcon icon={alertTypeMeta.icon} className={`fs-32 text-${alertTypeMeta.color}`} />
          </div>
          <div>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Badge bg={getStatusVariant(selectedAlert.status)}>{formatEmergencyAlertStatusLabel(selectedAlert.status)}</Badge>
              <Badge bg={getPriorityVariant(selectedAlert.priority)}>{String(selectedAlert.priority || "medium").toUpperCase()}</Badge>
              <Badge bg="light" text="dark">
                {alertTypeMeta.label}
              </Badge>
            </div>
            <h4 className="mb-1">{selectedAlert.title}</h4>
            <p className="text-muted mb-0">
              Reported {new Date(selectedAlert.created_at).toLocaleString()} · {selectedAlert.communities?.name || "Unassigned Community"}
            </p>
          </div>
        </div>

        <Dropdown align="end">
          <DropdownToggle variant="light" size="sm" className="no-arrow">
            <IconifyIcon icon="ri:more-2-line" />
          </DropdownToggle>
          <DropdownMenu>
            {!isResolved ? (
              <DropdownItem onClick={() => void updateAlert({ status: "resolved" }, "Emergency alert marked as resolved.")} disabled={isPending}>
                Mark as Resolved
              </DropdownItem>
            ) : (
              <DropdownItem onClick={() => void updateAlert({ status: "active" }, "Emergency alert reopened.")} disabled={isPending}>
                Reopen Alert
              </DropdownItem>
            )}
            <DropdownItem onClick={handleDownloadReport}>Download Report</DropdownItem>
            <DropdownItem onClick={handleDelete} className="text-danger" disabled={isPending}>
              Delete Alert
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <Row className="g-4">
        <Col xl={8}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-transparent border-0 pb-0">
              <h5 className="mb-0">Incident Summary</h5>
            </CardHeader>
            <CardBody>
              <p className="mb-0">{selectedAlert.description || "No description was provided for this alert."}</p>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm mt-4">
            <CardHeader className="bg-transparent border-0 pb-0">
              <h5 className="mb-0">Response Actions</h5>
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-wrap gap-2">
                {canInvestigate ? (
                  <Button variant="primary" onClick={() => void updateAlert({ status: "investigating" }, "Investigation started.")} disabled={isPending}>
                    Start Investigation
                  </Button>
                ) : null}
                {canEscalate ? (
                  <Button variant="outline-danger" onClick={() => void updateAlert({ status: "escalated", priority: "critical" }, "Emergency alert escalated.")} disabled={isPending}>
                    Escalate
                  </Button>
                ) : null}
                {!isResolved ? (
                  <Button variant="success" onClick={() => void updateAlert({ status: "resolved" }, "Emergency alert marked as resolved.")} disabled={isPending}>
                    Resolve
                  </Button>
                ) : (
                  <Button variant="outline-warning" onClick={() => void updateAlert({ status: "active" }, "Emergency alert reopened.")} disabled={isPending}>
                    Reopen
                  </Button>
                )}
                <Button variant="outline-secondary" onClick={handleContactResident}>
                  Contact Resident
                </Button>
                {["medical", "fire", "security"].includes(normalizeEmergencyAlertType(selectedAlert.alert_type)) ? (
                  <Button variant="outline-danger" onClick={handleCallEmergencyServices}>
                    Call Emergency Services
                  </Button>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm mt-4">
            <CardHeader className="bg-transparent border-0 pb-0">
              <h5 className="mb-0">Lifecycle</h5>
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-3">
                {lifecycleEvents.map((event) => (
                  <div key={event.key} className="d-flex gap-3">
                    <div className={`avatar-sm bg-${event.variant} bg-opacity-10 rounded flex-centered`}>
                      <IconifyIcon icon={event.icon} className={`text-${event.variant}`} />
                    </div>
                    <div>
                      <h6 className="mb-1">{event.title}</h6>
                      <p className="text-muted mb-1">{event.description}</p>
                      <small className="text-muted">{new Date(event.timestamp).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-transparent border-0 pb-0">
              <h5 className="mb-0">Alert Details</h5>
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-3">
                <div>
                  <p className="text-muted fs-13 mb-1">Alert ID</p>
                  <p className="mb-0 text-break">{selectedAlert.id}</p>
                </div>
                <div>
                  <p className="text-muted fs-13 mb-1">Community</p>
                  <p className="mb-0">{selectedAlert.communities?.name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-muted fs-13 mb-1">Unit</p>
                  <p className="mb-0">{formatUnitLabel(selectedAlert)}</p>
                </div>
                <div>
                  <p className="text-muted fs-13 mb-1">Reported By</p>
                  <p className="mb-0">{formatActorName(selectedAlert.user_profile)}</p>
                </div>
                <div>
                  <p className="text-muted fs-13 mb-1">Resolved By</p>
                  <p className="mb-0">{selectedAlert.resolved_at ? formatActorName(selectedAlert.resolved_by_profile) : "Not resolved"}</p>
                </div>
                <div>
                  <p className="text-muted fs-13 mb-1">Last Updated</p>
                  <p className="mb-0">{new Date(selectedAlert.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm mt-4">
            <CardHeader className="bg-transparent border-0 pb-0">
              <h5 className="mb-0">Operational Notes</h5>
            </CardHeader>
            <CardBody>
              <Alert variant={isResolved ? "success" : "warning"} className="mb-0">
                {isResolved
                  ? "This alert is closed. Reopen it only if a new response cycle is required."
                  : "Keep status changes truthful. Only resolve the alert after the incident is fully closed."}
              </Alert>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </CardBody>
  );
};

export default EmergencyAlertsArea;
