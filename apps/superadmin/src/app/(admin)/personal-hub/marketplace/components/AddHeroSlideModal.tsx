"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddHeroSlideModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (slideData: any) => void;
  editSlide?: any;
}

const AddHeroSlideModal: React.FC<AddHeroSlideModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editSlide
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [slideData, setSlideData] = useState({
    title: editSlide?.title || '',
    subtitle: editSlide?.subtitle || '',
    badge: editSlide?.badge || '',
    gradient_start: editSlide?.gradient_start || '#8B0000',
    gradient_end: editSlide?.gradient_end || '#DC143C',
    image_url: editSlide?.image_url || '',
    link_url: editSlide?.link_url || '',
    status: editSlide?.status || 'active',
    order: editSlide?.order || 1,
    start_date: editSlide?.start_date || '',
    end_date: editSlide?.end_date || '',
    target_audience: editSlide?.target_audience || 'all',
    cta_text: editSlide?.cta_text || 'Shop Now',
    auto_advance: editSlide?.auto_advance !== undefined ? editSlide.auto_advance : true,
    advance_delay: editSlide?.advance_delay || 4000
  });

  // Predefined gradient combinations
  const gradientPresets = [
    { name: 'Crimson Red', start: '#8B0000', end: '#DC143C' },
    { name: 'Ocean Blue', start: '#1B4F72', end: '#2E86C1' },
    { name: 'Forest Green', start: '#0B5345', end: '#239B56' },
    { name: 'Royal Purple', start: '#6B3AA0', end: '#9B59B6' },
    { name: 'Sunset Orange', start: '#D35400', end: '#E67E22' },
    { name: 'Rose Gold', start: '#E91E63', end: '#FF6B9D' },
    { name: 'Midnight Blue', start: '#2C3E50', end: '#3498DB' },
    { name: 'Emerald', start: '#16A085', end: '#48C9B0' }
  ];

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editSlide) {
        setSlideData({
          title: editSlide.title || '',
          subtitle: editSlide.subtitle || '',
          badge: editSlide.badge || '',
          gradient_start: editSlide.gradient_start || '#8B0000',
          gradient_end: editSlide.gradient_end || '#DC143C',
          image_url: editSlide.image_url || '',
          link_url: editSlide.link_url || '',
          status: editSlide.status || 'active',
          order: editSlide.order || 1,
          start_date: editSlide.start_date || '',
          end_date: editSlide.end_date || '',
          target_audience: editSlide.target_audience || 'all',
          cta_text: editSlide.cta_text || 'Shop Now',
          auto_advance: editSlide.auto_advance !== undefined ? editSlide.auto_advance : true,
          advance_delay: editSlide.advance_delay || 4000
        });
      } else {
        setSlideData({
          title: '',
          subtitle: '',
          badge: '',
          gradient_start: '#8B0000',
          gradient_end: '#DC143C',
          image_url: '',
          link_url: '',
          status: 'active',
          order: 1,
          start_date: '',
          end_date: '',
          target_audience: 'all',
          cta_text: 'Shop Now',
          auto_advance: true,
          advance_delay: 4000
        });
      }
    }
  }, [show, editSlide]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSlideData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSlideData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSlideData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyGradientPreset = (preset: any) => {
    setSlideData(prev => ({
      ...prev,
      gradient_start: preset.start,
      gradient_end: preset.end
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
        ...slideData,
        order: parseInt(slideData.order as unknown as string, 10),
        advance_delay: parseInt(slideData.advance_delay as unknown as string, 10)
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
          {editSlide ? `Edit Hero Slide: ${editSlide.title}` : 'Add New Hero Slide'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group controlId="slideTitle">
                <Form.Label>Slide Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="title"
                  value={slideData.title}
                  onChange={handleChange}
                  placeholder="e.g., Up your glow game"
                />
                <Form.Control.Feedback type="invalid">
                  Title is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="slideOrder">
                <Form.Label>Display Order</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="order"
                  value={slideData.order}
                  onChange={handleChange}
                  placeholder="1"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="slideSubtitle">
                <Form.Label>Subtitle <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="subtitle"
                  value={slideData.subtitle}
                  onChange={handleChange}
                  placeholder="e.g., Explore offers on self-care essentials"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="slideBadge">
                <Form.Label>Badge Text (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="badge"
                  value={slideData.badge}
                  onChange={handleChange}
                  placeholder="e.g., Ends Sunday, Limited Time"
                />
                <Form.Text className="text-muted">
                  Appears as a small badge on the slide
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="ctaText">
                <Form.Label>Call-to-Action Text</Form.Label>
                <Form.Control
                  type="text"
                  name="cta_text"
                  value={slideData.cta_text}
                  onChange={handleChange}
                  placeholder="Shop Now"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Visual Design</h6>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Label>Gradient Background</Form.Label>
              <div className="mb-2">
                <div 
                  className="p-3 rounded text-white text-center"
                  style={{
                    background: `linear-gradient(45deg, ${slideData.gradient_start}, ${slideData.gradient_end})`,
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  Preview: {slideData.title || 'Your Title Here'}
                </div>
              </div>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="gradientStart">
                <Form.Label>Start Color</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="color"
                    name="gradient_start"
                    value={slideData.gradient_start}
                    onChange={handleChange}
                    style={{ width: '60px' }}
                  />
                  <Form.Control
                    type="text"
                    name="gradient_start"
                    value={slideData.gradient_start}
                    onChange={handleChange}
                    placeholder="#8B0000"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="gradientEnd">
                <Form.Label>End Color</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="color"
                    name="gradient_end"
                    value={slideData.gradient_end}
                    onChange={handleChange}
                    style={{ width: '60px' }}
                  />
                  <Form.Control
                    type="text"
                    name="gradient_end"
                    value={slideData.gradient_end}
                    onChange={handleChange}
                    placeholder="#DC143C"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Label>Gradient Presets</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {gradientPresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => applyGradientPreset(preset)}
                    style={{
                      background: `linear-gradient(45deg, ${preset.start}, ${preset.end})`,
                      color: 'white',
                      border: 'none',
                      minWidth: '100px'
                    }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="imageUrl">
                <Form.Label>Background Image URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:image-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="image_url"
                    value={slideData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/hero-image.jpg"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Optional decorative image that appears on the slide
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Navigation & Behavior</h6>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="linkUrl">
                <Form.Label>Link URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:link" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="link_url"
                    value={slideData.link_url}
                    onChange={handleChange}
                    placeholder="https://example.com/promotion"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Where users go when they tap the slide
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="slideStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={slideData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="scheduled">Scheduled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="targetAudience">
                <Form.Label>Target Audience</Form.Label>
                <Form.Select
                  name="target_audience"
                  value={slideData.target_audience}
                  onChange={handleSelectChange}
                >
                  <option value="all">All Users</option>
                  <option value="new_customers">New Customers</option>
                  <option value="returning_customers">Returning Customers</option>
                  <option value="vip_customers">VIP Customers</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="startDate">
                <Form.Label>Start Date (Optional)</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="start_date"
                  value={slideData.start_date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="endDate">
                <Form.Label>End Date (Optional)</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="end_date"
                  value={slideData.end_date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Auto-Advance Settings</h6>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Check
                type="checkbox"
                id="autoAdvance"
                label="Enable auto-advance to next slide"
                name="auto_advance"
                checked={slideData.auto_advance}
                onChange={handleChange}
              />
            </Col>
          </Row>
          
          {slideData.auto_advance && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="advanceDelay">
                  <Form.Label>Auto-Advance Delay (ms)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1000"
                    max="10000"
                    step="500"
                    name="advance_delay"
                    value={slideData.advance_delay}
                    onChange={handleChange}
                    placeholder="4000"
                  />
                  <Form.Text className="text-muted">
                    Time in milliseconds before advancing to next slide (default: 4000ms = 4 seconds)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
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
                {editSlide ? 'Update Slide' : 'Add Slide'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddHeroSlideModal;
