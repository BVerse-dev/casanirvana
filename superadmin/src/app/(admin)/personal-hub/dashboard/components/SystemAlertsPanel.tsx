"use client";

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle, ListGroup, Badge } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import AlertDetailsModal from './AlertDetailsModal';
import type { PersonalHubDashboardAlert } from '@/hooks/usePersonalHubDashboard';

interface SystemAlertsPanelProps {
  alerts: PersonalHubDashboardAlert[];
}

const iconByType: Record<PersonalHubDashboardAlert['type'], string> = {
  warning: 'ri:alert-line',
  danger: 'ri:error-warning-line',
  info: 'ri:information-line',
  success: 'ri:check-double-line',
};

const textClassByType: Record<PersonalHubDashboardAlert['type'], string> = {
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  success: 'text-success',
};

const formatTimestamp = (value: string | null) => {
  if (!value) return 'Just now';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Just now';

  return parsed.toLocaleString('en-GH', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SystemAlertsPanel: React.FC<SystemAlertsPanelProps> = ({ alerts }) => {
  const [selectedAlert, setSelectedAlert] = useState<PersonalHubDashboardAlert | null>(null);

  return (
    <>
      <AlertDetailsModal
        show={Boolean(selectedAlert)}
        onHide={() => setSelectedAlert(null)}
        alert={selectedAlert}
      />

      <Card className="mb-3">
        <CardHeader>
          <CardTitle className="mb-0">Operational Alerts</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {alerts.length === 0 ? (
            <div className="text-center text-muted py-5 px-4">
              No active Personal Hub alerts for the selected reporting period.
            </div>
          ) : (
            <ListGroup variant="flush">
              {alerts.map((alert) => (
                <ListGroup.Item key={alert.id} className="d-flex align-items-start gap-3 py-3 px-3">
                  <div className={`avatar-sm ${textClassByType[alert.type]}`}>
                    <div className="avatar-title rounded-circle bg-light">
                      <IconifyIcon icon={iconByType[alert.type]} className={textClassByType[alert.type]} />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                      <h6 className="mb-0">{alert.title}</h6>
                      <Badge bg={alert.type}>{alert.severity.toUpperCase()}</Badge>
                    </div>
                    <p className="text-muted mb-1">{alert.message}</p>
                    <small className="text-muted">{formatTimestamp(alert.timestamp)}</small>
                  </div>
                  <Button variant="light" size="sm" onClick={() => setSelectedAlert(alert)}>
                    View
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default SystemAlertsPanel;
