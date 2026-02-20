"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Form, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  timestamp: string;
  // Extended details for modal
  category?: 'system' | 'provider' | 'financial' | 'security' | 'performance';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  affectedServices?: string[];
  recommendedActions?: string[];
  technicalDetails?: string;
  acknowledgeable?: boolean;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  relatedAlerts?: string[];
}

interface AlertDetailsModalProps {
  show: boolean;
  onHide: () => void;
  alert: SystemAlert | null;
  onAcknowledge?: (alertId: string, note?: string) => void;
  onResolve?: (alertId: string, note?: string) => void;
}

const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ 
  show, 
  onHide, 
  alert,
  onAcknowledge,
  onResolve
}) => {
  const [actionNote, setActionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!alert) return null;

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

  // Get alert color based on type
  const getAlertColor = (type: SystemAlert['type']) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Get severity badge variant
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the alert
  const extendedAlert = {
    ...alert,
    category: alert.type === 'warning' ? 'provider' : 
              alert.type === 'danger' ? 'system' :
              alert.type === 'info' ? 'system' :
              'performance',
    severity: alert.type === 'danger' ? 'critical' :
              alert.type === 'warning' ? 'high' :
              'medium',
    affectedServices: alert.title.includes('MTN') ? ['Airtime', 'Data'] :
                     alert.title.includes('Water') ? ['Bill Payment'] :
                     alert.title.includes('Marketplace') ? ['Marketplace'] :
                     ['All Services'],
    recommendedActions: alert.type === 'warning' ? 
      ['Top up provider balance', 'Monitor balance levels', 'Set up automatic top-ups'] :
      alert.type === 'danger' ?
      ['Contact provider support', 'Switch to backup provider', 'Notify affected customers'] :
      ['Monitor system performance', 'Update documentation'],
    technicalDetails: alert.type === 'danger' ? 
      'API endpoint returning 503 Service Unavailable. Last successful request: 2 hours ago. Error rate: 100%' :
      alert.type === 'warning' ?
      'Current balance: $2,450. Threshold: $10,000. Daily usage: $3,200. Estimated depletion: 18 hours' :
      'System metrics within normal parameters. No action required.',
    acknowledgeable: true,
    acknowledged: false,
    resolved: alert.type === 'success'
  };

  const handleAcknowledge = async () => {
    if (!onAcknowledge) return;
    
    setIsSubmitting(true);
    try {
      await onAcknowledge(alert.id, actionNote);
      onHide();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!onResolve) return;
    
    setIsSubmitting(true);
    try {
      await onResolve(alert.id, actionNote);
      onHide();
    } catch (error) {
      console.error('Error resolving alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div className={`avatar-sm rounded-circle bg-${getAlertColor(alert.type)} bg-opacity-10 me-2`}>
            <IconifyIcon 
              icon={getAlertIcon(alert.type)} 
              className={`text-${getAlertColor(alert.type)}`}
            />
          </div>
          System Alert Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Alert Status Header */}
        <Alert variant={getAlertColor(alert.type)} className="mb-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="alert-heading mb-2">{alert.title}</h5>
              <p className="mb-0">{alert.message}</p>
            </div>
            <div className="text-end">
              <Badge bg={getSeverityBadgeVariant(extendedAlert.severity)} className="mb-2">
                {extendedAlert.severity?.toUpperCase()} SEVERITY
              </Badge>
              <br />
              <small className="text-muted">{alert.timestamp}</small>
            </div>
          </div>
        </Alert>

        <Row>
          {/* Alert Information */}
          <Col md={6}>
            <h6 className="mb-3">Alert Information</h6>
            <div className="mb-3">
              <strong>Category:</strong>
              <Badge bg="outline-secondary" className="ms-2">
                {extendedAlert.category?.toUpperCase()}
              </Badge>
            </div>
            <div className="mb-3">
              <strong>Affected Services:</strong>
              <div className="mt-1">
                {extendedAlert.affectedServices?.map((service, index) => (
                  <Badge key={index} bg="outline-info" className="me-1">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <strong>Status:</strong>
              <div className="mt-1">
                {extendedAlert.resolved ? (
                  <Badge bg="success">
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Resolved
                  </Badge>
                ) : extendedAlert.acknowledged ? (
                  <Badge bg="warning">
                    <IconifyIcon icon="ri:eye-line" className="me-1" />
                    Acknowledged
                  </Badge>
                ) : (
                  <Badge bg="danger">
                    <IconifyIcon icon="ri:alert-line" className="me-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </Col>

          {/* Technical Details */}
          <Col md={6}>
            <h6 className="mb-3">Technical Details</h6>
            <div className="p-3 bg-light rounded mb-3">
              <small className="font-monospace">
                {extendedAlert.technicalDetails}
              </small>
            </div>
            
            {extendedAlert.acknowledged && (
              <div className="mb-3">
                <strong>Acknowledged by:</strong>
                <div className="mt-1">
                  <span className="text-muted">{extendedAlert.acknowledgedBy || 'Admin User'}</span>
                  <br />
                  <small className="text-muted">{extendedAlert.acknowledgedAt || 'Just now'}</small>
                </div>
              </div>
            )}

            {extendedAlert.resolved && (
              <div className="mb-3">
                <strong>Resolved by:</strong>
                <div className="mt-1">
                  <span className="text-muted">{extendedAlert.resolvedBy || 'System Admin'}</span>
                  <br />
                  <small className="text-muted">{extendedAlert.resolvedAt || '30 minutes ago'}</small>
                </div>
              </div>
            )}
          </Col>
        </Row>

        {/* Recommended Actions */}
        <div className="mt-4">
          <h6 className="mb-3">Recommended Actions</h6>
          <ul className="list-unstyled">
            {extendedAlert.recommendedActions?.map((action, index) => (
              <li key={index} className="mb-2">
                <IconifyIcon icon="ri:arrow-right-line" className="text-primary me-2" />
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Note */}
        {!extendedAlert.resolved && (
          <div className="mt-4">
            <h6 className="mb-3">Add Note (Optional)</h6>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Add any notes about actions taken or observations..."
              />
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <div>
            <Button variant="outline-secondary" onClick={onHide}>
              Close
            </Button>
          </div>
          <div>
            {!extendedAlert.resolved && !extendedAlert.acknowledged && extendedAlert.acknowledgeable && (
              <Button 
                variant="warning" 
                className="me-2"
                onClick={handleAcknowledge}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    Acknowledging...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="ri:eye-line" className="me-1" />
                    Acknowledge
                  </>
                )}
              </Button>
            )}
            
            {!extendedAlert.resolved && (
              <Button 
                variant="success"
                onClick={handleResolve}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="ri:check-double-line" className="me-1" />
                    Mark Resolved
                  </>
                )}
              </Button>
            )}

            {extendedAlert.resolved && (
              <Button variant="outline-success" disabled>
                <IconifyIcon icon="ri:check-line" className="me-1" />
                Already Resolved
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AlertDetailsModal;
