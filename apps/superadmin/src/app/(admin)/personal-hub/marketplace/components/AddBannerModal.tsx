"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddBannerModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (bannerData: any) => void;
  editBanner?: any;
}

const AddBannerModal: React.FC<AddBannerModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editBanner
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [bannerData, setBannerData] = useState({
    name: editBanner?.name || '',
    description: editBanner?.description || '',
    type: editBanner?.type || 'promotional',
    position: editBanner?.position || 'top-banner',
    image_url: editBanner?.image_url || '',
    mobile_image_url: editBanner?.mobile_image_url || '',
    link_url: editBanner?.link_url || '',
    link_target: editBanner?.link_target || '_self',
    status: editBanner?.status || 'active',
    priority: editBanner?.priority || 1,
    start_date: editBanner?.start_date || '',
    end_date: editBanner?.end_date || '',
    target_audience: editBanner?.target_audience || 'all',
    display_conditions: editBanner?.display_conditions || JSON.stringify({
      min_screen_width: null,
      max_screen_width: null,
      device_types: ["mobile", "tablet", "desktop"],
      user_segments: ["all"]
    }, null, 2),
    tracking_params: editBanner?.tracking_params || JSON.stringify({
      utm_source: "marketplace",
      utm_medium: "banner",
      utm_campaign: "",
      custom_params: {}
    }, null, 2),
    alt_text: editBanner?.alt_text || '',
    click_action: editBanner?.click_action || 'navigate'
  });

  // Banner position options
  const positionOptions = [
    { value: 'top-banner', label: 'Top Banner (Header)' },
    { value: 'hero-overlay', label: 'Hero Section Overlay' },
    { value: 'category-header', label: 'Category Page Header' },
    { value: 'between-sections', label: 'Between Product Sections' },
    { value: 'sidebar', label: 'Sidebar Banner' },
    { value: 'footer-banner', label: 'Footer Banner' },
    { value: 'floating', label: 'Floating Banner' },
    { value: 'popup', label: 'Popup/Modal Banner' }
  ];

  // Banner types
  const typeOptions = [
    { value: 'promotional', label: 'Promotional' },
    { value: 'category', label: 'Category Banner' },
    { value: 'brand', label: 'Brand Advertisement' },
    { value: 'seasonal', label: 'Seasonal/Holiday' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'feature', label: 'Feature Highlight' }
  ];

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editBanner) {
        setBannerData({
          name: editBanner.name || '',
          description: editBanner.description || '',
          type: editBanner.type || 'promotional',
          position: editBanner.position || 'top-banner',
          image_url: editBanner.image_url || '',
          mobile_image_url: editBanner.mobile_image_url || '',
          link_url: editBanner.link_url || '',
          link_target: editBanner.link_target || '_self',
          status: editBanner.status || 'active',
          priority: editBanner.priority || 1,
          start_date: editBanner.start_date || '',
          end_date: editBanner.end_date || '',
          target_audience: editBanner.target_audience || 'all',
          display_conditions: editBanner.display_conditions || JSON.stringify({
            min_screen_width: null,
            max_screen_width: null,
            device_types: ["mobile", "tablet", "desktop"],
            user_segments: ["all"]
          }, null, 2),
          tracking_params: editBanner.tracking_params || JSON.stringify({
            utm_source: "marketplace",
            utm_medium: "banner",
            utm_campaign: "",
            custom_params: {}
          }, null, 2),
          alt_text: editBanner.alt_text || '',
          click_action: editBanner.click_action || 'navigate'
        });
      } else {
        setBannerData({
          name: '',
          description: '',
          type: 'promotional',
          position: 'top-banner',
          image_url: '',
          mobile_image_url: '',
          link_url: '',
          link_target: '_self',
          status: 'active',
          priority: 1,
          start_date: '',
          end_date: '',
          target_audience: 'all',
          display_conditions: JSON.stringify({
            min_screen_width: null,
            max_screen_width: null,
            device_types: ["mobile", "tablet", "desktop"],
            user_segments: ["all"]
          }, null, 2),
          tracking_params: JSON.stringify({
            utm_source: "marketplace",
            utm_medium: "banner",
            utm_campaign: "",
            custom_params: {}
          }, null, 2),
          alt_text: '',
          click_action: 'navigate'
        });
      }
    }
  }, [show, editBanner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBannerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBannerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBannerData(prev => ({
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
      let parsedDisplayConditions, parsedTrackingParams;
      
      try {
        parsedDisplayConditions = JSON.parse(bannerData.display_conditions);
      } catch (error) {
        alert('Invalid JSON format in Display Conditions');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedTrackingParams = JSON.parse(bannerData.tracking_params);
      } catch (error) {
        alert('Invalid JSON format in Tracking Parameters');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...bannerData,
        priority: parseInt(bannerData.priority as unknown as string, 10),
        display_conditions: parsedDisplayConditions,
        tracking_params: parsedTrackingParams
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
          {editBanner ? `Edit Banner: ${editBanner.name}` : 'Add New Banner'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group controlId="bannerName">
                <Form.Label>Banner Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={bannerData.name}
                  onChange={handleChange}
                  placeholder="e.g., Summer Sale Banner"
                />
                <Form.Control.Feedback type="invalid">
                  Banner name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="bannerPriority">
                <Form.Label>Priority</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="100"
                  name="priority"
                  value={bannerData.priority}
                  onChange={handleChange}
                  placeholder="1"
                />
                <Form.Text className="text-muted">
                  Higher numbers = higher priority
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="bannerDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={bannerData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Brief description of this banner"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="bannerType">
                <Form.Label>Banner Type <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  required
                  name="type"
                  value={bannerData.type}
                  onChange={handleSelectChange}
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="bannerPosition">
                <Form.Label>Display Position <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  required
                  name="position"
                  value={bannerData.position}
                  onChange={handleSelectChange}
                >
                  {positionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Images & Media</h6>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="imageUrl">
                <Form.Label>Desktop Image URL <span className="text-danger">*</span></Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:image-line" />
                  </InputGroup.Text>
                  <Form.Control
                    required
                    type="url"
                    name="image_url"
                    value={bannerData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/banner-desktop.jpg"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Recommended size: 1200x300px for top banners
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="mobileImageUrl">
                <Form.Label>Mobile Image URL (Optional)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:smartphone-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="mobile_image_url"
                    value={bannerData.mobile_image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/banner-mobile.jpg"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  If not provided, desktop image will be used. Recommended size: 400x200px
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="altText">
                <Form.Label>Alt Text <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="alt_text"
                  value={bannerData.alt_text}
                  onChange={handleChange}
                  placeholder="Descriptive text for screen readers and SEO"
                />
                <Form.Text className="text-muted">
                  Important for accessibility and SEO
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Link & Interaction</h6>
          
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group controlId="linkUrl">
                <Form.Label>Link URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:link" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="link_url"
                    value={bannerData.link_url}
                    onChange={handleChange}
                    placeholder="https://example.com/promotion"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Where users go when they click the banner
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="linkTarget">
                <Form.Label>Link Target</Form.Label>
                <Form.Select
                  name="link_target"
                  value={bannerData.link_target}
                  onChange={handleSelectChange}
                >
                  <option value="_self">Same Window</option>
                  <option value="_blank">New Window/Tab</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="clickAction">
                <Form.Label>Click Action</Form.Label>
                <Form.Select
                  name="click_action"
                  value={bannerData.click_action}
                  onChange={handleSelectChange}
                >
                  <option value="navigate">Navigate to URL</option>
                  <option value="modal">Open Modal</option>
                  <option value="none">No Action</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="targetAudience">
                <Form.Label>Target Audience</Form.Label>
                <Form.Select
                  name="target_audience"
                  value={bannerData.target_audience}
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
          
          <hr className="my-4" />
          <h6>Schedule & Status</h6>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="bannerStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={bannerData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="startDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="start_date"
                  value={bannerData.start_date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="end_date"
                  value={bannerData.end_date}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Leave empty for no expiration
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Advanced Settings</h6>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="displayConditions">
                <Form.Label>Display Conditions (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  name="display_conditions"
                  value={bannerData.display_conditions}
                  onChange={handleTextAreaChange}
                  placeholder="Enter display conditions in JSON format"
                />
                <Form.Text className="text-muted">
                  Define device types, screen sizes, and user segments for targeted display
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="trackingParams">
                <Form.Label>Tracking Parameters (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="tracking_params"
                  value={bannerData.tracking_params}
                  onChange={handleTextAreaChange}
                  placeholder="Enter tracking parameters in JSON format"
                />
                <Form.Text className="text-muted">
                  UTM parameters and custom tracking data for analytics
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
                {editBanner ? 'Update Banner' : 'Add Banner'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddBannerModal;
