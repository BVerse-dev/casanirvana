"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface BillTransaction {
  id: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  biller: {
    name: string;
    logo: string;
    category: string;
  };
  account_number: string;
  amount: string;
  fee: string;
  total: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  reference: string;
  payment_method: string;
  date: string;
  time: string;
  receipt_number?: string;
}

interface BillTransactionApprovalModalProps {
  show: boolean;
  onHide: () => void;
  transaction: BillTransaction | null;
  action: 'approve' | 'reject';
  onConfirm?: (transactionId: string, action: string, reason: string, additionalData?: any) => void;
}

const BillTransactionApprovalModal: React.FC<BillTransactionApprovalModalProps> = ({ 
  show, 
  onHide, 
  transaction,
  action,
  onConfirm
}) => {
  const [reason, setReason] = useState<string>('');
  const [verifyAccount, setVerifyAccount] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);
  const [generateReceipt, setGenerateReceipt] = useState(action === 'approve');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!transaction) return null;

  // Get action details
  const getActionDetails = () => {
    return {
      approve: {
        title: 'Approve Bill Payment',
        icon: 'ri:check-double-line',
        variant: 'success',
        description: 'Approve this bill payment for processing',
        confirmText: 'Approve Payment'
      },
      reject: {
        title: 'Reject Bill Payment',
        icon: 'ri:close-circle-line',
        variant: 'danger',
        description: 'Reject this bill payment and refund the customer',
        confirmText: 'Reject Payment'
      }
    }[action];
  };

  const actionDetails = getActionDetails();

  // Get category badge variant
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'utilities':
        return 'primary';
      case 'telecom':
        return 'info';
      case 'internet':
        return 'purple';
      case 'tv':
        return 'pink';
      case 'education':
        return 'success';
      case 'government':
        return 'dark';
      case 'insurance':
        return 'warning';
      case 'other':
        return 'secondary';
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
        const additionalData: any = {
          verifyAccount,
          sendNotification,
          generateReceipt
        };
        
        await onConfirm(transaction.id, action, reason, additionalData);
      }
      
      // Reset form
      setReason('');
      setVerifyAccount(true);
      setSendNotification(true);
      setGenerateReceipt(action === 'approve');
      setValidated(false);
      onHide();
    } catch (error) {
      console.error('Error processing bill payment approval:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setReason('');
    setVerifyAccount(true);
    setSendNotification(true);
    setGenerateReceipt(action === 'approve');
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
              <h6 className="mb-2">Bill Payment Details</h6>
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
                    <td className="fw-semibold">Account Number:</td>
                    <td>{transaction.account_number}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={4}>
              <h6 className="mb-2">Biller Information</h6>
              <div className="d-flex align-items-center mb-2">
                <img 
                  src={transaction.biller.logo} 
                  alt={transaction.biller.name} 
                  height="24" 
                  className="me-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                  }}
                />
                <div>
                  <div className="fw-semibold">{transaction.biller.name}</div>
                  <Badge bg={getCategoryBadgeVariant(transaction.biller.category)} size="sm">
                    {transaction.biller.category}
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Customer & Payment Info */}
        <Row className="mb-4">
          <Col md={6}>
            <h6 className="mb-2">Customer Information</h6>
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
            <h6 className="mb-2">Payment Information</h6>
            <div className="p-3 border rounded">
              <Table className="table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold">Payment Method:</td>
                    <td>{transaction.payment_method}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Date & Time:</td>
                    <td>{transaction.date} {transaction.time}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Fee:</td>
                    <td>{transaction.fee}</td>
                  </tr>
                </tbody>
              </Table>
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
                    • The bill payment will be marked as rejected<br />
                    • A notification will be sent to the customer<br />
                    • The biller will not receive the payment
                  </small>
                </div>
              )}
              {action === 'approve' && (
                <div className="mt-2">
                  <small>
                    • The payment will be processed immediately<br />
                    • The biller will be notified of the payment<br />
                    • A receipt will be generated for the customer<br />
                    • The transaction cannot be reversed after approval
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
                  ? 'e.g., Account verified, payment details correct, customer authenticated'
                  : 'e.g., Invalid account number, insufficient funds, duplicate payment detected'
              }
              required
              minLength={10}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a detailed reason (minimum 10 characters).
            </Form.Control.Feedback>
          </Form.Group>

          {/* Additional Options */}
          <div className="mb-3">
            <h6 className="mb-3">Processing Options</h6>
            
            {action === 'approve' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="verify-account"
                    label="Verify account details before processing"
                    checked={verifyAccount}
                    onChange={(e) => setVerifyAccount(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    Perform additional account verification with the biller
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="generate-receipt"
                    label="Generate receipt automatically"
                    checked={generateReceipt}
                    onChange={(e) => setGenerateReceipt(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    Automatically generate and send receipt to customer
                  </Form.Text>
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="send-notification"
                label="Send notification to customer"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
              />
              <Form.Text className="text-muted">
                Notify customer of the {action === 'approve' ? 'approval' : 'rejection'} via SMS/Email
              </Form.Text>
            </Form.Group>
          </div>

          {/* Quick Reason Templates */}
          <Form.Group className="mb-3">
            <Form.Label>Quick Reasons</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {action === 'approve' ? (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Account details verified successfully. Customer identity confirmed and payment amount is correct.')}
                  >
                    Account Verified
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Standard approval process completed. All validation checks passed successfully.')}
                  >
                    Standard Approval
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Manual review completed. Payment details match biller requirements and customer profile.')}
                  >
                    Manual Review Complete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Invalid account number format. The provided account number does not match the biller\'s validation requirements.')}
                  >
                    Invalid Account
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Duplicate payment detected. A similar payment for this account was processed recently.')}
                  >
                    Duplicate Payment
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Payment amount exceeds allowed limits. The transaction amount is outside the acceptable range for this biller.')}
                  >
                    Amount Limit Exceeded
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Account verification failed. Unable to verify the account details with the biller system.')}
                  >
                    Verification Failed
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Biller system temporarily unavailable. Unable to process payment due to technical issues with the biller.')}
                  >
                    Biller Unavailable
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

export default BillTransactionApprovalModal;
