"use client";

import React from 'react';
import { Modal, Badge, Row, Col } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import type { PersonalHubDashboardAlert } from '@/hooks/usePersonalHubDashboard';

interface AlertDetailsModalProps {
  show: boolean;
  onHide: () => void;
  alert: PersonalHubDashboardAlert | null;
}

const iconByType: Record<PersonalHubDashboardAlert['type'], string> = {
  warning: 'ri:alert-line',
  danger: 'ri:error-warning-line',
  info: 'ri:information-line',
  success: 'ri:check-double-line',
};

const variantBySeverity: Record<PersonalHubDashboardAlert['severity'], string> = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

const formatTimestamp = (value: string | null) => {
  if (!value) return 'Not available';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available';

  return parsed.toLocaleString('en-GH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ show, onHide, alert }) => {
  if (!alert) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon={iconByType[alert.type]} className="me-2" />
          Operational Alert Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3 rounded bg-light-subtle mb-4">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div>
              <h5 className="mb-1">{alert.title}</h5>
              <p className="mb-0 text-muted">{alert.message}</p>
            </div>
            <div className="text-end">
              <Badge bg={variantBySeverity[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
              <div className="small text-muted mt-2">{formatTimestamp(alert.timestamp)}</div>
            </div>
          </div>
        </div>

        <Row>
          <Col md={6}>
            <h6 className="mb-3">Alert Context</h6>
            <div className="mb-3">
              <strong>Category:</strong> <span className="text-capitalize">{alert.category}</span>
            </div>
            <div className="mb-3">
              <strong>Status:</strong> <span className="text-capitalize">{alert.status}</span>
            </div>
            <div className="mb-3">
              <strong>Affected Services:</strong>
              <div className="mt-2 d-flex flex-wrap gap-2">
                {alert.affected_services.length === 0 ? (
                  <span className="text-muted">No service-specific impact recorded.</span>
                ) : (
                  alert.affected_services.map((service) => (
                    <Badge key={service} bg="light" text="dark">
                      {service}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </Col>

          <Col md={6}>
            <h6 className="mb-3">Technical Details</h6>
            <div className="p-3 border rounded mb-3">
              <small className="font-monospace">
                {alert.technical_details || 'No additional technical details were captured for this derived alert.'}
              </small>
            </div>
          </Col>
        </Row>

        <div>
          <h6 className="mb-3">Recommended Actions</h6>
          {alert.recommended_actions.length === 0 ? (
            <p className="text-muted mb-0">No follow-up action is required.</p>
          ) : (
            <ul className="mb-0 ps-3">
              {alert.recommended_actions.map((action) => (
                <li key={action} className="mb-2">
                  {action}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AlertDetailsModal;
