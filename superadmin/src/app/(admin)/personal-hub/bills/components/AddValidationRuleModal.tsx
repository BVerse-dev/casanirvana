"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddValidationRuleModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (ruleData: any) => void;
  editRule?: any;
  billers?: any[];
}

const AddValidationRuleModal: React.FC<AddValidationRuleModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editRule,
  billers = []
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [ruleData, setRuleData] = useState({
    name: editRule?.name || '',
    description: editRule?.description || '',
    biller_id: editRule?.biller_id || '',
    field_name: editRule?.field_name || '',
    validation_type: editRule?.validation_type || 'regex',
    regex_pattern: editRule?.regex_pattern || '',
    min_length: editRule?.min_length || '',
    max_length: editRule?.max_length || '',
    min_value: editRule?.min_value || '',
    max_value: editRule?.max_value || '',
    error_message: editRule?.error_message || '',
    is_required: editRule?.is_required || true,
    status: editRule?.status || 'active',
    validation_options: editRule?.validation_options ? JSON.stringify(editRule.validation_options, null, 2) : JSON.stringify({
      allowed_values: [],
      format: "",
      custom_validation: ""
    }, null, 2)
  });

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editRule) {
        setRuleData({
          name: editRule.name || '',
          description: editRule.description || '',
          biller_id: editRule.biller_id || '',
          field_name: editRule.field_name || '',
          validation_type: editRule.validation_type || 'regex',
          regex_pattern: editRule.regex_pattern || '',
          min_length: editRule.min_length || '',
          max_length: editRule.max_length || '',
          min_value: editRule.min_value || '',
          max_value: editRule.max_value || '',
          error_message: editRule.error_message || '',
          is_required: editRule.is_required || true,
          status: editRule.status || 'active',
          validation_options: editRule.validation_options ? JSON.stringify(editRule.validation_options, null, 2) : JSON.stringify({
            allowed_values: [],
            format: "",
            custom_validation: ""
          }, null, 2)
        });
      } else {
        setRuleData({
          name: '',
          description: '',
          biller_id: billers.length > 0 ? billers[0].id : '',
          field_name: '',
          validation_type: 'regex',
          regex_pattern: '',
          min_length: '',
          max_length: '',
          min_value: '',
          max_value: '',
          error_message: '',
          is_required: true,
          status: 'active',
          validation_options: JSON.stringify({
            allowed_values: [],
            format: "",
            custom_validation: ""
          }, null, 2)
        });
      }
    }
  }, [show, editRule, billers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRuleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRuleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setRuleData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRuleData(prev => ({
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
      let parsedValidationOptions;
      
      try {
        parsedValidationOptions = JSON.parse(ruleData.validation_options);
      } catch (error) {
        alert('Invalid JSON format in Validation Options');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...ruleData,
        min_length: ruleData.min_length ? parseInt(ruleData.min_length as unknown as string, 10) : null,
        max_length: ruleData.max_length ? parseInt(ruleData.max_length as unknown as string, 10) : null,
        min_value: ruleData.min_value ? parseFloat(ruleData.min_value as unknown as string) : null,
        max_value: ruleData.max_value ? parseFloat(ruleData.max_value as unknown as string) : null,
        validation_options: parsedValidationOptions
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

  // Helper function to render validation type specific fields
  const renderValidationFields = () => {
    switch (ruleData.validation_type) {
      case 'regex':
        return (
          <Form.Group controlId="regexPattern">
            <Form.Label>Regex Pattern <span className="text-danger">*</span></Form.Label>
            <Form.Control
              required={ruleData.validation_type === 'regex'}
              type="text"
              name="regex_pattern"
              value={ruleData.regex_pattern}
              onChange={handleChange}
              placeholder="e.g. ^[0-9]{10}$"
            />
            <Form.Text className="text-muted">
              Regular expression pattern for validation
            </Form.Text>
          </Form.Group>
        );
      case 'length':
        return (
          <Row>
            <Col md={6}>
              <Form.Group controlId="minLength">
                <Form.Label>Minimum Length</Form.Label>
                <Form.Control
                  type="number"
                  name="min_length"
                  value={ruleData.min_length}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="maxLength">
                <Form.Label>Maximum Length</Form.Label>
                <Form.Control
                  type="number"
                  name="max_length"
                  value={ruleData.max_length}
                  onChange={handleChange}
                  min="1"
                  placeholder="255"
                />
              </Form.Group>
            </Col>
          </Row>
        );
      case 'range':
        return (
          <Row>
            <Col md={6}>
              <Form.Group controlId="minValue">
                <Form.Label>Minimum Value</Form.Label>
                <Form.Control
                  type="number"
                  name="min_value"
                  value={ruleData.min_value}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="maxValue">
                <Form.Label>Maximum Value</Form.Label>
                <Form.Control
                  type="number"
                  name="max_value"
                  value={ruleData.max_value}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="1000"
                />
              </Form.Group>
            </Col>
          </Row>
        );
      case 'options':
        return (
          <Form.Group controlId="validationOptions">
            <Form.Label>Validation Options (JSON) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              required={ruleData.validation_type === 'options'}
              as="textarea"
              rows={5}
              name="validation_options"
              value={ruleData.validation_options}
              onChange={handleTextAreaChange}
              placeholder="Enter validation options in JSON format"
            />
            <Form.Text className="text-muted">
              Define allowed values and other validation options in JSON format
            </Form.Text>
          </Form.Group>
        );
      case 'format':
        return (
          <Form.Group controlId="validationOptions">
            <Form.Label>Format Options (JSON) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              required={ruleData.validation_type === 'format'}
              as="textarea"
              rows={5}
              name="validation_options"
              value={ruleData.validation_options}
              onChange={handleTextAreaChange}
              placeholder="Enter format options in JSON format"
            />
            <Form.Text className="text-muted">
              Define format validation options in JSON format (e.g. email, phone, date)
            </Form.Text>
          </Form.Group>
        );
      case 'custom':
        return (
          <Form.Group controlId="validationOptions">
            <Form.Label>Custom Validation (JSON) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              required={ruleData.validation_type === 'custom'}
              as="textarea"
              rows={5}
              name="validation_options"
              value={ruleData.validation_options}
              onChange={handleTextAreaChange}
              placeholder="Enter custom validation logic in JSON format"
            />
            <Form.Text className="text-muted">
              Define custom validation logic in JSON format
            </Form.Text>
          </Form.Group>
        );
      default:
        return null;
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
          {editRule ? `Edit Validation Rule: ${editRule.name}` : 'Add Validation Rule'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="ruleName">
                <Form.Label>Rule Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={ruleData.name}
                  onChange={handleChange}
                  placeholder="Enter rule name"
                />
                <Form.Control.Feedback type="invalid">
                  Rule name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="ruleStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={ruleData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="testing">Testing</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="ruleDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={ruleData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Enter rule description"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="billerId">
                <Form.Label>Biller</Form.Label>
                <Form.Select
                  name="biller_id"
                  value={ruleData.biller_id}
                  onChange={handleSelectChange}
                >
                  <option value="">All Billers</option>
                  {billers.map(biller => (
                    <option key={biller.id} value={biller.id}>
                      {biller.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Leave empty to apply to all billers
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="fieldName">
                <Form.Label>Field Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="field_name"
                  value={ruleData.field_name}
                  onChange={handleChange}
                  placeholder="e.g. account_number"
                />
                <Form.Control.Feedback type="invalid">
                  Field name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="validationType">
                <Form.Label>Validation Type <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  required
                  name="validation_type"
                  value={ruleData.validation_type}
                  onChange={handleSelectChange}
                >
                  <option value="regex">Regular Expression</option>
                  <option value="length">Length Validation</option>
                  <option value="range">Range Validation</option>
                  <option value="options">Options Validation</option>
                  <option value="format">Format Validation</option>
                  <option value="custom">Custom Validation</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Required Field</Form.Label>
                <div className="d-flex flex-column">
                  <Form.Check
                    type="checkbox"
                    id="isRequired"
                    label="Field is required"
                    name="is_required"
                    checked={ruleData.is_required}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              {renderValidationFields()}
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="errorMessage">
                <Form.Label>Error Message <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="error_message"
                  value={ruleData.error_message}
                  onChange={handleChange}
                  placeholder="e.g. Please enter a valid account number"
                />
                <Form.Control.Feedback type="invalid">
                  Error message is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="alert alert-info">
            <h5 className="alert-heading">Validation Type Examples</h5>
            <p className="mb-0">Different validation types require different configurations:</p>
            <hr />
            <ul className="mb-0">
              <li><strong>Regular Expression:</strong> <code>^[0-9]{10}$</code> - Validates a 10-digit number</li>
              <li><strong>Length Validation:</strong> Min length 8, Max length 20 - Validates text length</li>
              <li><strong>Range Validation:</strong> Min value 10, Max value 1000 - Validates numeric range</li>
              <li><strong>Options Validation:</strong> JSON with allowed values array</li>
              <li><strong>Format Validation:</strong> Predefined formats like email, phone, date</li>
              <li><strong>Custom Validation:</strong> Custom validation logic defined in JSON</li>
            </ul>
          </div>
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
                {editRule ? 'Update Rule' : 'Save Rule'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddValidationRuleModal;
