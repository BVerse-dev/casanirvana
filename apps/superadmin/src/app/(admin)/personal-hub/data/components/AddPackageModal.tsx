"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddPackageModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (packageData: any) => void;
  editPackage?: any;
  providers?: any[];
}

const AddPackageModal: React.FC<AddPackageModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editPackage,
  providers = []
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [packageData, setPackageData] = useState({
    name: editPackage?.name || '',
    description: editPackage?.description || '',
    provider_id: editPackage?.provider_id || '',
    price: editPackage?.price || '',
    original_price: editPackage?.original_price || '',
    currency: editPackage?.currency || 'USD',
    duration_days: editPackage?.duration_days || '',
    data_amount: editPackage?.data_amount || '',
    data_unit: editPackage?.data_unit || 'GB',
    is_featured: editPackage?.is_featured || false,
    is_popular: editPackage?.is_popular || false,
    availability_status: editPackage?.availability_status || 'available',
    benefits: editPackage?.benefits ? JSON.stringify(editPackage.benefits, null, 2) : JSON.stringify([
      "High-speed browsing",
      "No throttling",
      "24/7 customer support"
    ], null, 2)
  });

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editPackage) {
        setPackageData({
          name: editPackage.name || '',
          description: editPackage.description || '',
          provider_id: editPackage.provider_id || '',
          price: editPackage.price || '',
          original_price: editPackage.original_price || '',
          currency: editPackage.currency || 'USD',
          duration_days: editPackage.duration_days || '',
          data_amount: editPackage.data_amount || '',
          data_unit: editPackage.data_unit || 'GB',
          is_featured: editPackage.is_featured || false,
          is_popular: editPackage.is_popular || false,
          availability_status: editPackage.availability_status || 'available',
          benefits: editPackage.benefits ? JSON.stringify(editPackage.benefits, null, 2) : JSON.stringify([
            "High-speed browsing",
            "No throttling",
            "24/7 customer support"
          ], null, 2)
        });
      } else {
        setPackageData({
          name: '',
          description: '',
          provider_id: providers.length > 0 ? providers[0].id : '',
          price: '',
          original_price: '',
          currency: 'USD',
          duration_days: '30',
          data_amount: '',
          data_unit: 'GB',
          is_featured: false,
          is_popular: false,
          availability_status: 'available',
          benefits: JSON.stringify([
            "High-speed browsing",
            "No throttling",
            "24/7 customer support"
          ], null, 2)
        });
      }
    }
  }, [show, editPackage, providers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPackageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPackageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPackageData(prev => ({
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
      let parsedBenefits;
      
      try {
        parsedBenefits = JSON.parse(packageData.benefits);
      } catch (error) {
        alert('Invalid JSON format in Benefits');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...packageData,
        service_type: 'data',
        price: parseFloat(packageData.price as unknown as string),
        original_price: packageData.original_price ? parseFloat(packageData.original_price as unknown as string) : null,
        duration_days: parseInt(packageData.duration_days as unknown as string, 10),
        data_amount: parseFloat(packageData.data_amount as unknown as string),
        benefits: parsedBenefits
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
          {editPackage ? `Edit Package: ${editPackage.name}` : 'Add Data Package'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group controlId="packageName">
                <Form.Label>Package Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={packageData.name}
                  onChange={handleChange}
                  placeholder="Enter package name"
                />
                <Form.Control.Feedback type="invalid">
                  Package name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="providerId">
                <Form.Label>Provider <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  required
                  name="provider_id"
                  value={packageData.provider_id}
                  onChange={handleSelectChange}
                >
                  <option value="">Select Provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Provider is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="packageDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={packageData.description}
                  onChange={handleChange}
                  placeholder="Enter package description"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="packagePrice">
                <Form.Label>Price <span className="text-danger">*</span></Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={packageData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                  <Form.Control.Feedback type="invalid">
                    Price is required
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="packageOriginalPrice">
                <Form.Label>Original Price</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="original_price"
                    value={packageData.original_price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Original price before discount (if applicable)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="packageCurrency">
                <Form.Label>Currency</Form.Label>
                <Form.Select
                  name="currency"
                  value={packageData.currency}
                  onChange={handleSelectChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NGN">NGN</option>
                  <option value="KES">KES</option>
                  <option value="GHS">GHS</option>
                  <option value="ZAR">ZAR</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="packageDataAmount">
                <Form.Label>Data Amount <span className="text-danger">*</span></Form.Label>
                <InputGroup>
                  <Form.Control
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    name="data_amount"
                    value={packageData.data_amount}
                    onChange={handleChange}
                    placeholder="Enter data amount"
                  />
                  <Form.Select
                    name="data_unit"
                    value={packageData.data_unit}
                    onChange={handleSelectChange}
                    style={{ maxWidth: '80px' }}
                  >
                    <option value="MB">MB</option>
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Data amount is required
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="packageDuration">
                <Form.Label>Duration (Days) <span className="text-danger">*</span></Form.Label>
                <InputGroup>
                  <Form.Control
                    required
                    type="number"
                    min="1"
                    name="duration_days"
                    value={packageData.duration_days}
                    onChange={handleChange}
                    placeholder="Enter duration in days"
                  />
                  <InputGroup.Text>days</InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    Duration is required
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="packageStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="availability_status"
                  value={packageData.availability_status}
                  onChange={handleSelectChange}
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="coming_soon">Coming Soon</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="checkbox"
                id="isFeatured"
                label="Featured Package"
                name="is_featured"
                checked={packageData.is_featured}
                onChange={handleCheckboxChange}
              />
              <Form.Text className="text-muted">
                Featured packages appear prominently on the user app
              </Form.Text>
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                id="isPopular"
                label="Popular Package"
                name="is_popular"
                checked={packageData.is_popular}
                onChange={handleCheckboxChange}
              />
              <Form.Text className="text-muted">
                Popular packages are highlighted to users
              </Form.Text>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="packageBenefits">
                <Form.Label>Benefits (JSON Array)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="benefits"
                  value={packageData.benefits}
                  onChange={handleChange}
                  placeholder="Enter benefits as JSON array"
                />
                <Form.Text className="text-muted">
                  List the benefits of this package as a JSON array of strings
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
                {editPackage ? 'Update Package' : 'Save Package'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddPackageModal;
