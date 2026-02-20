"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddVendorModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (vendorData: any) => void;
  editVendor?: any;
}

const AddVendorModal: React.FC<AddVendorModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editVendor
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [vendorData, setVendorData] = useState({
    name: editVendor?.name || '',
    slug: editVendor?.slug || '',
    email: editVendor?.email || '',
    phone: editVendor?.phone || '',
    website: editVendor?.website || '',
    logo_url: editVendor?.logo_url || '',
    banner_url: editVendor?.banner_url || '',
    description: editVendor?.description || '',
    business_type: editVendor?.business_type || 'individual',
    tax_id: editVendor?.tax_id || '',
    registration_number: editVendor?.registration_number || '',
    commission_rate: editVendor?.commission_rate || 0,
    status: editVendor?.status || 'active',
    featured: editVendor?.featured || false,
    address: editVendor?.address ? JSON.stringify(editVendor.address, null, 2) : JSON.stringify({
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: ""
    }, null, 2),
    bank_details: editVendor?.bank_details ? JSON.stringify(editVendor.bank_details, null, 2) : JSON.stringify({
      bank_name: "",
      account_name: "",
      account_number: "",
      routing_number: "",
      swift_code: ""
    }, null, 2),
    social_links: editVendor?.social_links ? JSON.stringify(editVendor.social_links, null, 2) : JSON.stringify({
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: ""
    }, null, 2),
    shipping_policies: editVendor?.shipping_policies || '',
    return_policies: editVendor?.return_policies || '',
    terms_conditions: editVendor?.terms_conditions || ''
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!editVendor && vendorData.name && !vendorData.slug) {
      const generatedSlug = vendorData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setVendorData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [vendorData.name, editVendor]);

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editVendor) {
        setVendorData({
          name: editVendor.name || '',
          slug: editVendor.slug || '',
          email: editVendor.email || '',
          phone: editVendor.phone || '',
          website: editVendor.website || '',
          logo_url: editVendor.logo_url || '',
          banner_url: editVendor.banner_url || '',
          description: editVendor.description || '',
          business_type: editVendor.business_type || 'individual',
          tax_id: editVendor.tax_id || '',
          registration_number: editVendor.registration_number || '',
          commission_rate: editVendor.commission_rate || 0,
          status: editVendor.status || 'active',
          featured: editVendor.featured || false,
          address: editVendor.address ? JSON.stringify(editVendor.address, null, 2) : JSON.stringify({
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country: ""
          }, null, 2),
          bank_details: editVendor.bank_details ? JSON.stringify(editVendor.bank_details, null, 2) : JSON.stringify({
            bank_name: "",
            account_name: "",
            account_number: "",
            routing_number: "",
            swift_code: ""
          }, null, 2),
          social_links: editVendor.social_links ? JSON.stringify(editVendor.social_links, null, 2) : JSON.stringify({
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: ""
          }, null, 2),
          shipping_policies: editVendor.shipping_policies || '',
          return_policies: editVendor.return_policies || '',
          terms_conditions: editVendor.terms_conditions || ''
        });
      } else {
        setVendorData({
          name: '',
          slug: '',
          email: '',
          phone: '',
          website: '',
          logo_url: '',
          banner_url: '',
          description: '',
          business_type: 'individual',
          tax_id: '',
          registration_number: '',
          commission_rate: 5,
          status: 'active',
          featured: false,
          address: JSON.stringify({
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country: ""
          }, null, 2),
          bank_details: JSON.stringify({
            bank_name: "",
            account_name: "",
            account_number: "",
            routing_number: "",
            swift_code: ""
          }, null, 2),
          social_links: JSON.stringify({
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: ""
          }, null, 2),
          shipping_policies: '',
          return_policies: '',
          terms_conditions: ''
        });
      }
    }
  }, [show, editVendor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVendorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setVendorData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVendorData(prev => ({
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
      let parsedAddress, parsedBankDetails, parsedSocialLinks;
      
      try {
        parsedAddress = JSON.parse(vendorData.address);
      } catch (error) {
        alert('Invalid JSON format in Address');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedBankDetails = JSON.parse(vendorData.bank_details);
      } catch (error) {
        alert('Invalid JSON format in Bank Details');
        setIsSubmitting(false);
        return;
      }
      
      try {
        parsedSocialLinks = JSON.parse(vendorData.social_links);
      } catch (error) {
        alert('Invalid JSON format in Social Links');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...vendorData,
        commission_rate: parseFloat(vendorData.commission_rate as unknown as string),
        address: parsedAddress,
        bank_details: parsedBankDetails,
        social_links: parsedSocialLinks
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
          {editVendor ? `Edit Vendor: ${editVendor.name}` : 'Add New Vendor'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="vendorName">
                <Form.Label>Vendor Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={vendorData.name}
                  onChange={handleChange}
                  placeholder="Enter vendor name"
                />
                <Form.Control.Feedback type="invalid">
                  Vendor name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="vendorSlug">
                <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="slug"
                  value={vendorData.slug}
                  onChange={handleChange}
                  placeholder="Enter vendor slug"
                />
                <Form.Text className="text-muted">
                  URL-friendly version of the name
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="vendorEmail">
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:mail-line" />
                  </InputGroup.Text>
                  <Form.Control
                    required
                    type="email"
                    name="email"
                    value={vendorData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="vendorPhone">
                <Form.Label>Phone</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:phone-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={vendorData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="vendorWebsite">
                <Form.Label>Website</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:global-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="website"
                    value={vendorData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="vendorDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={vendorData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Enter vendor description"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="businessType">
                <Form.Label>Business Type</Form.Label>
                <Form.Select
                  name="business_type"
                  value={vendorData.business_type}
                  onChange={handleSelectChange}
                >
                  <option value="individual">Individual</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="non_profit">Non-Profit</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="vendorStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={vendorData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending Approval</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="taxId">
                <Form.Label>Tax ID / EIN</Form.Label>
                <Form.Control
                  type="text"
                  name="tax_id"
                  value={vendorData.tax_id}
                  onChange={handleChange}
                  placeholder="Enter tax ID"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="registrationNumber">
                <Form.Label>Business Registration Number</Form.Label>
                <Form.Control
                  type="text"
                  name="registration_number"
                  value={vendorData.registration_number}
                  onChange={handleChange}
                  placeholder="Enter registration number"
                />
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
                    value={vendorData.commission_rate}
                    onChange={handleChange}
                    placeholder="Enter commission rate"
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
                <Form.Text className="text-muted">
                  Commission rate for this vendor's products
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vendor Features</Form.Label>
                <div>
                  <Form.Check
                    type="checkbox"
                    id="featuredVendor"
                    label="Featured vendor (display prominently)"
                    name="featured"
                    checked={vendorData.featured}
                    onChange={handleCheckboxChange}
                  />
                </div>
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
                    value={vendorData.logo_url}
                    onChange={handleChange}
                    placeholder="Enter logo URL"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="bannerUrl">
                <Form.Label>Banner URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:image-edit-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="banner_url"
                    value={vendorData.banner_url}
                    onChange={handleChange}
                    placeholder="Enter banner URL"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h5>Address Information</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="address">
                <Form.Label>Address (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="address"
                  value={vendorData.address}
                  onChange={handleTextAreaChange}
                  placeholder="Enter address in JSON format"
                />
                <Form.Text className="text-muted">
                  Define address information in JSON format
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h5>Banking Information</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="bankDetails">
                <Form.Label>Bank Details (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="bank_details"
                  value={vendorData.bank_details}
                  onChange={handleTextAreaChange}
                  placeholder="Enter bank details in JSON format"
                />
                <Form.Text className="text-muted">
                  Define banking information in JSON format
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h5>Social Media & Policies</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="socialLinks">
                <Form.Label>Social Media Links (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="social_links"
                  value={vendorData.social_links}
                  onChange={handleTextAreaChange}
                  placeholder="Enter social media links in JSON format"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="shippingPolicies">
                <Form.Label>Shipping Policies</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="shipping_policies"
                  value={vendorData.shipping_policies}
                  onChange={handleTextAreaChange}
                  placeholder="Enter shipping policies"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="returnPolicies">
                <Form.Label>Return Policies</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="return_policies"
                  value={vendorData.return_policies}
                  onChange={handleTextAreaChange}
                  placeholder="Enter return policies"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="termsConditions">
                <Form.Label>Terms & Conditions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="terms_conditions"
                  value={vendorData.terms_conditions}
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
                {editVendor ? 'Update Vendor' : 'Save Vendor'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddVendorModal;
