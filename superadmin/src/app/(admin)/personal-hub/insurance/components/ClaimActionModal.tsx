"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface InsuranceClaim {
  id: string;
  claim_number: string;
  policy: {
    id: string;
    policy_number: string;
    type: 'health' | 'auto' | 'life' | 'property' | 'travel' | 'business' | 'other';
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  provider: {
    id: string;
    name: string;
    logo: string;
  };
  claim_details: {
    date_filed: string;
    incident_date: string;
    description: string;
    amount_requested: string;
    amount_approved?: string;
    documents: string[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid';
  notes: string[];
  last_updated: string;
}

interface ClaimActionModalProps {
  show: boolean;
  onHide: () => void;
  claim: InsuranceClaim | null;
  action: 'start_review' | 'approve' | 'reject' | 'request_info' | 'process_payment';
  onConfirm?: (claimId: string, action: string, reason: string, additionalData?: any) => void;
}

const ClaimActionModal: React.FC<ClaimActionModalProps> = ({ 
  show, 
  onHide, 
  claim,
  action,
  onConfirm
}) => {
  const [reason, setReason] = useState<string>('');
  const [approvedAmount, setApprovedAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [requestedInfo, setRequestedInfo] = useState<string[]>([]);
  const [infoDeadline, setInfoDeadline] = useState<string>('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [escalateToManager, setEscalateToManager] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!claim) return null;

  // Get action details
  const getActionDetails = () => {
    return {
      start_review: {
        title: 'Start Claim Review',
        icon: 'ri:search-eye-line',
        variant: 'info',
        description: 'Begin the review process for this insurance claim',
        confirmText: 'Start Review'
      },
      approve: {
        title: 'Approve Claim',
        icon: 'ri:check-double-line',
        variant: 'success',
        description: 'Approve this claim and authorize payment',
        confirmText: 'Approve Claim'
      },
      reject: {
        title: 'Reject Claim',
        icon: 'ri:close-circle-line',
        variant: 'danger',
        description: 'Reject this claim and notify the customer',
        confirmText: 'Reject Claim'
      },
      request_info: {
        title: 'Request Additional Information',
        icon: 'ri:question-line',
        variant: 'warning',
        description: 'Request additional documents or information from the customer',
        confirmText: 'Request Information'
      },
      process_payment: {
        title: 'Process Payment',
        icon: 'ri:bank-card-line',
        variant: 'primary',
        description: 'Process payment for this approved claim',
        confirmText: 'Process Payment'
      }
    }[action];
  };

  const actionDetails = getActionDetails();

  // Get type badge variant
  const getTypeBadgeVariant = (type: InsuranceClaim['policy']['type']) => {
    switch (type) {
      case 'health':
        return 'info';
      case 'auto':
        return 'primary';
      case 'life':
        return 'success';
      case 'property':
        return 'warning';
      case 'travel':
        return 'purple';
      case 'business':
        return 'danger';
      case 'other':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Information request options
  const infoRequestOptions = [
    { value: 'medical_records', label: 'Medical Records' },
    { value: 'police_report', label: 'Police Report' },
    { value: 'repair_estimates', label: 'Repair Estimates' },
    { value: 'photos_evidence', label: 'Photos/Evidence' },
    { value: 'witness_statements', label: 'Witness Statements' },
    { value: 'receipts_invoices', label: 'Receipts/Invoices' },
    { value: 'identity_verification', label: 'Identity Verification' },
    { value: 'property_valuation', label: 'Property Valuation' },
    { value: 'other_documents', label: 'Other Documents' }
  ];

  // Handle checkbox change for requested info
  const handleInfoRequestChange = (value: string, checked: boolean) => {
    if (checked) {
      setRequestedInfo([...requestedInfo, value]);
    } else {
      setRequestedInfo(requestedInfo.filter(item => item !== value));
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

    // Additional validation for specific actions
    if (action === 'approve' && (!approvedAmount || parseFloat(approvedAmount) <= 0)) {
      setValidated(true);
      return;
    }

    if (action === 'request_info' && (requestedInfo.length === 0 || !infoDeadline)) {
      setValidated(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onConfirm) {
        const additionalData: any = {
          notifyCustomer,
          escalateToManager
        };

        if (action === 'approve') {
          additionalData.approvedAmount = parseFloat(approvedAmount);
        }

        if (action === 'process_payment') {
          additionalData.paymentMethod = paymentMethod;
          additionalData.paymentAmount = claim.claim_details.amount_approved || approvedAmount;
        }

        if (action === 'request_info') {
          additionalData.requestedInfo = requestedInfo;
          additionalData.infoDeadline = infoDeadline;
        }
        
        await onConfirm(claim.id, action, reason, additionalData);
      }
      
      // Reset form
      setReason('');
      setApprovedAmount('');
      setPaymentMethod('bank_transfer');
      setRequestedInfo([]);
      setInfoDeadline('');
      setNotifyCustomer(true);
      setEscalateToManager(false);
      setValidated(false);
      onHide();
    } catch (error) {
      console.error('Error processing claim action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setReason('');
    setApprovedAmount('');
    setPaymentMethod('bank_transfer');
    setRequestedInfo([]);
    setInfoDeadline('');
    setNotifyCustomer(true);
    setEscalateToManager(false);
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
        {/* Claim Summary */}
        <div className="mb-4 p-3 bg-light rounded">
          <Row>
            <Col md={8}>
              <h6 className="mb-2">Claim Details</h6>
              <Table className="table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold">Claim Number:</td>
                    <td>{claim.claim_number}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Policy:</td>
                    <td>
                      <Badge bg={getTypeBadgeVariant(claim.policy.type)} className="me-1">
                        {claim.policy.type}
                      </Badge>
                      {claim.policy.policy_number}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Amount Requested:</td>
                    <td>{claim.claim_details.amount_requested}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Incident Date:</td>
                    <td>{claim.claim_details.incident_date}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Filed Date:</td>
                    <td>{claim.claim_details.date_filed}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={4}>
              <h6 className="mb-2">Customer</h6>
              <div className="mb-2">
                <div className="fw-semibold">{claim.user.name}</div>
                <small className="text-muted">{claim.user.email}</small>
                <div className="small text-muted">{claim.user.phone}</div>
              </div>
              <div className="d-flex align-items-center">
                <img 
                  src={claim.provider.logo} 
                  alt={claim.provider.name} 
                  height="20" 
                  className="me-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                  }}
                />
                <span className="small">{claim.provider.name}</span>
              </div>
            </Col>
          </Row>
        </div>

        {/* Claim Description */}
        <div className="mb-4">
          <h6>Claim Description</h6>
          <div className="p-3 border rounded bg-white">
            <p className="mb-0">{claim.claim_details.description}</p>
          </div>
        </div>

        {/* Action Warning */}
        <Alert variant={actionDetails.variant} className="mb-4">
          <div className="d-flex">
            <IconifyIcon icon={actionDetails.icon} className="me-2 mt-1" />
            <div>
              <strong>{actionDetails.title}:</strong>
              <br />
              {actionDetails.description}
              {action === 'approve' && (
                <div className="mt-2">
                  <small>
                    • Claim will be marked as approved<br />
                    • Payment will be authorized for processing<br />
                    • Customer will be notified of approval<br />
                    • Provider will be notified for settlement
                  </small>
                </div>
              )}
              {action === 'reject' && (
                <div className="mt-2">
                  <small>
                    • Claim will be permanently rejected<br />
                    • Customer will be notified with reason<br />
                    • No payment will be processed<br />
                    • Decision can be appealed through formal process
                  </small>
                </div>
              )}
              {action === 'request_info' && (
                <div className="mt-2">
                  <small>
                    • Claim will be put on hold pending information<br />
                    • Customer will receive detailed request<br />
                    • Deadline will be set for information submission<br />
                    • Claim will resume review upon receipt
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
              {action === 'request_info' ? 'Reason for Information Request' : `Reason for ${actionDetails.title}`} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                action === 'approve' 
                  ? 'e.g., All documentation verified, claim is valid and within policy coverage'
                  : action === 'reject'
                  ? 'e.g., Claim falls outside policy coverage, insufficient evidence provided'
                  : action === 'request_info'
                  ? 'e.g., Additional documentation required to complete claim assessment'
                  : action === 'process_payment'
                  ? 'e.g., Claim approved, processing payment as authorized'
                  : 'e.g., Beginning comprehensive review of claim documentation and evidence'
              }
              required
              minLength={10}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a detailed reason (minimum 10 characters).
            </Form.Control.Feedback>
          </Form.Group>

          {/* Approved Amount (for approve action) */}
          {action === 'approve' && (
            <Form.Group className="mb-3">
              <Form.Label>Approved Amount <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max={parseFloat(claim.claim_details.amount_requested.replace('$', '').replace(',', ''))}
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder="Enter approved amount"
                required
              />
              <Form.Text className="text-muted">
                Requested amount: {claim.claim_details.amount_requested}
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                Please enter a valid approved amount.
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {/* Payment Method (for process_payment action) */}
          {action === 'process_payment' && (
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="digital_wallet">Digital Wallet</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Payment amount: {claim.claim_details.amount_approved || 'To be determined'}
              </Form.Text>
            </Form.Group>
          )}

          {/* Information Request (for request_info action) */}
          {action === 'request_info' && (
            <div className="mb-3">
              <h6 className="mb-3">Information Request Details</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Required Information <span className="text-danger">*</span></Form.Label>
                <div className="border rounded p-3">
                  <Row>
                    {infoRequestOptions.map((option) => (
                      <Col md={6} key={option.value} className="mb-2">
                        <Form.Check
                          type="checkbox"
                          id={`info-${option.value}`}
                          label={option.label}
                          checked={requestedInfo.includes(option.value)}
                          onChange={(e) => handleInfoRequestChange(option.value, e.target.checked)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
                {validated && requestedInfo.length === 0 && (
                  <div className="text-danger small mt-1">
                    Please select at least one type of information to request.
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Deadline for Information <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  value={infoDeadline}
                  onChange={(e) => setInfoDeadline(e.target.value)}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  required
                />
                <Form.Text className="text-muted">
                  Customer must provide the requested information by this date
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  Please select a deadline for the information request.
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          )}

          {/* Additional Options */}
          <div className="mb-3">
            <h6 className="mb-3">Additional Options</h6>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="notify-customer"
                label="Send notification to customer"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
              />
              <Form.Text className="text-muted">
                Customer will receive email and SMS notification about this action
              </Form.Text>
            </Form.Group>

            {(action === 'reject' || action === 'approve') && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="escalate-manager"
                  label="Escalate to manager for review"
                  checked={escalateToManager}
                  onChange={(e) => setEscalateToManager(e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Manager will be notified to review this decision
                </Form.Text>
              </Form.Group>
            )}
          </div>

          {/* Quick Reason Templates */}
          <Form.Group className="mb-3">
            <Form.Label>Quick Reasons</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {action === 'approve' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('All required documentation has been verified and the claim is valid. The incident is covered under the policy terms and conditions.')}
                  >
                    Documentation Verified
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Claim assessment completed successfully. All evidence supports the claim and falls within policy coverage limits.')}
                  >
                    Assessment Complete
                  </Button>
                </>
              )}
              {action === 'reject' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Claim rejected as the incident falls outside the scope of policy coverage. The specific circumstances are excluded under policy terms.')}
                  >
                    Outside Coverage
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Insufficient evidence provided to support the claim. Documentation does not substantiate the reported incident or damages.')}
                  >
                    Insufficient Evidence
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Claim rejected due to material misrepresentation or fraud detected during the investigation process.')}
                  >
                    Fraudulent Claim
                  </Button>
                </>
              )}
              {action === 'request_info' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Additional documentation is required to complete the claim assessment. Please provide the requested information to proceed with the review.')}
                  >
                    Additional Docs Needed
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Clarification needed on the incident details and circumstances. Additional information will help complete the claim evaluation.')}
                  >
                    Need Clarification
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
          disabled={
            isSubmitting || 
            !reason || 
            reason.length < 10 || 
            (action === 'approve' && (!approvedAmount || parseFloat(approvedAmount) <= 0)) ||
            (action === 'request_info' && (requestedInfo.length === 0 || !infoDeadline))
          }
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

export default ClaimActionModal;
