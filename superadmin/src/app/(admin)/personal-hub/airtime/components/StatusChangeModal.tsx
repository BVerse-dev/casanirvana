"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface Provider {
  id: string;
  name: string;
  logo: string;
  country: string;
  status: 'active' | 'inactive' | 'maintenance';
  balance: string;
  transactions: number;
  fee: string;
}

interface StatusChangeModalProps {
  show: boolean;
  onHide: () => void;
  provider: Provider | null;
  newStatus: 'active' | 'inactive' | 'maintenance';
  onConfirm?: (providerId: string, newStatus: string, reason: string) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ 
  show, 
  onHide, 
  provider,
  newStatus,
  onConfirm
}) => {
  const [reason, setReason] = useState<string>('');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!provider) return null;

  // Get status details
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: 'ri:check-line',
          color: 'success',
          title: 'Activate Provider',
          description: 'Provider will be available for transactions',
          warning: null
        };
      case 'inactive':
        return {
          icon: 'ri:close-circle-line',
          color: 'danger',
          title: 'Deactivate Provider',
          description: 'Provider will be unavailable for new transactions',
          warning: 'Existing pending transactions will continue to be processed'
        };
      case 'maintenance':
        return {
          icon: 'ri:tools-line',
          color: 'warning',
          title: 'Set Maintenance Mode',
          description: 'Provider will be temporarily unavailable',
          warning: 'New transactions will be queued until maintenance is complete'
        };
      default:
        return {
          icon: 'ri:question-line',
          color: 'secondary',
          title: 'Change Status',
          description: 'Update provider status',
          warning: null
        };
    }
  };

  const statusDetails = getStatusDetails(newStatus);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onConfirm) {
        await onConfirm(provider.id, newStatus, reason);
      }
      
      // Reset form
      setReason('');
      setValidated(false);
      onHide();
    } catch (error) {
      console.error('Error changing provider status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setReason('');
    setValidated(false);
    onHide();
  };

  // Get impact message
  const getImpactMessage = () => {
    switch (newStatus) {
      case 'active':
        return `${provider.name} will be available for airtime transactions immediately.`;
      case 'inactive':
        return `${provider.name} will stop accepting new transactions. Current balance: ${provider.balance}`;
      case 'maintenance':
        return `${provider.name} will be temporarily unavailable. Estimated downtime should be specified in the reason.`;
      default:
        return '';
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div className={`avatar-sm rounded-circle bg-${statusDetails.color} bg-opacity-10 me-2`}>
            <IconifyIcon icon={statusDetails.icon} className={`text-${statusDetails.color}`} />
          </div>
          {statusDetails.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Provider Info */}
        <div className="d-flex align-items-center p-3 bg-light rounded mb-4">
          <img 
            src={provider.logo} 
            alt={provider.name} 
            height="40" 
            className="me-3 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
            }}
          />
          <div>
            <h6 className="mb-1">{provider.name}</h6>
            <p className="text-muted mb-0">
              Current Status: <strong className="text-capitalize">{provider.status}</strong>
            </p>
          </div>
        </div>

        {/* Status Change Warning */}
        {statusDetails.warning && (
          <Alert variant={statusDetails.color} className="mb-3">
            <div className="d-flex">
              <IconifyIcon icon="ri:alert-line" className="me-2 mt-1" />
              <div>
                <strong>Important:</strong>
                <br />
                {statusDetails.warning}
              </div>
            </div>
          </Alert>
        )}

        {/* Impact Information */}
        <div className="mb-3">
          <h6 className="mb-2">Impact of Status Change</h6>
          <p className="text-muted mb-0">{getImpactMessage()}</p>
        </div>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Reason */}
          <Form.Group className="mb-3">
            <Form.Label>
              Reason for Status Change <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                newStatus === 'maintenance' 
                  ? 'e.g., Scheduled maintenance for API upgrade. Expected downtime: 2 hours'
                  : newStatus === 'inactive'
                  ? 'e.g., Provider requested deactivation due to service issues'
                  : 'e.g., Provider maintenance completed, all systems operational'
              }
              required
              minLength={10}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a detailed reason (minimum 10 characters).
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              This reason will be logged and may be visible to other administrators.
            </Form.Text>
          </Form.Group>

          {/* Quick Reason Templates */}
          <Form.Group className="mb-3">
            <Form.Label>Quick Reasons</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {newStatus === 'maintenance' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Scheduled API maintenance - Expected downtime: 2 hours')}
                  >
                    API Maintenance
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Provider system upgrade in progress - Estimated completion: 4 hours')}
                  >
                    System Upgrade
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Network connectivity issues reported by provider')}
                  >
                    Network Issues
                  </Button>
                </>
              )}
              
              {newStatus === 'inactive' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Provider requested deactivation due to service discontinuation')}
                  >
                    Service Discontinued
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Compliance issues identified - pending resolution')}
                  >
                    Compliance Issues
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Low success rate and performance issues')}
                  >
                    Performance Issues
                  </Button>
                </>
              )}
              
              {newStatus === 'active' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Maintenance completed successfully - All systems operational')}
                  >
                    Maintenance Complete
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Issues resolved - Provider ready for transactions')}
                  >
                    Issues Resolved
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('New provider integration completed and tested')}
                  >
                    Integration Complete
                  </Button>
                </>
              )}
            </div>
          </Form.Group>

          {/* Confirmation */}
          <Alert variant="info" className="mb-0">
            <div className="d-flex">
              <IconifyIcon icon="ri:information-line" className="me-2 mt-1" />
              <div>
                <strong>Confirmation:</strong>
                <br />
                You are about to change {provider.name}'s status from <strong>{provider.status}</strong> to <strong>{newStatus}</strong>.
                <br />
                {statusDetails.description}
              </div>
            </div>
          </Alert>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant={statusDetails.color}
          onClick={(e) => handleSubmit(e as any)}
          disabled={isSubmitting || !reason || reason.length < 10}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Updating...
            </>
          ) : (
            <>
              <IconifyIcon icon={statusDetails.icon} className="me-1" />
              Confirm Status Change
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StatusChangeModal;
