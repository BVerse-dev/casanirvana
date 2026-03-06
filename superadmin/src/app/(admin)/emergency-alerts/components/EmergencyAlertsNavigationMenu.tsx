"use client";

import { useMemo, useState } from "react";
import { Button, CardBody, Form, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { EmergencyAlertRecord, EmergencyAlertStatus } from "@/hooks/useEmergencyAlerts";
import { normalizeEmergencyAlertStatus, useCreateEmergencyAlert } from "@/hooks/useEmergencyAlerts";
import { EMERGENCY_ALERT_CREATE_OPTIONS, EMERGENCY_ALERT_TYPE_META, normalizeEmergencyAlertType } from "@/lib/emergencyAlertTypes";

import type { EmergencyAlertFilterState } from "./EmergencyAlertsView";

type EmergencyAlertsNavigationMenuProps = {
  alerts: EmergencyAlertRecord[];
  filters: EmergencyAlertFilterState;
  onFilterChange: (nextFilters: Partial<EmergencyAlertFilterState>) => void;
};

const STATUS_OPTIONS: { key: EmergencyAlertStatus | "all"; label: string; icon: string }[] = [
  { key: "active", label: "Active", icon: "ri:alarm-warning-line" },
  { key: "pending", label: "Pending", icon: "ri:time-line" },
  { key: "investigating", label: "Investigating", icon: "ri:search-eye-line" },
  { key: "resolved", label: "Resolved", icon: "ri:check-line" },
  { key: "all", label: "All Alerts", icon: "ri:list-check" },
];

const EmergencyAlertsNavigationMenu = ({ alerts, filters, onFilterChange }: EmergencyAlertsNavigationMenuProps) => {
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    alert_type: EMERGENCY_ALERT_CREATE_OPTIONS[0].value,
    priority: "medium",
  });

  const createAlertMutation = useCreateEmergencyAlert();

  const statusCounts = useMemo(() => {
    return alerts.reduce<Record<string, number>>((accumulator, alert) => {
      const key = normalizeEmergencyAlertStatus(alert.status);
      accumulator[key] = (accumulator[key] || 0) + 1;
      accumulator.all = (accumulator.all || 0) + 1;
      return accumulator;
    }, {});
  }, [alerts]);

  const typeCounts = useMemo(() => {
    return alerts.reduce<Record<string, number>>((accumulator, alert) => {
      const key = normalizeEmergencyAlertType(alert.alert_type);
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});
  }, [alerts]);

  const handleSubmit = async (event?: React.FormEvent | React.MouseEvent) => {
    event?.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title for the alert.");
      return;
    }

    try {
      await createAlertMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        alert_type: formData.alert_type,
        priority: formData.priority,
        status: "active",
      });

      toast.success("Emergency alert created successfully.");
      setShowNewAlertModal(false);
      setFormData({
        title: "",
        description: "",
        alert_type: EMERGENCY_ALERT_CREATE_OPTIONS[0].value,
        priority: "medium",
      });
      onFilterChange({ status: "active", type: "all", query: "" });
    } catch {
      toast.error("Failed to create emergency alert.");
    }
  };

  return (
    <>
      <CardBody className="p-0 h-100">
        <div className="p-3 border-bottom">
          <Button variant="danger" className="w-100 d-flex align-items-center justify-content-center gap-2" onClick={() => setShowNewAlertModal(true)}>
            <IconifyIcon icon="ri:alarm-warning-line" className="fs-18" />
            Create Alert
          </Button>
        </div>

        <div className="p-3 border-bottom">
          <p className="text-muted text-uppercase fs-12 fw-semibold mb-2">Status</p>
          <div className="d-grid gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isActive = filters.status === option.key;
              const count = statusCounts[option.key] || 0;
              return (
                <Button
                  key={option.key}
                  variant={isActive ? "primary" : "light"}
                  className="d-flex align-items-center justify-content-between"
                  onClick={() => onFilterChange({ status: option.key })}
                >
                  <span className="d-flex align-items-center gap-2">
                    <IconifyIcon icon={option.icon} />
                    {option.label}
                  </span>
                  <span className={`badge ${isActive ? "bg-white text-primary" : "bg-primary-subtle text-primary"}`}>{count}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="p-3">
          <p className="text-muted text-uppercase fs-12 fw-semibold mb-2">Alert Type</p>
          <div className="d-grid gap-2">
            <Button variant={filters.type === "all" ? "primary" : "light"} className="d-flex align-items-center justify-content-between" onClick={() => onFilterChange({ type: "all" })}>
              <span>All Types</span>
              <span className={`badge ${filters.type === "all" ? "bg-white text-primary" : "bg-primary-subtle text-primary"}`}>{alerts.length}</span>
            </Button>
            {Object.entries(EMERGENCY_ALERT_TYPE_META).map(([key, meta]) => (
              <Button
                key={key}
                variant={filters.type === key ? "primary" : "light"}
                className="d-flex align-items-center justify-content-between"
                onClick={() => onFilterChange({ type: key })}
              >
                <span className="d-flex align-items-center gap-2">
                  <IconifyIcon icon={meta.icon} />
                  {meta.label}
                </span>
                <span className={`badge ${filters.type === key ? "bg-white text-primary" : "bg-primary-subtle text-primary"}`}>{typeCounts[key] || 0}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardBody>

      <Modal show={showNewAlertModal} onHide={() => setShowNewAlertModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Emergency Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Alert Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                placeholder="Emergency title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Alert Type</Form.Label>
              <Form.Select
                value={formData.alert_type}
                onChange={(event) => setFormData((current) => ({ ...current, alert_type: event.target.value }))}
              >
                {EMERGENCY_ALERT_CREATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={formData.priority}
                onChange={(event) => setFormData((current) => ({ ...current, priority: event.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                placeholder="Operational details for the response team"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowNewAlertModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={createAlertMutation.isPending}>
            {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmergencyAlertsNavigationMenu;
