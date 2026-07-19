"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddFeaturedSectionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (sectionData: any) => void;
  editSection?: any;
}

const AddFeaturedSectionModal: React.FC<AddFeaturedSectionModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editSection
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [sectionData, setSectionData] = useState({
    name: editSection?.name || '',
    subtitle: editSection?.subtitle || '',
    description: editSection?.description || '',
    icon: editSection?.icon || 'star',
    icon_type: editSection?.icon_type || 'Ionicons',
    bg_color: editSection?.bg_color || '#FFD700',
    navigation_screen: editSection?.navigation_screen || '',
    navigation_params: editSection?.navigation_params || JSON.stringify({}, null, 2),
    status: editSection?.status || 'active',
    order: editSection?.order || 1,
    feature_type: editSection?.feature_type || 'navigation',
    external_url: editSection?.external_url || '',
    requires_auth: editSection?.requires_auth || false,
    user_permissions: editSection?.user_permissions || JSON.stringify(['all'], null, 2),
    analytics_tracking: editSection?.analytics_tracking || true,
    custom_styling: editSection?.custom_styling || JSON.stringify({
      border_radius: "12px",
      padding: "16px",
      margin: "8px",
      shadow: true
    }, null, 2)
  });

  // Icon options for different types
  const iconOptions = {
    Ionicons: [
      { value: 'star', label: '⭐ Star' },
      { value: 'people', label: '👥 People' },
      { value: 'sparkles', label: '✨ Sparkles' },
      { value: 'camera', label: '📷 Camera' },
      { value: 'heart', label: '❤️ Heart' },
      { value: 'gift', label: '🎁 Gift' },
      { value: 'flash', label: '⚡ Flash' },
      { value: 'trophy', label: '🏆 Trophy' },
      { value: 'rocket', label: '🚀 Rocket' },
      { value: 'diamond', label: '💎 Diamond' }
    ],
    MaterialIcons: [
      { value: 'favorite', label: '❤️ Favorite' },
      { value: 'star_rate', label: '⭐ Star Rate' },
      { value: 'trending_up', label: '📈 Trending Up' },
      { value: 'local_fire_department', label: '🔥 Fire' },
      { value: 'new_releases', label: '🆕 New Releases' },
      { value: 'verified', label: '✅ Verified' }
    ],
    FontAwesome5: [
      { value: 'crown', label: '👑 Crown' },
      { value: 'gem', label: '💎 Gem' },
      { value: 'magic', label: '🪄 Magic' },
      { value: 'medal', label: '🏅 Medal' },
      { value: 'thumbs-up', label: '👍 Thumbs Up' }
    ]
  };

  // Color presets
  const colorPresets = [
    { name: 'Gold', color: '#FFD700' },
    { name: 'Purple', color: '#9370DB' },
    { name: 'Dark Purple', color: '#6B3AA0' },
    { name: 'Blue', color: '#4A90E2' },
    { name: 'Green', color: '#4CAF50' },
    { name: 'Orange', color: '#FF9800' },
    { name: 'Red', color: '#F44336' },
    { name: 'Pink', color: '#E91E63' },
    { name: 'Teal', color: '#009688' },
    { name: 'Indigo', color: '#3F51B5' }
  ];

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editSection) {
        setSectionData({
          name: editSection.name || '',
          subtitle: editSection.subtitle || '',
          description: editSection.description || '',
          icon: editSection.icon || 'star',
          icon_type: editSection.icon_type || 'Ionicons',
          bg_color: editSection.bg_color || '#FFD700',
          navigation_screen: editSection.navigation_screen || '',
          navigation_params: editSection.navigation_params || JSON.stringify({}, null, 2),
          status: editSection.status || 'active',
          order: editSection.order || 1,
          feature_type: editSection.feature_type || 'navigation',
          external_url: editSection.external_url || '',
          requires_auth: editSection.requires_auth || false,
          user_permissions: editSection.user_permissions || JSON.stringify(['all'], null, 2),
          analytics_tracking: editSection.analytics_tracking !== undefined ? editSection.analytics_tracking : true,
          custom_styling: editSection.custom_styling || JSON.stringify({
            border_radius: "12px",
            padding: "16px",
            margin: "8px",
            shadow: true
          }, null, 2)
        });
      } else {
        setSectionData({
          name: '',
          subtitle: '',
          description: '',
          icon: 'star',
          icon_type: 'Ionicons',
          bg_color: '#FFD700',
          navigation_screen: '',
          navigation_params: JSON.stringify({}, null, 2),
          status: 'active',
          order: 1,
          feature_type: 'navigation',
          external_url: '',
          requires_auth: false,
          user_permissions: JSON.stringify(['all'], null, 2),
          analytics_tracking: true,
          custom_styling: JSON.stringify({
            border_radius: "12px",
            padding: "16px",
            margin: "8px",
            shadow: true
          }, null, 2)
        });
      }
    }
  }, [show, editSection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSectionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSectionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSectionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyColorPreset = (color: string) => {
    setSectionData(prev => ({
      ...prev,
      bg_color: color
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
      let parsedNavigationParams, parsedUserPermissions, parsedCustomStyling;
      
      try {
        parsedNavigationParams = JSON.parse(sectionData.navigation_params);
      } catch (error) {
        alert('Invalid JSON format in Navigation Parameters');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedUserPermissions = JSON.parse(sectionData.user_permissions);
      } catch (error) {
        alert('Invalid JSON format in User Permissions');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedCustomStyling = JSON.parse(sectionData.custom_styling);
      } catch (error) {
        alert('Invalid JSON format in Custom Styling');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...sectionData,
        order: parseInt(sectionData.order as unknown as string, 10),
        navigation_params: parsedNavigationParams,
        user_permissions: parsedUserPermissions,
        custom_styling: parsedCustomStyling
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
          {editSection ? `Edit Featured Section: ${editSection.name}` : 'Add New Featured Section'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group controlId="sectionName">
                <Form.Label>Section Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={sectionData.name}
                  onChange={handleChange}
                  placeholder="e.g., Community Picks"
                />
                <Form.Control.Feedback type="invalid">
                  Section name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="sectionOrder">
                <Form.Label>Display Order</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="order"
                  value={sectionData.order}
                  onChange={handleChange}
                  placeholder="1"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="sectionSubtitle">
                <Form.Label>Subtitle <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="subtitle"
                  value={sectionData.subtitle}
                  onChange={handleChange}
                  placeholder="e.g., Top-rated by neighbors"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="sectionDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={sectionData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Detailed description of this featured section"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Visual Design</h6>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Label>Icon Preview</Form.Label>
              <div className="mb-2">
                <div 
                  className="d-inline-flex align-items-center justify-content-center text-white"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: sectionData.bg_color
                  }}
                >
                  <IconifyIcon icon="ri:star-line" size={24} />
                </div>
                <span className="ms-3 fw-bold">{sectionData.name || 'Section Name'}</span>
              </div>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="iconType">
                <Form.Label>Icon Library</Form.Label>
                <Form.Select
                  name="icon_type"
                  value={sectionData.icon_type}
                  onChange={handleSelectChange}
                >
                  <option value="Ionicons">Ionicons</option>
                  <option value="MaterialIcons">Material Icons</option>
                  <option value="FontAwesome5">FontAwesome 5</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group controlId="icon">
                <Form.Label>Icon</Form.Label>
                <Form.Select
                  name="icon"
                  value={sectionData.icon}
                  onChange={handleSelectChange}
                >
                  {iconOptions[sectionData.icon_type as keyof typeof iconOptions]?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="bgColor">
                <Form.Label>Background Color</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="color"
                    name="bg_color"
                    value={sectionData.bg_color}
                    onChange={handleChange}
                    style={{ width: '60px' }}
                  />
                  <Form.Control
                    type="text"
                    name="bg_color"
                    value={sectionData.bg_color}
                    onChange={handleChange}
                    placeholder="#FFD700"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Label>Color Presets</Form.Label>
              <div className="d-flex flex-wrap gap-1">
                {colorPresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => applyColorPreset(preset.color)}
                    style={{
                      backgroundColor: preset.color,
                      color: 'white',
                      border: 'none',
                      width: '40px',
                      height: '30px',
                      fontSize: '10px'
                    }}
                    title={preset.name}
                  >
                    {preset.name.substring(0, 2)}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Navigation & Behavior</h6>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="featureType">
                <Form.Label>Feature Type</Form.Label>
                <Form.Select
                  name="feature_type"
                  value={sectionData.feature_type}
                  onChange={handleSelectChange}
                >
                  <option value="navigation">Screen Navigation</option>
                  <option value="external_link">External Link</option>
                  <option value="modal">Open Modal</option>
                  <option value="action">Custom Action</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="sectionStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={sectionData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="coming_soon">Coming Soon</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {sectionData.feature_type === 'navigation' && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="navigationScreen">
                  <Form.Label>Navigation Screen <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required={sectionData.feature_type === 'navigation'}
                    type="text"
                    name="navigation_screen"
                    value={sectionData.navigation_screen}
                    onChange={handleChange}
                    placeholder="e.g., communityPicksScreen"
                  />
                  <Form.Text className="text-muted">
                    The screen name to navigate to when tapped
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          )}
          
          {sectionData.feature_type === 'external_link' && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="externalUrl">
                  <Form.Label>External URL <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <IconifyIcon icon="ri:link" />
                    </InputGroup.Text>
                    <Form.Control
                      required={sectionData.feature_type === 'external_link'}
                      type="url"
                      name="external_url"
                      value={sectionData.external_url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          )}
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="navigationParams">
                <Form.Label>Navigation Parameters (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="navigation_params"
                  value={sectionData.navigation_params}
                  onChange={handleTextAreaChange}
                  placeholder="Enter navigation parameters in JSON format"
                />
                <Form.Text className="text-muted">
                  Additional parameters to pass when navigating
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Access Control</h6>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="checkbox"
                id="requiresAuth"
                label="Requires Authentication"
                name="requires_auth"
                checked={sectionData.requires_auth}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                id="analyticsTracking"
                label="Enable Analytics Tracking"
                name="analytics_tracking"
                checked={sectionData.analytics_tracking}
                onChange={handleChange}
              />
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="userPermissions">
                <Form.Label>User Permissions (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="user_permissions"
                  value={sectionData.user_permissions}
                  onChange={handleTextAreaChange}
                  placeholder="Enter user permissions in JSON array format"
                />
                <Form.Text className="text-muted">
                  Define which user types can access this feature (for example, all, premium, new_users).
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h6>Custom Styling</h6>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="customStyling">
                <Form.Label>Custom Styling (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="custom_styling"
                  value={sectionData.custom_styling}
                  onChange={handleTextAreaChange}
                  placeholder="Enter custom styling properties in JSON format"
                />
                <Form.Text className="text-muted">
                  Define custom styling properties like border radius, padding, shadows, etc.
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
                {editSection ? 'Update Section' : 'Add Section'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddFeaturedSectionModal;
