"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface CreatePromotionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (promotionData: any) => void;
  editPromotion?: any;
}

const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editPromotion
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [promotionData, setPromotionData] = useState({
    name: editPromotion?.name || '',
    code: editPromotion?.code || '',
    description: editPromotion?.description || '',
    type: editPromotion?.type || 'percentage',
    value: editPromotion?.value || '',
    minimum_order_amount: editPromotion?.minimum_order_amount || '',
    maximum_discount_amount: editPromotion?.maximum_discount_amount || '',
    usage_limit: editPromotion?.usage_limit || '',
    usage_limit_per_customer: editPromotion?.usage_limit_per_customer || '',
    start_date: editPromotion?.start_date || '',
    end_date: editPromotion?.end_date || '',
    status: editPromotion?.status || 'active',
    applies_to: editPromotion?.applies_to || 'all',
    stackable: editPromotion?.stackable || false,
    first_time_customers_only: editPromotion?.first_time_customers_only || false,
    auto_apply: editPromotion?.auto_apply || false,
    featured: editPromotion?.featured || false,
    applicable_products: editPromotion?.applicable_products ? JSON.stringify(editPromotion.applicable_products, null, 2) : JSON.stringify([
      {
        product_id: "",
        product_name: ""
      }
    ], null, 2),
    applicable_categories: editPromotion?.applicable_categories ? JSON.stringify(editPromotion.applicable_categories, null, 2) : JSON.stringify([
      {
        category_id: "",
        category_name: ""
      }
    ], null, 2),
    customer_segments: editPromotion?.customer_segments ? JSON.stringify(editPromotion.customer_segments, null, 2) : JSON.stringify([
      {
        segment: "new_customers",
        description: "Customers who have never made a purchase"
      }
    ], null, 2),
    terms_conditions: editPromotion?.terms_conditions || ''
  });

  // Auto-generate code from name
  useEffect(() => {
    if (!editPromotion && promotionData.name && !promotionData.code) {
      const generatedCode = promotionData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '')
        .substring(0, 10) + Math.random().toString(36).substring(2, 5).toUpperCase();
      
      setPromotionData(prev => ({
        ...prev,
        code: generatedCode
      }));
    }
  }, [promotionData.name, editPromotion]);

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editPromotion) {
        setPromotionData({
          name: editPromotion.name || '',
          code: editPromotion.code || '',
          description: editPromotion.description || '',
          type: editPromotion.type || 'percentage',
          value: editPromotion.value || '',
          minimum_order_amount: editPromotion.minimum_order_amount || '',
          maximum_discount_amount: editPromotion.maximum_discount_amount || '',
          usage_limit: editPromotion.usage_limit || '',
          usage_limit_per_customer: editPromotion.usage_limit_per_customer || '',
          start_date: editPromotion.start_date || '',
          end_date: editPromotion.end_date || '',
          status: editPromotion.status || 'active',
          applies_to: editPromotion.applies_to || 'all',
          stackable: editPromotion.stackable || false,
          first_time_customers_only: editPromotion.first_time_customers_only || false,
          auto_apply: editPromotion.auto_apply || false,
          featured: editPromotion.featured || false,
          applicable_products: editPromotion.applicable_products ? JSON.stringify(editPromotion.applicable_products, null, 2) : JSON.stringify([
            {
              product_id: "",
              product_name: ""
            }
          ], null, 2),
          applicable_categories: editPromotion.applicable_categories ? JSON.stringify(editPromotion.applicable_categories, null, 2) : JSON.stringify([
            {
              category_id: "",
              category_name: ""
            }
          ], null, 2),
          customer_segments: editPromotion.customer_segments ? JSON.stringify(editPromotion.customer_segments, null, 2) : JSON.stringify([
            {
              segment: "new_customers",
              description: "Customers who have never made a purchase"
            }
          ], null, 2),
          terms_conditions: editPromotion.terms_conditions || ''
        });
      } else {
        setPromotionData({
          name: '',
          code: '',
          description: '',
          type: 'percentage',
          value: '',
          minimum_order_amount: '',
          maximum_discount_amount: '',
          usage_limit: '',
          usage_limit_per_customer: '1',
          start_date: '',
          end_date: '',
          status: 'active',
          applies_to: 'all',
          stackable: false,
          first_time_customers_only: false,
          auto_apply: false,
          featured: false,
          applicable_products: JSON.stringify([
            {
              product_id: "",
              product_name: ""
            }
          ], null, 2),
          applicable_categories: JSON.stringify([
            {
              category_id: "",
              category_name: ""
            }
          ], null, 2),
          customer_segments: JSON.stringify([
            {
              segment: "new_customers",
              description: "Customers who have never made a purchase"
            }
          ], null, 2),
          terms_conditions: ''
        });
      }
    }
  }, [show, editPromotion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPromotionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPromotionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPromotionData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPromotionData(prev => ({
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
      let parsedApplicableProducts, parsedApplicableCategories, parsedCustomerSegments;
      
      try {
        parsedApplicableProducts = JSON.parse(promotionData.applicable_products);
      } catch (error) {
        alert('Invalid JSON format in Applicable Products');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedApplicableCategories = JSON.parse(promotionData.applicable_categories);
      } catch (error) {
        alert('Invalid JSON format in Applicable Categories');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedCustomerSegments = JSON.parse(promotionData.customer_segments);
      } catch (error) {
        alert('Invalid JSON format in Customer Segments');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...promotionData,
        value: parseFloat(promotionData.value as unknown as string),
        minimum_order_amount: promotionData.minimum_order_amount ? parseFloat(promotionData.minimum_order_amount as unknown as string) : null,
        maximum_discount_amount: promotionData.maximum_discount_amount ? parseFloat(promotionData.maximum_discount_amount as unknown as string) : null,
        usage_limit: promotionData.usage_limit ? parseInt(promotionData.usage_limit as unknown as string, 10) : null,
        usage_limit_per_customer: promotionData.usage_limit_per_customer ? parseInt(promotionData.usage_limit_per_customer as unknown as string, 10) : null,
        applicable_products: parsedApplicableProducts,
        applicable_categories: parsedApplicableCategories,
        customer_segments: parsedCustomerSegments
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
          {editPromotion ? `Edit Promotion: ${editPromotion.name}` : 'Create New Promotion'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="promotionName">
                <Form.Label>Promotion Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={promotionData.name}
                  onChange={handleChange}
                  placeholder="Enter promotion name"
                />
                <Form.Control.Feedback type="invalid">
                  Promotion name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="promotionCode">
                <Form.Label>Promotion Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="code"
                  value={promotionData.code}
                  onChange={handleChange}
                  placeholder="Enter promotion code"
                />
                <Form.Text className="text-muted">
                  Unique code customers will use
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="promotionDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={promotionData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Enter promotion description"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="promotionType">
                <Form.Label>Discount Type <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  required
                  name="type"
                  value={promotionData.type}
                  onChange={handleSelectChange}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                  <option value="buy_x_get_y">Buy X Get Y</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="promotionValue">
                <Form.Label>Discount Value <span className="text-danger">*</span></Form.Label>
                <InputGroup>
                  <Form.Control
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    name="value"
                    value={promotionData.value}
                    onChange={handleChange}
                    placeholder="Enter value"
                  />
                  <InputGroup.Text>
                    {promotionData.type === 'percentage' ? '%' : '$'}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="promotionStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={promotionData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="startDate">
                <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="datetime-local"
                  name="start_date"
                  value={promotionData.start_date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="end_date"
                  value={promotionData.end_date}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Leave empty for no expiration
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="minimumOrderAmount">
                <Form.Label>Minimum Order Amount</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="minimum_order_amount"
                    value={promotionData.minimum_order_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="maximumDiscountAmount">
                <Form.Label>Maximum Discount Amount</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="maximum_discount_amount"
                    value={promotionData.maximum_discount_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Maximum discount for percentage-based promotions
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="usageLimit">
                <Form.Label>Total Usage Limit</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="usage_limit"
                  value={promotionData.usage_limit}
                  onChange={handleChange}
                  placeholder="Unlimited"
                />
                <Form.Text className="text-muted">
                  Total number of times this promotion can be used
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="usageLimitPerCustomer">
                <Form.Label>Usage Limit Per Customer</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="usage_limit_per_customer"
                  value={promotionData.usage_limit_per_customer}
                  onChange={handleChange}
                  placeholder="1"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="appliesTo">
                <Form.Label>Applies To</Form.Label>
                <Form.Select
                  name="applies_to"
                  value={promotionData.applies_to}
                  onChange={handleSelectChange}
                >
                  <option value="all">All Products</option>
                  <option value="specific_products">Specific Products</option>
                  <option value="specific_categories">Specific Categories</option>
                  <option value="minimum_amount">Minimum Order Amount</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Promotion Options</Form.Label>
                <div>
                  <Form.Check
                    type="checkbox"
                    id="stackable"
                    label="Can be combined with other promotions"
                    name="stackable"
                    checked={promotionData.stackable}
                    onChange={handleCheckboxChange}
                  />
                  <Form.Check
                    type="checkbox"
                    id="firstTimeCustomersOnly"
                    label="First-time customers only"
                    name="first_time_customers_only"
                    checked={promotionData.first_time_customers_only}
                    onChange={handleCheckboxChange}
                  />
                  <Form.Check
                    type="checkbox"
                    id="autoApply"
                    label="Auto-apply (no code required)"
                    name="auto_apply"
                    checked={promotionData.auto_apply}
                    onChange={handleCheckboxChange}
                  />
                  <Form.Check
                    type="checkbox"
                    id="featured"
                    label="Featured promotion"
                    name="featured"
                    checked={promotionData.featured}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          {promotionData.applies_to === 'specific_products' && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="applicableProducts">
                  <Form.Label>Applicable Products (JSON)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="applicable_products"
                    value={promotionData.applicable_products}
                    onChange={handleTextAreaChange}
                    placeholder="Enter applicable products in JSON format"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
          
          {promotionData.applies_to === 'specific_categories' && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="applicableCategories">
                  <Form.Label>Applicable Categories (JSON)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="applicable_categories"
                    value={promotionData.applicable_categories}
                    onChange={handleTextAreaChange}
                    placeholder="Enter applicable categories in JSON format"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="customerSegments">
                <Form.Label>Customer Segments (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="customer_segments"
                  value={promotionData.customer_segments}
                  onChange={handleTextAreaChange}
                  placeholder="Enter customer segments in JSON format"
                />
                <Form.Text className="text-muted">
                  Define which customer segments this promotion applies to
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="termsConditions">
                <Form.Label>Terms & Conditions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="terms_conditions"
                  value={promotionData.terms_conditions}
                  onChange={handleTextAreaChange}
                  placeholder="Enter terms and conditions"
                />
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
                {editPromotion ? 'Update Promotion' : 'Create Promotion'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreatePromotionModal;
