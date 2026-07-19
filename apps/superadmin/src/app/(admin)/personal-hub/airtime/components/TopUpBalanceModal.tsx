"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Alert, InputGroup } from 'react-bootstrap';
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

interface TopUpBalanceModalProps {
  show: boolean;
  onHide: () => void;
  provider: Provider | null;
  onTopUp?: (providerId: string, amount: number, method: string) => void;
}

const TopUpBalanceModal: React.FC<TopUpBalanceModalProps> = ({ 
  show, 
  onHide, 
  provider,
  onTopUp
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [note, setNote] = useState<string>('');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!provider) return null;

  // Calculate new balance after top-up
  const currentBalance = parseFloat(provider.balance.replace('$', '').replace(',', ''));
  const topUpAmount = parseFloat(amount) || 0;
  const newBalance = currentBalance + topUpAmount;

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
      if (onTopUp) {
        await onTopUp(provider.id, topUpAmount, paymentMethod);
      }
      
      // Reset form
      setAmount('');
      setNote('');
      setValidated(false);
      onHide();
    } catch (error) {
      console.error('Error topping up balance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setAmount('');
    setNote('');
    setValidated(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 me-2">
            <IconifyIcon icon="ri:wallet-3-line" className="text-primary" />
          </div>
          Top Up Balance
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
              Current Balance: <strong>{provider.balance}</strong>
            </p>
          </div>
        </div>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Top-up Amount */}
          <Form.Group className="mb-3">
            <Form.Label>Top-up Amount <span className="text-danger">*</span></Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="1"
                max="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </InputGroup>
            <Form.Control.Feedback type="invalid">
              Please enter a valid amount between $1 and $50,000.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Payment Method */}
          <Form.Group className="mb-3">
            <Form.Label>Payment Method <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="wire_transfer">Wire Transfer</option>
            </Form.Select>
          </Form.Group>

          {/* Quick Amount Buttons */}
          <Form.Group className="mb-3">
            <Form.Label>Quick Amounts</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {[100, 500, 1000, 2500, 5000, 10000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                >
                  ${quickAmount.toLocaleString()}
                </Button>
              ))}
            </div>
          </Form.Group>

          {/* Balance Calculation */}
          {topUpAmount > 0 && (
            <Alert variant="info" className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Current Balance:</span>
                <span>${currentBalance.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Top-up Amount:</span>
                <span>+${topUpAmount.toLocaleString()}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold">
                <span>New Balance:</span>
                <span>${newBalance.toLocaleString()}</span>
              </div>
            </Alert>
          )}

          {/* Note */}
          <Form.Group className="mb-3">
            <Form.Label>Note (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about this top-up..."
            />
          </Form.Group>

          {/* Payment Method Info */}
          <Alert variant="warning" className="mb-0">
            <div className="d-flex">
              <IconifyIcon icon="ri:information-line" className="me-2 mt-1" />
              <div>
                <strong>Payment Instructions:</strong>
                <br />
                {paymentMethod === 'bank_transfer' && 'Bank transfer details will be provided after confirmation.'}
                {paymentMethod === 'credit_card' && 'You will be redirected to secure payment gateway.'}
                {paymentMethod === 'mobile_money' && 'Mobile money payment instructions will be sent via SMS.'}
                {paymentMethod === 'crypto' && 'Cryptocurrency wallet address will be provided.'}
                {paymentMethod === 'wire_transfer' && 'Wire transfer details will be sent via email.'}
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
          variant="primary" 
          onClick={(e) => handleSubmit(e as any)}
          disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Processing...
            </>
          ) : (
            <>
              <IconifyIcon icon="ri:wallet-3-line" className="me-1" />
              Top Up ${parseFloat(amount || '0').toLocaleString()}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TopUpBalanceModal;
