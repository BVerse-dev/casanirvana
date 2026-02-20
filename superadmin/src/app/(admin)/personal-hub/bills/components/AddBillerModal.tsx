"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddBillerModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (billerData: any) => void;
  editBiller?: any;
}

const AddBillerModal: React.FC<AddBillerModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editBiller
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [billerData, setbillerData] = useState({
    name: editBiller?.name || '',
    logo_url: editBiller?.logo_url || '',
    category: editBiller?.category || 'utility',
    description: editBiller?.description || '',
    api_endpoint: editBiller?.api_endpoint || '',
    api_key: editBiller?.api_key || '',
    api_secret: editBiller?.api_secret || '',
    status: editBiller?.status || 'active',
    commission_rate: editBiller?.commission_rate || 0,
    processing_time: editBiller?.processing_time || '',
    requires_account_validation: editBiller?.requires_account_validation || false,
    validation_method: editBiller?.validation_method || 'api',
    payment_methods: editBiller?.payment_methods ? editBiller.payment_methods.join(', ') : 'card, bank_transfer',
    fee_structure: editBiller?.fee_structure ? JSON.stringify(editBiller.fee_structure, null, 2) : JSON.stringify({
      fixed_fee: 0,
      percentage_fee: 0,
      min_fee: 0,
      max_fee: 0
    }, null, 2),
    required_fields: editBiller?.required_fields ? JSON.stringify(editBiller.required_fields, null, 2) : JSON.stringify([
      { name: "account_number", label: "Account Number", type: "text", required: true, validation: "^[0-9]{10,12}$" },
      { name: "customer_name", label: "Customer Name", type: "text", required: true },
      { name: "amount", label: "Amount", type: "number", required: true, min: 10 }
    ], null, 2),
    contact_info: editBiller?.contact_info ? JSON.stringify(editBiller.contact_info, null, 2) : JSON.stringify({
      contact_person: '',
      email: '',
      phone: '',
      address: ''
    }, null, 2)
  });

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editBiller) {
        setbillerData({
          name: editBiller.name || '',
          logo_url: editBiller.logo_url || '',
          category: editBiller.category || 'utility',
          description: editBiller.description || '',
          api_endpoint: editBiller.api_endpoint || '',
          api_key: editBiller.api_key || '',
          api_secret: editBiller.api_secret || '',
          status: editBiller.status || 'active',
          commission_rate: editBiller.commission_rate || 0,
          processing_time: editBiller.processing_time || '',
          requires_account_validation: editBiller.requires_account_validation || false,
          validation_method: editBiller.validation_method || 'api',
          payment_methods: editBiller.payment_methods ? editBiller.payment_methods.join(', ') : 'card, bank_transfer',
          fee_structure: editBiller.fee_structure ? JSON.stringify(editBiller.fee_structure, null, 2) : JSON.stringify({
            fixed_fee: 0,
            percentage_fee: 0,
            min_fee: 0,
            max_fee: 0
          }, null, 2),
          required_fields: editBiller.required_fields ? JSON.stringify(editBiller.required_fields, null, 2) : JSON.stringify([
            { name: "account_number", label: "Account Number", type: "text", required: true, validation: "^[0-9]{10,12}$" },
            { name: "customer_name", label: "Customer Name", type: "text", required: true },
            { name: "amount", label: "Amount", type: "number", required: true, min: 10 }
          ], null, 2),
          contact_info: editBiller.contact_info ? JSON.stringify(editBiller.contact_info, null, 2) : JSON.stringify({
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          }, null, 2)
        });
      } else {
        setbillerData({
          name: '',
          logo_url: '',
          category: 'utility',
          description: '',
          api_endpoint: '',
          api_key: '',
          api_secret: '',
          status: 'active',
          commission_rate: 0,
          processing_time: 'instant',
          requires_account_validation: true,
          validation_method: 'api',
          payment_methods: 'card, bank_transfer',
          fee_structure: JSON.stringify({
            fixed_fee: 0,
            percentage_fee: 0,
            min_fee: 0,
            max_fee: 0
          }, null, 2),
          required_fields: JSON.stringify([
            { name: "account_number", label: "Account Number", type: "text", required: true, validation: "^[0-9]{10,12}$" },
            { name: "customer_name", label: "Customer Name", type: "text", required: true },
            { name: "amount", label: "Amount", type: "number", required: true, min: 10 }
          ], null, 2),
          contact_info: JSON.stringify({
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          }, null, 2)
        });
      }
    }
  }, [show, editBiller]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setbillerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setbillerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setbillerData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setbillerData(prev => ({
      ...prev,
      [name]: value
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
      // Parse JSON fields
      let parsedFeeStructure;
      let parsedRequiredFields;
      let parsedContactInfo;
      
      try {
        parsedFeeStructure = JSON.parse(billerData.fee_structure);
      } catch (error) {
        alert('Invalid JSON format in Fee Structure');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedRequiredFields = JSON.parse(billerData.required_fields);
      } catch (error) {
        alert('Invalid JSON format in Required Fields');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedContactInfo = JSON.parse(billerData.contact_info);
      } catch (error) {
        alert('Invalid JSON format in Contact Info');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...billerData,
        service_type: 'bill_payment',
        commission_rate: parseFloat(billerData.commission_rate as unknown as string),
        payment_methods: billerData.payment_methods.split(',').map(method => method.trim()),
        fee_structure: parsedFeeStructure,
        required_fields: parsedRequiredFields,
        contact_info: parsedContactInfo
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
      size="lg"
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editBiller ? `Edit Biller: ${editBiller.name}` : 'Add Bill Payment Provider'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="billerName">
                <Form.Label>Biller Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={billerData.name}
                  onChange={handleChange}
                  placeholder="Enter biller name"
                />
                <Form.Control.Feedback type="invalid">
                  Biller name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="billerCategory">
                <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  required
                  name="category"
                  value={billerData.category}
                  onChange={handleSelectChange}
                >
                  <option value="utility">Utility</option>
                  <option value="telecom">Telecom</option>
                  <option value="internet">Internet</option>
                  <option value="cable_tv">Cable TV</option>
                  <option value="education">Education</option>
                  <option value="government">Government</option>
                  <option value="insurance">Insurance</option>
                  <option value="loan">Loan Repayment</option>
                  <option value="charity">Charity/Donation</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="billerDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={billerData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Enter biller description"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="logoUrl">
                <Form.Label>Logo URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:image-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="logo_url"
                    value={billerData.logo_url}
                    onChange={handleChange}
                    placeholder="Enter logo URL"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Provide a URL to the biller's logo image
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="billerStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={billerData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="maintenance">Maintenance</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="processingTime">
                <Form.Label>Processing Time</Form.Label>
                <Form.Control
                  type="text"
                  name="processing_time"
                  value={billerData.processing_time}
                  onChange={handleChange}
                  placeholder="e.g. instant, 24 hours"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="commissionRate">
                <Form.Label>Commission Rate (%)</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    name="commission_rate"
                    value={billerData.commission_rate}
                    onChange={handleChange}
                    placeholder="Enter commission rate"
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="paymentMethods">
                <Form.Label>Payment Methods</Form.Label>
                <Form.Control
                  type="text"
                  name="payment_methods"
                  value={billerData.payment_methods}
                  onChange={handleChange}
                  placeholder="e.g. card, bank_transfer, wallet"
                />
                <Form.Text className="text-muted">
                  Comma-separated list of supported payment methods
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Account Validation</Form.Label>
                <div className="d-flex flex-column">
                  <Form.Check
                    type="checkbox"
                    id="requiresAccountValidation"
                    label="Requires Account Validation"
                    name="requires_account_validation"
                    checked={billerData.requires_account_validation}
                    onChange={handleCheckboxChange}
                  />
                  {billerData.requires_account_validation && (
                    <Form.Select
                      className="mt-2"
                      name="validation_method"
                      value={billerData.validation_method}
                      onChange={handleSelectChange}
                    >
                      <option value="api">API Validation</option>
                      <option value="manual">Manual Validation</option>
                      <option value="regex">Regex Pattern</option>
                      <option value="none">No Validation</option>
                    </Form.Select>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h5>API Configuration</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="apiEndpoint">
                <Form.Label>API Endpoint</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:link" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="api_endpoint"
                    value={billerData.api_endpoint}
                    onChange={handleChange}
                    placeholder="https://api.biller.com/v1"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="apiKey">
                <Form.Label>API Key</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:key-2-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="api_key"
                    value={billerData.api_key}
                    onChange={handleChange}
                    placeholder="Enter API key"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="apiSecret">
                <Form.Label>API Secret</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:lock-password-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="api_secret"
                    value={billerData.api_secret}
                    onChange={handleChange}
                    placeholder="Enter API secret"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h5>Advanced Configuration</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="feeStructure">
                <Form.Label>Fee Structure (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="fee_structure"
                  value={billerData.fee_structure}
                  onChange={handleTextAreaChange}
                  placeholder="Enter fee structure in JSON format"
                />
                <Form.Text className="text-muted">
                  Define the fee structure in JSON format (fixed_fee, percentage_fee, etc.)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="requiredFields">
                <Form.Label>Required Fields (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="required_fields"
                  value={billerData.required_fields}
                  onChange={handleTextAreaChange}
                  placeholder="Enter required fields in JSON format"
                />
                <Form.Text className="text-muted">
                  Define the fields required for this biller in JSON format.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="contactInfo">
                <Form.Label>Contact Information (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="contact_info"
                  value={billerData.contact_info}
                  onChange={handleTextAreaChange}
                  placeholder="Enter contact information in JSON format"
                />
                <Form.Text className="text-muted">
                  Define contact information in JSON format (contact_person, email, phone, etc.)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
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
                {editBiller ? 'Update Biller' : 'Save Biller'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddBillerModal;
