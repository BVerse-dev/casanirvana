"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
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

interface TransactionApprovalModalProps {
  show: boolean;
  onHide: () => void;
  transaction: TransferTransaction | null;
  action: 'approve' | 'reject';
  onConfirm?: (transactionId: string, action: string, reason: string, additionalData?: any) => void;
}

const TransactionApprovalModal: React.FC<TransactionApprovalModalProps> = ({ 
  show, 
  onHide, 
  transaction,
  action,
  onConfirm
}) => {
  const [reason, setReason] = useState<string>('');
  const [requireAdditionalKyc, setRequireAdditionalKyc] = useState(false);
  const [setTransactionLimit, setSetTransactionLimit] = useState(false);
  const [newLimit, setNewLimit] = useState<string>('');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!transaction) return null;

  // Get action details
  const getActionDetails = () => {
    return {
      approve: {
        title: 'Approve Transaction',
        icon: 'ri:check-double-line',
        variant: 'success',
        description: 'Approve this transaction for processing',
        confirmText: 'Approve Transaction'
      },
      reject: {
        title: 'Reject Transaction',
        icon: 'ri:close-circle-line',
        variant: 'danger',
        description: 'Reject this transaction and refund the customer',
        confirmText: 'Reject Transaction'
      }
    }[action];
  };

  const actionDetails = getActionDetails();

  // Get risk level badge variant
  const getRiskBadgeVariant = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'secondary';
    }
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
      if (onConfirm) {
        const additionalData: any = {};
        
        if (action === 'approve' && requireAdditionalKyc) {
          additionalData.requireAdditionalKyc = true;
        }
        
        if (action === 'approve' && setTransactionLimit && newLimit) {
          additionalData.newTransactionLimit = parseFloat(newLimit);
        }
        
        await onConfirm(transaction.id, action, reason, additionalData);
      }
      
      // Reset form
      setReason('');
      setRequireAdditionalKyc(false);
      setSetTransactionLimit(false);
      setNewLimit('');
      setValidated(false);
      onHide();
    } catch (error) {
      console.error('Error processing transaction approval:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setReason('');
    setRequireAdditionalKyc(false);
    setSetTransactionLimit(false);
    setNewLimit('');
    setValidated(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div className={`avatar-sm rounded-circle bg-${actionDetails.variant} bg-opacity-10 me-2`}>
            <IconifyIcon icon={actionDetails.icon} className={`text-${actionDetails.variant}`} />
          </div>
          {actionDetails.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Transaction Summary */}
        <div className="mb-4 p-3 bg-light rounded">
          <Row>
            <Col md={8}>
              <h6 className="mb-2">Transaction Details</h6>
              <Table className="table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold">ID:</td>
                    <td>{transaction.id}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Reference:</td>
                    <td>{transaction.reference}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Amount:</td>
                    <td>{transaction.amount}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Total (with fee):</td>
                    <td className="fw-bold">{transaction.total}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Service:</td>
                    <td>{transaction.service.name}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={4}>
              <h6 className="mb-2">Risk Assessment</h6>
              <div className="mb-2">
                <Badge bg={getRiskBadgeVariant(transaction.compliance.risk_level)}>
                  {transaction.compliance.risk_level.toUpperCase()} RISK
                </Badge>
              </div>
              <div className="mb-2">
                <strong>KYC Status:</strong>{' '}
                {transaction.compliance.kyc_verified ? (
                  <Badge bg="success">Verified</Badge>
                ) : (
                  <Badge bg="warning">Not Verified</Badge>
                )}
              </div>
              {transaction.compliance.flagged_reason && (
                <div className="mb-2">
                  <small className="text-danger">
                    <strong>Flag:</strong> {transaction.compliance.flagged_reason}
                  </small>
                </div>
              )}
            </Col>
          </Row>
        </div>

        {/* Sender & Recipient Info */}
        <Row className="mb-4">
          <Col md={6}>
            <h6 className="mb-2">Sender Information</h6>
            <div className="d-flex align-items-center p-3 border rounded">
              <div className="avatar-sm rounded-circle bg-light me-3">
                {transaction.user.avatar ? (
                  <img 
                    src={transaction.user.avatar} 
                    alt={transaction.user.name} 
                    className="img-fluid rounded-circle" 
                    height="40"
                  />
                ) : (
                  <span className="avatar-title rounded-circle">
                    {transaction.user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h6 className="mb-1">{transaction.user.name}</h6>
                <p className="text-muted mb-0">
                  {transaction.user.phone}<br />
                  <small>ID: {transaction.user.id}</small>
                </p>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <h6 className="mb-2">Recipient Information</h6>
            <div className="p-3 border rounded">
              <h6 className="mb-1">{transaction.recipient.name}</h6>
              <p className="text-muted mb-0">
                {transaction.recipient.phone || transaction.recipient.accountNumber}<br />
                {transaction.recipient.bankName && (
                  <>
                    <small>{transaction.recipient.bankName}<br /></small>
                  </>
                )}
                <Badge bg="light" text="dark">{transaction.recipient.country}</Badge>
              </p>
            </div>
          </Col>
        </Row>

        {/* Action Warning */}
        <Alert variant={actionDetails.variant} className="mb-4">
          <div className="d-flex">
            <IconifyIcon icon={actionDetails.icon} className="me-2 mt-1" />
            <div>
              <strong>{actionDetails.title}:</strong>
              <br />
              {actionDetails.description}
              {action === 'reject' && (
                <div className="mt-2">
                  <small>
                    • The customer will be refunded automatically<br />
                    • The transaction will be marked as rejected<br />
                    • A notification will be sent to the customer
                  </small>
                </div>
              )}
              {action === 'approve' && transaction.compliance.risk_level === 'high' && (
                <div className="mt-2">
                  <small>
                    <strong>Note:</strong> This is a high-risk transaction. Consider additional verification steps.
                  </small>
                </div>
              )}
            </div>
          </div>
        </Alert>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Reason */}
          <Form.Group className="mb-3">
            <Form.Label>
              Reason for {action === 'approve' ? 'Approval' : 'Rejection'} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                action === 'approve' 
                  ? 'e.g., All compliance checks passed, customer verified'
                  : 'e.g., Insufficient KYC documentation, suspicious activity detected'
              }
              required
              minLength={10}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a detailed reason (minimum 10 characters).
            </Form.Control.Feedback>
          </Form.Group>

          {/* Additional Options for Approval */}
          {action === 'approve' && (
            <div className="mb-3">
              <h6 className="mb-3">Additional Approval Options</h6>
              
              {!transaction.compliance.kyc_verified && (
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="require-additional-kyc"
                    label="Require additional KYC verification before processing"
                    checked={requireAdditionalKyc}
                    onChange={(e) => setRequireAdditionalKyc(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    Customer will need to provide additional identity verification
                  </Form.Text>
                </Form.Group>
              )}

              {transaction.compliance.risk_level === 'high' && (
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="set-transaction-limit"
                    label="Set new transaction limit for this customer"
                    checked={setTransactionLimit}
                    onChange={(e) => setSetTransactionLimit(e.target.checked)}
                  />
                  {setTransactionLimit && (
                    <div className="mt-2">
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        placeholder="Enter new daily limit (USD)"
                      />
                      <Form.Text className="text-muted">
                        This will override the customer&apos;s current transaction limits
                      </Form.Text>
                    </div>
                  )}
                </Form.Group>
              )}
            </div>
          )}

          {/* Quick Reason Templates */}
          <Form.Group className="mb-3">
            <Form.Label>Quick Reasons</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {action === 'approve' ? (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('All compliance checks passed successfully. Customer identity verified and transaction appears legitimate.')}
                  >
                    All Checks Passed
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Manual review completed. Transaction approved after additional verification of customer and recipient details.')}
                  >
                    Manual Review Complete
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Low risk transaction with verified customer. Standard approval process completed.')}
                  >
                    Standard Approval
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Insufficient KYC documentation provided. Customer needs to complete identity verification before proceeding.')}
                  >
                    Insufficient KYC
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Suspicious transaction pattern detected. Flagged for potential fraud investigation.')}
                  >
                    Suspicious Activity
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Transaction exceeds customer limits or violates compliance policies.')}
                  >
                    Policy Violation
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Recipient information could not be verified. Transaction rejected for security reasons.')}
                  >
                    Recipient Verification Failed
                  </Button>
                </>
              )}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant={actionDetails.variant}
          onClick={(e) => handleSubmit(e as any)}
          disabled={isSubmitting || !reason || reason.length < 10}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Processing...
            </>
          ) : (
            <>
              <IconifyIcon icon={actionDetails.icon} className="me-1" />
              {actionDetails.confirmText}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionApprovalModal;
