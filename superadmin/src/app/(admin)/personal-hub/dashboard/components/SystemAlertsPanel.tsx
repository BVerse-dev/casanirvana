"use client";

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, ListGroup, Dropdown } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import AlertDetailsModal from './AlertDetailsModal';

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  timestamp: string;
}

const SystemAlertsPanel = () => {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);

  // Sample data - would be fetched from API in production
  const alerts: SystemAlert[] = [
    {
      id: 'alert-1',
      title: 'Low Balance Warning',
      message: 'MTN airtime provider balance is below threshold (20%)',
      type: 'warning',
      timestamp: '15 min ago',
    },
    {
      id: 'alert-2',
      title: 'Service Unavailable',
      message: 'Bill payment API for Water Company is currently down',
      type: 'danger',
      timestamp: '2 hours ago',
    },
    {
      id: 'alert-3',
      title: 'New Provider Added',
      message: 'Telecel has been added to available data providers',
      type: 'info',
      timestamp: '5 hours ago',
    },
    {
      id: 'alert-4',
      title: 'Marketplace Order Volume Spike',
      message: '32% increase in marketplace orders in last 24h',
      type: 'success',
      timestamp: '1 day ago',
    },
  ];
  
  // Get alert icon based on type
  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'warning':
        return 'ri:alert-line';
      case 'danger':
        return 'ri:error-warning-line';
      case 'info':
        return 'ri:information-line';
      case 'success':
        return 'ri:check-double-line';
      default:
        return 'ri:information-line';
    }
  };
  
  // Get alert icon color based on type
  const getAlertIconColor = (type: SystemAlert['type']) => {
    switch (type) {
      case 'warning':
        return 'text-warning';
      case 'danger':
        return 'text-danger';
      case 'info':
        return 'text-info';
      case 'success':
        return 'text-success';
      default:
        return 'text-secondary';
    }
  };

  // Handle view alert details
  const handleViewAlert = (alert: SystemAlert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };

  // Handle acknowledge alert
  const handleAcknowledgeAlert = async (alertId: string, note?: string) => {
    console.log('Acknowledging alert:', alertId, note);
    // In production, this would call an API
    alert('Alert acknowledged successfully!');
  };

  // Handle resolve alert
  const handleResolveAlert = async (alertId: string, note?: string) => {
    console.log('Resolving alert:', alertId, note);
    // In production, this would call an API
    alert('Alert resolved successfully!');
  };

  return (
    <>
      <AlertDetailsModal
        show={showAlertModal}
        onHide={() => setShowAlertModal(false)}
        alert={selectedAlert}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
      />
    <Card className="mb-3">
      <CardHeader>
        <CardTitle className="mb-0">System Alerts</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        <ListGroup variant="flush">
          {alerts.map((alert) => (
            <ListGroup.Item 
              key={alert.id}
              className="d-flex align-items-start py-3 px-3"
            >
              <div className={`avatar-sm me-3 ${getAlertIconColor(alert.type)}`}>
                <div className="avatar-title rounded-circle bg-light">
                  <IconifyIcon 
                    icon={getAlertIcon(alert.type)} 
                    className={getAlertIconColor(alert.type)}
                  />
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="font-14 my-0">{alert.title}</h5>
                <p className="text-muted mb-0">{alert.message}</p>
                <small className="text-muted">{alert.timestamp}</small>
              </div>
              <div className="flex-shrink-0">
                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                    <IconifyIcon icon="ri:more-2-fill" className="font-16" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleViewAlert(alert)}>
                      <IconifyIcon icon="ri:eye-line" className="me-1" />
                      View Details
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <IconifyIcon icon="ri:check-line" className="me-1" />
                      Acknowledge
                    </Dropdown.Item>
                    {alert.type === 'danger' && (
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:tools-line" className="me-1" />
                        Take Action
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item>
                      <IconifyIcon icon="ri:close-line" className="me-1" />
                      Dismiss
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="text-center p-3 border-top">
          <button className="btn btn-sm btn-link text-decoration-none">
            View All Alerts <IconifyIcon icon="ri:arrow-right-line" />
          </button>
        </div>
      </CardBody>
    </Card>
    </>
  );
};

export default SystemAlertsPanel;
