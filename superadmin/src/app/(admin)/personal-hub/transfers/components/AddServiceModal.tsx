"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddServiceModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (serviceData: any) => void;
  editService?: any;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editService
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [serviceData, setServiceData] = useState({
    name: editService?.name || '',
    logo_url: editService?.logo_url || '',
    api_endpoint: editService?.api_endpoint || '',
    api_key: editService?.api_key || '',
    api_secret: editService?.api_secret || '',
    status: editService?.status || 'active',
    service_type: 'transfer',
    transfer_type: editService?.transfer_type || 'domestic',
    commission_rate: editService?.commission_rate || 0,
    processing_time: editService?.processing_time || '',
    minimum_amount: editService?.minimum_amount || '',
    maximum_amount: editService?.maximum_amount || '',
    supported_countries: editService?.supported_countries || '',
    verification_required: editService?.verification_required || false,
    kyc_level: editService?.kyc_level || 'basic',
    fee_structure: editService?.fee_structure ? JSON.stringify(editService.fee_structure, null, 2) : JSON.stringify({
      fixed_fee: 0,
      percentage_fee: 0,
      tier_fees: [
        { min_amount: 0, max_amount: 100, fixed_fee: 1, percentage_fee: 2 },
        { min_amount: 100.01, max_amount: 500, fixed_fee: 2, percentage_fee: 1.5 },
        { min_amount: 500.01, max_amount: null, fixed_fee: 5, percentage_fee: 1 }
      ]
    }, null, 2),
    required_fields: editService?.required_fields ? JSON.stringify(editService.required_fields, null, 2) : JSON.stringify([
      { name: "recipient_name", label: "Recipient Name", type: "text", required: true },
      { name: "recipient_account", label: "Account Number", type: "text", required: true },
      { name: "recipient_bank", label: "Bank Name", type: "text", required: true },
      { name: "recipient_phone", label: "Phone Number", type: "tel", required: false }
    ], null, 2),
    contact_info: editService?.contact_info ? JSON.stringify(editService.contact_info, null, 2) : JSON.stringify({
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
      setActiveTab('basic');
      if (editService) {
        setServiceData({
          name: editService.name || '',
          logo_url: editService.logo_url || '',
          api_endpoint: editService.api_endpoint || '',
          api_key: editService.api_key || '',
          api_secret: editService.api_secret || '',
          status: editService.status || 'active',
          service_type: 'transfer',
          transfer_type: editService.transfer_type || 'domestic',
          commission_rate: editService.commission_rate || 0,
          processing_time: editService.processing_time || '',
          minimum_amount: editService.minimum_amount || '',
          maximum_amount: editService.maximum_amount || '',
          supported_countries: editService.supported_countries || '',
          verification_required: editService.verification_required || false,
          kyc_level: editService.kyc_level || 'basic',
          fee_structure: editService.fee_structure ? JSON.stringify(editService.fee_structure, null, 2) : JSON.stringify({
            fixed_fee: 0,
            percentage_fee: 0,
            tier_fees: [
              { min_amount: 0, max_amount: 100, fixed_fee: 1, percentage_fee: 2 },
              { min_amount: 100.01, max_amount: 500, fixed_fee: 2, percentage_fee: 1.5 },
              { min_amount: 500.01, max_amount: null, fixed_fee: 5, percentage_fee: 1 }
            ]
          }, null, 2),
          required_fields: editService.required_fields ? JSON.stringify(editService.required_fields, null, 2) : JSON.stringify([
            { name: "recipient_name", label: "Recipient Name", type: "text", required: true },
            { name: "recipient_account", label: "Account Number", type: "text", required: true },
            { name: "recipient_bank", label: "Bank Name", type: "text", required: true },
            { name: "recipient_phone", label: "Phone Number", type: "tel", required: false }
          ], null, 2),
          contact_info: editService.contact_info ? JSON.stringify(editService.contact_info, null, 2) : JSON.stringify({
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          }, null, 2)
        });
      } else {
        setServiceData({
          name: '',
          logo_url: '',
          api_endpoint: '',
          api_key: '',
          api_secret: '',
          status: 'active',
          service_type: 'transfer',
          transfer_type: 'domestic',
          commission_rate: 0,
          processing_time: '1-2 business days',
          minimum_amount: '10',
          maximum_amount: '1000',
          supported_countries: '',
          verification_required: false,
          kyc_level: 'basic',
          fee_structure: JSON.stringify({
            fixed_fee: 0,
            percentage_fee: 0,
            tier_fees: [
              { min_amount: 0, max_amount: 100, fixed_fee: 1, percentage_fee: 2 },
              { min_amount: 100.01, max_amount: 500, fixed_fee: 2, percentage_fee: 1.5 },
              { min_amount: 500.01, max_amount: null, fixed_fee: 5, percentage_fee: 1 }
            ]
          }, null, 2),
          required_fields: JSON.stringify([
            { name: "recipient_name", label: "Recipient Name", type: "text", required: true },
            { name: "recipient_account", label: "Account Number", type: "text", required: true },
            { name: "recipient_bank", label: "Bank Name", type: "text", required: true },
            { name: "recipient_phone", label: "Phone Number", type: "tel", required: false }
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
  }, [show, editService]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setServiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setServiceData(prev => ({
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
      // Parse JSON fields
      let parsedFeeStructure;
      let parsedRequiredFields;
      let parsedContactInfo;
      
      try {
        parsedFeeStructure = JSON.parse(serviceData.fee_structure);
      } catch (error) {
        alert('Invalid JSON format in Fee Structure');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedRequiredFields = JSON.parse(serviceData.required_fields);
      } catch (error) {
        alert('Invalid JSON format in Required Fields');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedContactInfo = JSON.parse(serviceData.contact_info);
      } catch (error) {
        alert('Invalid JSON format in Contact Info');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...serviceData,
        commission_rate: parseFloat(serviceData.commission_rate as unknown as string),
        minimum_amount: parseFloat(serviceData.minimum_amount as unknown as string),
        maximum_amount: parseFloat(serviceData.maximum_amount as unknown as string),
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
      dialogClassName="modal-large"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editService ? `Edit Service: ${editService.name}` : 'Add Money Transfer Service'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  type="button"
                  className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('basic')}
                >
                  <IconifyIcon icon="ri:information-line" className="me-1" />
                  Basic Info
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button"
                  className={`nav-link ${activeTab === 'fees' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('fees')}
                >
                  <IconifyIcon icon="ri:money-dollar-circle-line" className="me-1" />
                  Fees & Limits
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button"
                  className={`nav-link ${activeTab === 'fields' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('fields')}
                >
                  <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                  Required Fields
                </button>
              </li>
              <li className="nav-item">
                <button 
                  type="button"
                  className={`nav-link ${activeTab === 'api' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('api')}
                >
                  <IconifyIcon icon="ri:code-s-slash-line" className="me-1" />
                  API Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="serviceName">
                    <Form.Label>Service Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="name"
                      value={serviceData.name}
                      onChange={handleChange}
                      placeholder="Enter service name"
                    />
                    <Form.Control.Feedback type="invalid">
                      Service name is required
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="serviceStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={serviceData.status}
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
                        value={serviceData.logo_url}
                        onChange={handleChange}
                        placeholder="Enter logo URL"
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Provide a URL to the service provider's logo image
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="transferType">
                    <Form.Label>Transfer Type</Form.Label>
                    <Form.Select
                      name="transfer_type"
                      value={serviceData.transfer_type}
                      onChange={handleSelectChange}
                    >
                      <option value="domestic">Domestic</option>
                      <option value="international">International</option>
                      <option value="both">Both</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="processingTime">
                    <Form.Label>Processing Time</Form.Label>
                    <Form.Control
                      type="text"
                      name="processing_time"
                      value={serviceData.processing_time}
                      onChange={handleChange}
                      placeholder="e.g. 1-2 business days"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="supportedCountries">
                    <Form.Label>Supported Countries</Form.Label>
                    <Form.Control
                      type="text"
                      name="supported_countries"
                      value={serviceData.supported_countries}
                      onChange={handleChange}
                      placeholder="e.g. Nigeria, Ghana, Kenya, South Africa"
                    />
                    <Form.Text className="text-muted">
                      Comma-separated list of countries where this service is available
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    id="verificationRequired"
                    label="Verification Required"
                    name="verification_required"
                    checked={serviceData.verification_required}
                    onChange={handleCheckboxChange}
                  />
                  <Form.Text className="text-muted">
                    Enable if this service requires additional verification
                  </Form.Text>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="kycLevel">
                    <Form.Label>KYC Level</Form.Label>
                    <Form.Select
                      name="kyc_level"
                      value={serviceData.kyc_level}
                      onChange={handleSelectChange}
                      disabled={!serviceData.verification_required}
                    >
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="enhanced">Enhanced</option>
                    </Form.Select>
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
                      value={serviceData.contact_info}
                      onChange={handleChange}
                      placeholder="Enter contact information in JSON format"
                    />
                    <Form.Text className="text-muted">
                      Define contact information in JSON format (contact_person, email, phone, etc.)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {/* Fees & Limits Tab */}
          {activeTab === 'fees' && (
            <>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group controlId="minimumAmount">
                    <Form.Label>Minimum Amount <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        name="minimum_amount"
                        value={serviceData.minimum_amount}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                      <Form.Control.Feedback type="invalid">
                        Minimum amount is required
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="maximumAmount">
                    <Form.Label>Maximum Amount <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        name="maximum_amount"
                        value={serviceData.maximum_amount}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                      <Form.Control.Feedback type="invalid">
                        Maximum amount is required
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="commissionRate">
                    <Form.Label>Commission Rate (%)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        name="commission_rate"
                        value={serviceData.commission_rate}
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
                      rows={12}
                      name="fee_structure"
                      value={serviceData.fee_structure}
                      onChange={handleChange}
                      placeholder="Enter fee structure in JSON format"
                    />
                    <Form.Text className="text-muted">
                      Define the tiered fee structure in JSON format. You can specify fixed fees, percentage fees, and tier-based fees.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="alert alert-info">
                <h5 className="alert-heading">Fee Structure Example</h5>
                <p className="mb-0">The fee structure can include fixed fees, percentage fees, and tiered fees based on transaction amount ranges.</p>
                <hr />
                <pre className="mb-0" style={{ fontSize: '0.8rem' }}>
{`{
  "fixed_fee": 1.00,          // Fixed fee applied to all transactions
  "percentage_fee": 1.5,      // Percentage fee applied to all transactions
  "tier_fees": [              // Tiered fees based on amount ranges
    {
      "min_amount": 0,        // Minimum amount for this tier
      "max_amount": 100,      // Maximum amount for this tier
      "fixed_fee": 1,         // Fixed fee for this tier
      "percentage_fee": 2     // Percentage fee for this tier
    },
    {
      "min_amount": 100.01,
      "max_amount": 500,
      "fixed_fee": 2,
      "percentage_fee": 1.5
    },
    {
      "min_amount": 500.01,
      "max_amount": null,     // null means no upper limit
      "fixed_fee": 5,
      "percentage_fee": 1
    }
  ]
}`}
                </pre>
              </div>
            </>
          )}

          {/* Required Fields Tab */}
          {activeTab === 'fields' && (
            <>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="requiredFields">
                    <Form.Label>Required Fields (JSON)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={12}
                      name="required_fields"
                      value={serviceData.required_fields}
                      onChange={handleChange}
                      placeholder="Enter required fields in JSON format"
                    />
                    <Form.Text className="text-muted">
                      Define the fields required for this money transfer service in JSON format.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="alert alert-info">
                <h5 className="alert-heading">Required Fields Example</h5>
                <p className="mb-0">Define the fields that users need to fill when using this transfer service:</p>
                <hr />
                <pre className="mb-0" style={{ fontSize: '0.8rem' }}>
{`[
  {
    "name": "recipient_name",    // Field identifier
    "label": "Recipient Name",   // User-friendly label
    "type": "text",              // Field type (text, number, tel, email, etc.)
    "required": true             // Whether this field is mandatory
  },
  {
    "name": "recipient_account",
    "label": "Account Number",
    "type": "text",
    "required": true
  },
  {
    "name": "recipient_bank",
    "label": "Bank Name",
    "type": "text",
    "required": true
  },
  {
    "name": "recipient_phone",
    "label": "Phone Number",
    "type": "tel",
    "required": false
  }
]`}
                </pre>
              </div>
            </>
          )}

          {/* API Settings Tab */}
          {activeTab === 'api' && (
            <>
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
                        value={serviceData.api_endpoint}
                        onChange={handleChange}
                        placeholder="https://api.transferservice.com/v1"
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
                        value={serviceData.api_key}
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
                        value={serviceData.api_secret}
                        onChange={handleChange}
                        placeholder="Enter API secret"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="alert alert-warning">
                <h5 className="alert-heading"><IconifyIcon icon="ri:shield-keyhole-line" className="me-1" /> Security Notice</h5>
                <p className="mb-0">API credentials are sensitive information. Ensure they are properly encrypted and stored securely. Only authorized personnel should have access to these credentials.</p>
              </div>
              
              <div className="mb-3">
                <h5>API Endpoints Reference</h5>
                <Table bordered size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Endpoint</th>
                      <th>Method</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>/transfers</code></td>
                      <td>POST</td>
                      <td>Create a new money transfer</td>
                    </tr>
                    <tr>
                      <td><code>/transfers/{'{id}'}</code></td>
                      <td>GET</td>
                      <td>Get transfer status</td>
                    </tr>
                    <tr>
                      <td><code>/transfers/{'{id}'}/cancel</code></td>
                      <td>POST</td>
                      <td>Cancel a pending transfer</td>
                    </tr>
                    <tr>
                      <td><code>/rates</code></td>
                      <td>GET</td>
                      <td>Get current exchange rates</td>
                    </tr>
                    <tr>
                      <td><code>/fees</code></td>
                      <td>GET</td>
                      <td>Calculate fees for a transfer</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <div className="d-flex w-100 justify-content-between">
            <div>
              {activeTab !== 'basic' && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    const tabs = ['basic', 'fees', 'fields', 'api'];
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex - 1]);
                  }}
                >
                  <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
                  Previous
                </Button>
              )}
            </div>
            
            <div>
              <Button variant="secondary" onClick={onHide} disabled={isSubmitting} className="me-2">
                Cancel
              </Button>
              {activeTab !== 'api' ? (
                <Button 
                  variant="primary" 
                  onClick={() => {
                    const tabs = ['basic', 'fees', 'fields', 'api'];
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex + 1]);
                  }}
                >
                  Next
                  <IconifyIcon icon="ri:arrow-right-line" className="ms-1" />
                </Button>
              ) : (
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
                      {editService ? 'Update Service' : 'Save Service'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddServiceModal;
