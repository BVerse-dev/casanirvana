"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface TransferTransaction {
  id: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  service: {
    name: string;
    logo: string;
    type: 'domestic' | 'international';
  };
  recipient: {
    name: string;
    phone?: string;
    accountNumber?: string;
    bankName?: string;
    country: string;
  };
  amount: string;
  fee: string;
  total: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'flagged';
  reference: string;
  payment_method: string;
  date: string;
  time: string;
  compliance: {
    kyc_verified: boolean;
    risk_level: 'low' | 'medium' | 'high';
    flagged_reason?: string;
  };
}

interface FlagTransactionModalProps {
  show: boolean;
  onHide: () => void;
  transaction: TransferTransaction | null;
  onFlag?: (transactionId: string, flagType: string, reason: string, priority: string, additionalData?: any) => void;
}

const FlagTransactionModal: React.FC<FlagTransactionModalProps> = ({ 
  show, 
  onHide, 
  transaction,
  onFlag
}) => {
  const [flagType, setFlagType] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [reason, setReason] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [notifyCompliance, setNotifyCompliance] = useState(true);
  const [freezeAccount, setFreezeAccount] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!transaction) return null;

  // Flag types
  const flagTypes = [
    {
      value: 'fraud_suspected',
      label: 'Suspected Fraud',
      description: 'Potential fraudulent activity detected',
      icon: 'ri:shield-cross-line',
      color: 'danger'
    },
    {
      value: 'aml_concern',
      label: 'AML Concern',
      description: 'Anti-money laundering compliance issue',
      icon: 'ri:search-eye-line',
      color: 'warning'
    },
    {
      value: 'kyc_incomplete',
      label: 'KYC Incomplete',
      description: 'Customer identity verification incomplete',
      icon: 'ri:user-search-line',
      color: 'info'
    },
    {
      value: 'unusual_pattern',
      label: 'Unusual Pattern',
      description: 'Transaction pattern differs from customer history',
      icon: 'ri:line-chart-line',
      color: 'warning'
    },
    {
      value: 'high_risk_destination',
      label: 'High-Risk Destination',
      description: 'Transfer to high-risk country or region',
      icon: 'ri:map-pin-line',
      color: 'danger'
    },
    {
      value: 'velocity_check',
      label: 'Velocity Check',
      description: 'Too many transactions in short time period',
      icon: 'ri:speed-up-line',
      color: 'warning'
    },
    {
      value: 'sanctions_screening',
      label: 'Sanctions Screening',
      description: 'Potential match with sanctions list',
      icon: 'ri:file-shield-line',
      color: 'danger'
    },
    {
      value: 'manual_review',
      label: 'Manual Review Required',
      description: 'Requires additional human review',
      icon: 'ri:user-settings-line',
      color: 'info'
    }
  ];

  // Get flag type details
  const getFlagTypeDetails = (flagValue: string) => {
    return flagTypes.find(type => type.value === flagValue);
  };

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
      if (onFlag) {
        const additionalData = {
          notifyCompliance,
          freezeAccount,
          additionalNotes: additionalNotes.trim() || undefined
        };
        
        await onFlag(transaction.id, flagType, reason, priority, additionalData);
      }
      
      // Reset form
      setFlagType('');
      setPriority('medium');
      setReason('');
      setAdditionalNotes('');
      setNotifyCompliance(true);
      setFreezeAccount(false);
      setValidated(false);
      onHide();
    } catch (error) {
      console.error('Error flagging transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFlagType('');
    setPriority('medium');
    setReason('');
    setAdditionalNotes('');
    setNotifyCompliance(true);
    setFreezeAccount(false);
    setValidated(false);
    onHide();
  };

  const selectedFlagType = getFlagTypeDetails(flagType);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div className="avatar-sm rounded-circle bg-warning bg-opacity-10 me-2">
            <IconifyIcon icon="ri:flag-line" className="text-warning" />
          </div>
          Flag Transaction for Review
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Transaction Summary */}
        <div className="mb-4 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="mb-1">Transaction {transaction.id}</h6>
              <p className="text-muted mb-1">
                {transaction.user.name} → {transaction.recipient.name}
              </p>
              <p className="mb-0">
                <strong>{transaction.amount}</strong> via {transaction.service.name}
              </p>
            </div>
            <div className="text-end">
              <Badge bg="warning">Current: {transaction.status}</Badge>
              <div className="mt-1">
                <small className="text-muted">{transaction.date} {transaction.time}</small>
              </div>
            </div>
          </div>
        </div>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Flag Type Selection */}
          <Form.Group className="mb-3">
            <Form.Label>Flag Type <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={flagType}
              onChange={(e) => setFlagType(e.target.value)}
              required
            >
              <option value="">Select flag type...</option>
              {flagTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select a flag type.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Flag Type Description */}
          {selectedFlagType && (
            <Alert variant={selectedFlagType.color} className="mb-3">
              <div className="d-flex">
                <IconifyIcon icon={selectedFlagType.icon} className="me-2 mt-1" />
                <div>
                  <strong>{selectedFlagType.label}</strong>
                  <br />
                  {selectedFlagType.description}
                </div>
              </div>
            </Alert>
          )}

          {/* Priority Level */}
          <Form.Group className="mb-3">
            <Form.Label>Priority Level <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              <option value="low">Low - Routine review within 24-48 hours</option>
              <option value="medium">Medium - Review within 4-8 hours</option>
              <option value="high">High - Immediate review required</option>
              <option value="critical">Critical - Emergency escalation</option>
            </Form.Select>
          </Form.Group>

          {/* Reason */}
          <Form.Group className="mb-3">
            <Form.Label>
              Detailed Reason <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide detailed explanation of why this transaction is being flagged..."
              required
              minLength={20}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a detailed reason (minimum 20 characters).
            </Form.Control.Feedback>
          </Form.Group>

          {/* Quick Reason Templates */}
          <Form.Group className="mb-3">
            <Form.Label>Quick Reason Templates</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setReason('Transaction amount significantly higher than customer\'s typical transaction pattern. Requires verification of source of funds.')}
              >
                Unusual Amount
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setReason('First-time transfer to this recipient in a high-risk jurisdiction. Enhanced due diligence required.')}
              >
                High-Risk Destination
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setReason('Customer has incomplete KYC documentation. Additional identity verification required before processing.')}
              >
                KYC Incomplete
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setReason('Multiple transactions within short timeframe exceed velocity thresholds. Potential structuring activity.')}
              >
                Velocity Concern
              </Button>
            </div>
          </Form.Group>

          {/* Additional Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Additional Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional observations or context..."
            />
          </Form.Group>

          {/* Action Options */}
          <div className="mb-3">
            <h6 className="mb-3">Additional Actions</h6>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="notify-compliance"
                label="Notify compliance team immediately"
                checked={notifyCompliance}
                onChange={(e) => setNotifyCompliance(e.target.checked)}
              />
              <Form.Text className="text-muted">
                Send immediate notification to compliance officers
              </Form.Text>
            </Form.Group>

            {(flagType === 'fraud_suspected' || flagType === 'sanctions_screening') && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="freeze-account"
                  label="Temporarily freeze customer account"
                  checked={freezeAccount}
                  onChange={(e) => setFreezeAccount(e.target.checked)}
                />
                <Form.Text className="text-muted">
                  <strong>Warning:</strong> This will prevent the customer from making any new transactions
                </Form.Text>
              </Form.Group>
            )}
          </div>

          {/* Impact Warning */}
          <Alert variant="info" className="mb-0">
            <div className="d-flex">
              <IconifyIcon icon="ri:information-line" className="me-2 mt-1" />
              <div>
                <strong>Impact of Flagging:</strong>
                <ul className="mb-0 mt-2">
                  <li>Transaction will be placed on hold</li>
                  <li>Customer will be notified of review process</li>
                  <li>Compliance team will be assigned for investigation</li>
                  {freezeAccount && <li><strong>Customer account will be temporarily frozen</strong></li>}
                  <li>Resolution timeline depends on priority level selected</li>
                </ul>
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
          variant="warning"
          onClick={(e) => handleSubmit(e as any)}
          disabled={isSubmitting || !flagType || !reason || reason.length < 20}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Flagging...
            </>
          ) : (
            <>
              <IconifyIcon icon="ri:flag-line" className="me-1" />
              Flag Transaction
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FlagTransactionModal;
