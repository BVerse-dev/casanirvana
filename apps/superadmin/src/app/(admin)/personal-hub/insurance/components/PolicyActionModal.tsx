"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface InsurancePolicy {
  id: string;
  policy_number: string;
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
  type: 'health' | 'auto' | 'life' | 'property' | 'travel' | 'business' | 'other';
  coverage_details: {
    start_date: string;
    end_date: string;
    coverage_amount: string;
    premium_amount: string;
    payment_frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
    beneficiaries?: string[];
  };
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  documents: string[];
  claims_count: number;
  created_at: string;
}

interface PolicyActionModalProps {
  show: boolean;
  onHide: () => void;
  policy: InsurancePolicy | null;
  action: 'approve' | 'reject' | 'cancel' | 'renew' | 'suspend';
  onConfirm?: (policyId: string, action: string, reason: string, additionalData?: any) => void;
}

const PolicyActionModal: React.FC<PolicyActionModalProps> = ({ 
  show, 
  onHide, 
  policy,
  action,
  onConfirm
}) => {
  const [reason, setReason] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [refundPremium, setRefundPremium] = useState(action === 'cancel');
  const [renewalPremium, setRenewalPremium] = useState<string>('');
  const [renewalPeriod, setRenewalPeriod] = useState<string>('12');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!policy) return null;

  // Get action details
  const getActionDetails = () => {
    return {
      approve: {
        title: 'Approve Policy',
        icon: 'ri:check-double-line',
        variant: 'success',
        description: 'Approve this insurance policy and activate coverage',
        confirmText: 'Approve Policy'
      },
      reject: {
        title: 'Reject Policy',
        icon: 'ri:close-circle-line',
        variant: 'danger',
        description: 'Reject this policy application and notify the customer',
        confirmText: 'Reject Policy'
      },
      cancel: {
        title: 'Cancel Policy',
        icon: 'ri:close-line',
        variant: 'danger',
        description: 'Cancel this active policy and process any applicable refunds',
        confirmText: 'Cancel Policy'
      },
      renew: {
        title: 'Renew Policy',
        icon: 'ri:refresh-line',
        variant: 'primary',
        description: 'Renew this expired policy with updated terms',
        confirmText: 'Renew Policy'
      },
      suspend: {
        title: 'Suspend Policy',
        icon: 'ri:pause-line',
        variant: 'warning',
        description: 'Temporarily suspend this policy coverage',
        confirmText: 'Suspend Policy'
      }
    }[action];
  };

  const actionDetails = getActionDetails();

  // Get type badge variant
  const getTypeBadgeVariant = (type: InsurancePolicy['type']) => {
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
          effectiveDate,
          notifyCustomer,
        };

        if (action === 'cancel') {
          additionalData.refundPremium = refundPremium;
        }

        if (action === 'renew') {
          additionalData.renewalPremium = renewalPremium;
          additionalData.renewalPeriod = parseInt(renewalPeriod);
        }
        
        await onConfirm(policy.id, action, reason, additionalData);
      }
      
      // Reset form
      setReason('');
      setEffectiveDate('');
      setNotifyCustomer(true);
      setRefundPremium(action === 'cancel');
      setRenewalPremium('');
      setRenewalPeriod('12');
      setValidated(false);
      onHide();
    } catch (error) {
      console.error('Error processing policy action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setReason('');
    setEffectiveDate('');
    setNotifyCustomer(true);
    setRefundPremium(action === 'cancel');
    setRenewalPremium('');
    setRenewalPeriod('12');
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
        {/* Policy Summary */}
        <div className="mb-4 p-3 bg-light rounded">
          <Row>
            <Col md={8}>
              <h6 className="mb-2">Policy Details</h6>
              <Table className="table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold">Policy Number:</td>
                    <td>{policy.policy_number}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">ID:</td>
                    <td>{policy.id}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Type:</td>
                    <td>
                      <Badge bg={getTypeBadgeVariant(policy.type)}>
                        {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Coverage Amount:</td>
                    <td>{policy.coverage_details.coverage_amount}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold">Premium:</td>
                    <td>{policy.coverage_details.premium_amount}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={4}>
              <h6 className="mb-2">Customer & Provider</h6>
              <div className="mb-2">
                <div className="fw-semibold">{policy.user.name}</div>
                <small className="text-muted">{policy.user.email}</small>
              </div>
              <div className="d-flex align-items-center">
                <img 
                  src={policy.provider.logo} 
                  alt={policy.provider.name} 
                  height="20" 
                  className="me-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                  }}
                />
                <span className="small">{policy.provider.name}</span>
              </div>
            </Col>
          </Row>
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
                    • Policy coverage will become active immediately<br />
                    • Customer will be notified of approval<br />
                    • Premium payment schedule will begin<br />
                    • Policy documents will be generated
                  </small>
                </div>
              )}
              {action === 'reject' && (
                <div className="mt-2">
                  <small>
                    • Policy application will be marked as rejected<br />
                    • Customer will be notified with reason<br />
                    • Any payments will be refunded<br />
                    • Application cannot be reactivated
                  </small>
                </div>
              )}
              {action === 'cancel' && (
                <div className="mt-2">
                  <small>
                    • Policy coverage will end on the effective date<br />
                    • Prorated premium refund may be processed<br />
                    • Customer will receive cancellation notice<br />
                    • Claims after effective date will be denied
                  </small>
                </div>
              )}
              {action === 'renew' && (
                <div className="mt-2">
                  <small>
                    • Policy will be renewed with new terms<br />
                    • Coverage will continue without interruption<br />
                    • New premium schedule will apply<br />
                    • Updated policy documents will be issued
                  </small>
                </div>
              )}
              {action === 'suspend' && (
                <div className="mt-2">
                  <small>
                    • Policy coverage will be temporarily suspended<br />
                    • Premium payments may be paused<br />
                    • Claims during suspension may be denied<br />
                    • Policy can be reactivated later
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
              Reason for {actionDetails.title} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                action === 'approve' 
                  ? 'e.g., All documents verified, customer meets eligibility criteria'
                  : action === 'reject'
                  ? 'e.g., Incomplete documentation, customer does not meet eligibility requirements'
                  : action === 'cancel'
                  ? 'e.g., Customer request, non-payment of premium, policy violation'
                  : action === 'renew'
                  ? 'e.g., Policy expired, customer requested renewal with updated terms'
                  : 'e.g., Non-payment of premium, policy under investigation'
              }
              required
              minLength={10}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a detailed reason (minimum 10 characters).
            </Form.Control.Feedback>
          </Form.Group>

          {/* Effective Date */}
          <Form.Group className="mb-3">
            <Form.Label>Effective Date <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <Form.Text className="text-muted">
              The date when this action will take effect
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Please select an effective date.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Renewal Specific Options */}
          {action === 'renew' && (
            <div className="mb-3">
              <h6 className="mb-3">Renewal Details</h6>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>New Premium Amount <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={renewalPremium}
                      onChange={(e) => setRenewalPremium(e.target.value)}
                      placeholder="Enter new premium amount"
                      required
                    />
                    <Form.Text className="text-muted">
                      Current premium: {policy.coverage_details.premium_amount}
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid premium amount.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Renewal Period (months)</Form.Label>
                    <Form.Select
                      value={renewalPeriod}
                      onChange={(e) => setRenewalPeriod(e.target.value)}
                    >
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="24">24 Months</option>
                      <option value="36">36 Months</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
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

            {action === 'cancel' && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="refund-premium"
                  label="Process prorated premium refund"
                  checked={refundPremium}
                  onChange={(e) => setRefundPremium(e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Refund unused portion of premium based on cancellation date
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
                    onClick={() => setReason('All required documents have been verified and customer meets all eligibility criteria for this insurance policy.')}
                  >
                    Documents Verified
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Standard approval process completed. Customer profile and risk assessment are within acceptable parameters.')}
                  >
                    Standard Approval
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Manual underwriting review completed successfully. Policy approved with standard terms and conditions.')}
                  >
                    Underwriting Approved
                  </Button>
                </>
              )}
              {action === 'reject' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Application rejected due to incomplete or insufficient documentation. Customer needs to provide additional required documents.')}
                  >
                    Incomplete Documentation
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Customer does not meet the eligibility criteria for this type of insurance policy as per underwriting guidelines.')}
                  >
                    Eligibility Not Met
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Risk assessment indicates high risk profile that exceeds acceptable parameters for this policy type.')}
                  >
                    High Risk Profile
                  </Button>
                </>
              )}
              {action === 'cancel' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Policy cancelled at customer request. Customer has submitted formal cancellation request with required notice period.')}
                  >
                    Customer Request
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Policy cancelled due to non-payment of premium. Multiple payment reminders have been sent without response.')}
                  >
                    Non-Payment
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Policy cancelled due to material misrepresentation or fraud detected during claim investigation.')}
                  >
                    Policy Violation
                  </Button>
                </>
              )}
              {action === 'renew' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Policy renewed with updated terms and premium rates based on current market conditions and risk assessment.')}
                  >
                    Standard Renewal
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Policy renewed at customer request with enhanced coverage options and adjusted premium rates.')}
                  >
                    Enhanced Coverage
                  </Button>
                </>
              )}
              {action === 'suspend' && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Policy suspended due to late premium payment. Coverage will be restored upon payment of outstanding premiums.')}
                  >
                    Late Payment
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setReason('Policy suspended pending investigation of recent claim. Coverage will be reviewed upon completion of investigation.')}
                  >
                    Under Investigation
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
          disabled={isSubmitting || !reason || reason.length < 10 || !effectiveDate || (action === 'renew' && !renewalPremium)}
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

export default PolicyActionModal;
