"use client";

import React, { useState, useEffect } from 'react';
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
    description: editProvider?.description || '',
    website: editProvider?.website || '',
    status: editProvider?.status || 'active',
    api_endpoint: editProvider?.api_endpoint || '',
    api_key: editProvider?.api_key || '',
    api_secret: editProvider?.api_secret || '',
    commission_rate: editProvider?.commission_rate || 0,
    insurance_types: editProvider?.insurance_types ? editProvider.insurance_types.join(', ') : '',
    coverage_areas: editProvider?.coverage_areas ? editProvider.coverage_areas.join(', ') : '',
    payment_methods: editProvider?.payment_methods ? editProvider.payment_methods.join(', ') : '',
    claim_process: editProvider?.claim_process || '',
    contact_info: editProvider?.contact_info ? JSON.stringify(editProvider.contact_info, null, 2) : JSON.stringify({
      contact_person: '',
      email: '',
      phone: '',
      address: ''
    }, null, 2),
    document_requirements: editProvider?.document_requirements ? JSON.stringify(editProvider.document_requirements, null, 2) : JSON.stringify({
      kyc_documents: ["ID Card", "Proof of Address"],
      policy_documents: ["Application Form", "Health Declaration"],
      claim_documents: ["Claim Form", "Supporting Documents"]
    }, null, 2)
  });

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editProvider) {
        setProviderData({
          name: editProvider.name || '',
          logo_url: editProvider.logo_url || '',
          description: editProvider.description || '',
          website: editProvider.website || '',
          status: editProvider.status || 'active',
          api_endpoint: editProvider.api_endpoint || '',
          api_key: editProvider.api_key || '',
          api_secret: editProvider.api_secret || '',
          commission_rate: editProvider.commission_rate || 0,
          insurance_types: editProvider.insurance_types ? editProvider.insurance_types.join(', ') : '',
          coverage_areas: editProvider.coverage_areas ? editProvider.coverage_areas.join(', ') : '',
          payment_methods: editProvider.payment_methods ? editProvider.payment_methods.join(', ') : '',
          claim_process: editProvider.claim_process || '',
          contact_info: editProvider.contact_info ? JSON.stringify(editProvider.contact_info, null, 2) : JSON.stringify({
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          }, null, 2),
          document_requirements: editProvider.document_requirements ? JSON.stringify(editProvider.document_requirements, null, 2) : JSON.stringify({
            kyc_documents: ["ID Card", "Proof of Address"],
            policy_documents: ["Application Form", "Health Declaration"],
            claim_documents: ["Claim Form", "Supporting Documents"]
          }, null, 2)
        });
      } else {
        setProviderData({
          name: '',
          logo_url: '',
          description: '',
          website: '',
          status: 'active',
          api_endpoint: '',
          api_key: '',
          api_secret: '',
          commission_rate: 0,
          insurance_types: 'Health, Life, Auto, Property',
          coverage_areas: 'National',
          payment_methods: 'Card, Bank Transfer, Mobile Money',
          claim_process: '',
          contact_info: JSON.stringify({
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          }, null, 2),
          document_requirements: JSON.stringify({
            kyc_documents: ["ID Card", "Proof of Address"],
            policy_documents: ["Application Form", "Health Declaration"],
            claim_documents: ["Claim Form", "Supporting Documents"]
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

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      let parsedDocumentRequirements;
      
      try {
        parsedContactInfo = JSON.parse(providerData.contact_info);
      } catch (error) {
        alert('Invalid JSON format in Contact Info');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedDocumentRequirements = JSON.parse(providerData.document_requirements);
      } catch (error) {
        alert('Invalid JSON format in Document Requirements');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...providerData,
        service_type: 'insurance',
        commission_rate: parseFloat(providerData.commission_rate as unknown as string),
        insurance_types: providerData.insurance_types.split(',').map(type => type.trim()),
        coverage_areas: providerData.coverage_areas.split(',').map(area => area.trim()),
        payment_methods: providerData.payment_methods.split(',').map(method => method.trim()),
        contact_info: parsedContactInfo,
        document_requirements: parsedDocumentRequirements
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
          {editProvider ? `Edit Insurance Provider: ${editProvider.name}` : 'Add Insurance Provider'}
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
              <Form.Group controlId="providerDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={providerData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Enter provider description"
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
            <Col md={6}>
              <Form.Group controlId="website">
                <Form.Label>Website</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:global-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="website"
                    value={providerData.website}
                    onChange={handleChange}
                    placeholder="e.g. https://example.com"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h5>Insurance Details</h5>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="insuranceTypes">
                <Form.Label>Insurance Types <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="insurance_types"
                  value={providerData.insurance_types}
                  onChange={handleChange}
                  placeholder="e.g. Health, Life, Auto, Property"
                />
                <Form.Text className="text-muted">
                  Comma-separated list of insurance types offered
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="coverageAreas">
                <Form.Label>Coverage Areas</Form.Label>
                <Form.Control
                  type="text"
                  name="coverage_areas"
                  value={providerData.coverage_areas}
                  onChange={handleChange}
                  placeholder="e.g. National, Regional, Global"
                />
                <Form.Text className="text-muted">
                  Comma-separated list of coverage areas
                </Form.Text>
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
                  value={providerData.payment_methods}
                  onChange={handleChange}
                  placeholder="e.g. Card, Bank Transfer, Mobile Money"
                />
                <Form.Text className="text-muted">
                  Comma-separated list of supported payment methods
                </Form.Text>
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
              <Form.Group controlId="claimProcess">
                <Form.Label>Claim Process</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="claim_process"
                  value={providerData.claim_process}
                  onChange={handleTextAreaChange}
                  placeholder="Describe the claim process for this provider"
                />
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
                    value={providerData.api_endpoint}
                    onChange={handleChange}
                    placeholder="https://api.insuranceprovider.com/v1"
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
          
          <hr className="my-4" />
          <h5>Additional Information</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="contactInfo">
                <Form.Label>Contact Information (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="contact_info"
                  value={providerData.contact_info}
                  onChange={handleTextAreaChange}
                  placeholder="Enter contact information in JSON format"
                />
                <Form.Text className="text-muted">
                  Define contact information in JSON format (contact_person, email, phone, address)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="documentRequirements">
                <Form.Label>Document Requirements (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="document_requirements"
                  value={providerData.document_requirements}
                  onChange={handleTextAreaChange}
                  placeholder="Enter document requirements in JSON format"
                />
                <Form.Text className="text-muted">
                  Define document requirements in JSON format (kyc_documents, policy_documents, claim_documents)
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
