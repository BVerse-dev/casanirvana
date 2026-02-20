"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddClaimNoteModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (noteData: any) => void;
  claimId: string;
  claimNumber?: string;
}

const AddClaimNoteModal: React.FC<AddClaimNoteModalProps> = ({ 
  show, 
  onHide,
  onSave,
  claimId,
  claimNumber
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [noteData, setNoteData] = useState({
    note_type: 'internal',
    content: '',
    visibility: 'staff_only',
    notify_customer: false,
    notify_provider: false
  });

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      setNoteData({
        note_type: 'internal',
        content: '',
        visibility: 'staff_only',
        notify_customer: false,
        notify_provider: false
      });
    }
  }, [show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for saving
      const dataToSave = {
        ...noteData,
        claim_id: claimId,
        created_at: new Date().toISOString(),
        created_by: 'Admin User', // In a real app, this would be the current user
      };
      
      // Call onSave function passed from parent
      onSave(dataToSave);
      
      // Close modal
      onHide();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Add Note to Claim {claimNumber ? `#${claimNumber}` : ''}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="noteType">
                <Form.Label>Note Type</Form.Label>
                <Form.Select
                  name="note_type"
                  value={noteData.note_type}
                  onChange={handleSelectChange}
                >
                  <option value="internal">Internal Note</option>
                  <option value="customer_communication">Customer Communication</option>
                  <option value="provider_communication">Provider Communication</option>
                  <option value="document_request">Document Request</option>
                  <option value="status_update">Status Update</option>
                  <option value="decision">Decision Note</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="noteContent">
                <Form.Label>Note Content <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="content"
                  value={noteData.content}
                  onChange={handleChange}
                  placeholder="Enter note content"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Note content is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="visibility">
                <Form.Label>Visibility</Form.Label>
                <Form.Select
                  name="visibility"
                  value={noteData.visibility}
                  onChange={handleSelectChange}
                >
                  <option value="staff_only">Staff Only</option>
                  <option value="customer_visible">Customer Visible</option>
                  <option value="provider_visible">Provider Visible</option>
                  <option value="all_parties">All Parties</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="checkbox"
                id="notifyCustomer"
                label="Send notification to customer"
                name="notify_customer"
                checked={noteData.notify_customer}
                onChange={handleCheckboxChange}
                disabled={noteData.visibility === 'staff_only' || noteData.visibility === 'provider_visible'}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                id="notifyProvider"
                label="Send notification to provider"
                name="notify_provider"
                checked={noteData.notify_provider}
                onChange={handleCheckboxChange}
                disabled={noteData.visibility === 'staff_only' || noteData.visibility === 'customer_visible'}
              />
            </Col>
          </Row>
          
          {(noteData.notify_customer || noteData.notify_provider) && (
            <div className="alert alert-info">
              <IconifyIcon icon="ri:information-line" className="me-1" />
              Notifications will be sent via email when this note is saved.
            </div>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:save-line" className="me-1" />
                Add Note
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddClaimNoteModal;
