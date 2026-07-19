"use client";

import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddProviderModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (providerData: any) => void;
  editProvider?: any;
}

const AddProviderModal: React.FC<AddProviderModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editProvider
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [providerData, setProviderData] = useState({
    name: editProvider?.name || '',
    logo_url: editProvider?.logo_url || '',
    api_endpoint: editProvider?.api_endpoint || '',
    api_key: editProvider?.api_key || '',
    api_secret: editProvider?.api_secret || '',
    status: editProvider?.status || 'active',
    commission_rate: editProvider?.commission_rate || 0,
    contact_info: editProvider?.contact_info ? JSON.stringify(editProvider.contact_info, null, 2) : JSON.stringify({
      contact_person: '',
      email: '',
      phone: '',
      address: ''
    }, null, 2),
    fee_structure: editProvider?.fee_structure ? JSON.stringify(editProvider.fee_structure, null, 2) : JSON.stringify({
      fixed_fee: 0,
      percentage_fee: 0,
      minimum_fee: 0,
      maximum_fee: 0
    }, null, 2)
  });

  // Reset form when modal is opened or closed
  React.useEffect(() => {
    if (show) {
      setValidated(false);
      if (editProvider) {
        setProviderData({
          name: editProvider.name || '',
          logo_url: editProvider.logo_url || '',
          api_endpoint: editProvider.api_endpoint || '',
          api_key: editProvider.api_key || '',
          api_secret: editProvider.api_secret || '',
          status: editProvider.status || 'active',
          commission_rate: editProvider.commission_rate || 0,
          contact_info: editProvider.contact_info ? JSON.stringify(editProvider.contact_info, null, 2) : JSON.stringify({
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          }, null, 2),
          fee_structure: editProvider.fee_structure ? JSON.stringify(editProvider.fee_structure, null, 2) : JSON.stringify({
            fixed_fee: 0,
            percentage_fee: 0,
            minimum_fee: 0,
            maximum_fee: 0
          }, null, 2)
        });
      } else {
        setProviderData({
          name: '',
          logo_url: '',
          api_endpoint: '',
          api_key: '',
          api_secret: '',
          status: 'active',
          commission_rate: 0,
          contact_info: JSON.stringify({
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          }, null, 2),
          fee_structure: JSON.stringify({
            fixed_fee: 0,
            percentage_fee: 0,
            minimum_fee: 0,
            maximum_fee: 0
          }, null, 2)
        });
      }
    }
  }, [show, editProvider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProviderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProviderData(prev => ({
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
      let parsedContactInfo;
      let parsedFeeStructure;
      
      try {
        parsedContactInfo = JSON.parse(providerData.contact_info);
      } catch (error) {
        alert('Invalid JSON format in Contact Info');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedFeeStructure = JSON.parse(providerData.fee_structure);
      } catch (error) {
        alert('Invalid JSON format in Fee Structure');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...providerData,
        service_type: 'airtime',
        commission_rate: parseFloat(providerData.commission_rate as unknown as string),
        contact_info: parsedContactInfo,
        fee_structure: parsedFeeStructure
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
          {editProvider ? `Edit Provider: ${editProvider.name}` : 'Add Airtime Provider'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="providerName">
                <Form.Label>Provider Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={providerData.name}
                  onChange={handleChange}
                  placeholder="Enter provider name"
                />
                <Form.Control.Feedback type="invalid">
                  Provider name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="providerStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={providerData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="logoUrl">
                <Form.Label>Logo URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:image-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="logo_url"
                    value={providerData.logo_url}
                    onChange={handleChange}
                    placeholder="Enter logo URL"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Provide a URL to the provider's logo image
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
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
                    value={providerData.api_endpoint}
                    onChange={handleChange}
                    placeholder="https://api.provider.com/v1"
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
                    value={providerData.api_key}
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
                    value={providerData.api_secret}
                    onChange={handleChange}
                    placeholder="Enter API secret"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
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
                    value={providerData.commission_rate}
                    onChange={handleChange}
                    placeholder="Enter commission rate"
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="feeStructure">
                <Form.Label>Fee Structure (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="fee_structure"
                  value={providerData.fee_structure}
                  onChange={handleChange}
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
              <Form.Group controlId="contactInfo">
                <Form.Label>Contact Information (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="contact_info"
                  value={providerData.contact_info}
                  onChange={handleChange}
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
                {editProvider ? 'Update Provider' : 'Save Provider'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddProviderModal;
