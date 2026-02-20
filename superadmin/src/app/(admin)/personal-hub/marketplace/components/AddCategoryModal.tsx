"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddCategoryModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (categoryData: any) => void;
  editCategory?: any;
  parentCategories?: any[];
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editCategory,
  parentCategories = []
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [categoryData, setCategoryData] = useState({
    name: editCategory?.name || '',
    slug: editCategory?.slug || '',
    description: editCategory?.description || '',
    parent_id: editCategory?.parent_id || '',
    icon: editCategory?.icon || '',
    image_url: editCategory?.image_url || '',
    banner_url: editCategory?.banner_url || '',
    meta_title: editCategory?.meta_title || '',
    meta_description: editCategory?.meta_description || '',
    display_order: editCategory?.display_order || 0,
    is_featured: editCategory?.is_featured || false,
    status: editCategory?.status || 'active',
    attributes: editCategory?.attributes ? JSON.stringify(editCategory.attributes, null, 2) : JSON.stringify([
      {
        name: "Color",
        type: "select",
        required: false,
        options: ["Red", "Blue", "Green", "Black", "White"]
      },
      {
        name: "Size",
        type: "select",
        required: false,
        options: ["S", "M", "L", "XL", "XXL"]
      }
    ], null, 2)
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!editCategory && categoryData.name && !categoryData.slug) {
      const generatedSlug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setCategoryData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [categoryData.name, editCategory]);

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      if (editCategory) {
        setCategoryData({
          name: editCategory.name || '',
          slug: editCategory.slug || '',
          description: editCategory.description || '',
          parent_id: editCategory.parent_id || '',
          icon: editCategory.icon || '',
          image_url: editCategory.image_url || '',
          banner_url: editCategory.banner_url || '',
          meta_title: editCategory.meta_title || '',
          meta_description: editCategory.meta_description || '',
          display_order: editCategory.display_order || 0,
          is_featured: editCategory.is_featured || false,
          status: editCategory.status || 'active',
          attributes: editCategory.attributes ? JSON.stringify(editCategory.attributes, null, 2) : JSON.stringify([
            {
              name: "Color",
              type: "select",
              required: false,
              options: ["Red", "Blue", "Green", "Black", "White"]
            },
            {
              name: "Size",
              type: "select",
              required: false,
              options: ["S", "M", "L", "XL", "XXL"]
            }
          ], null, 2)
        });
      } else {
        setCategoryData({
          name: '',
          slug: '',
          description: '',
          parent_id: '',
          icon: '',
          image_url: '',
          banner_url: '',
          meta_title: '',
          meta_description: '',
          display_order: 0,
          is_featured: false,
          status: 'active',
          attributes: JSON.stringify([
            {
              name: "Color",
              type: "select",
              required: false,
              options: ["Red", "Blue", "Green", "Black", "White"]
            },
            {
              name: "Size",
              type: "select",
              required: false,
              options: ["S", "M", "L", "XL", "XXL"]
            }
          ], null, 2)
        });
      }
    }
  }, [show, editCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
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
      let parsedAttributes;
      
      try {
        parsedAttributes = JSON.parse(categoryData.attributes);
      } catch (error) {
        alert('Invalid JSON format in Attributes');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...categoryData,
        attributes: parsedAttributes,
        display_order: parseInt(categoryData.display_order as unknown as string, 10)
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
          {editCategory ? `Edit Category: ${editCategory.name}` : 'Add New Category'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="categoryName">
                <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={categoryData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                />
                <Form.Control.Feedback type="invalid">
                  Category name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="categorySlug">
                <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="slug"
                  value={categoryData.slug}
                  onChange={handleChange}
                  placeholder="Enter category slug"
                />
                <Form.Text className="text-muted">
                  URL-friendly version of the name (auto-generated)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="categoryDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={categoryData.description}
                  onChange={handleTextAreaChange}
                  placeholder="Enter category description"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="parentCategory">
                <Form.Label>Parent Category</Form.Label>
                <Form.Select
                  name="parent_id"
                  value={categoryData.parent_id}
                  onChange={handleSelectChange}
                >
                  <option value="">None (Top Level Category)</option>
                  {parentCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Select a parent category if this is a subcategory
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="categoryStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={categoryData.status}
                  onChange={handleSelectChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="categoryIcon">
                <Form.Label>Icon</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:image-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="icon"
                    value={categoryData.icon}
                    onChange={handleChange}
                    placeholder="e.g. ri:t-shirt-line"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Iconify icon name or custom icon URL
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="displayOrder">
                <Form.Label>Display Order</Form.Label>
                <Form.Control
                  type="number"
                  name="display_order"
                  value={categoryData.display_order}
                  onChange={handleNumberChange}
                  min="0"
                  placeholder="0"
                />
                <Form.Text className="text-muted">
                  Order in which category appears (lower numbers first)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="imageUrl">
                <Form.Label>Category Image URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:image-2-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="image_url"
                    value={categoryData.image_url}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  URL for the category thumbnail image
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="bannerUrl">
                <Form.Label>Banner Image URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:image-edit-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    name="banner_url"
                    value={categoryData.banner_url}
                    onChange={handleChange}
                    placeholder="Enter banner URL"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  URL for the category banner image (displayed at top of category page)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Check
                type="checkbox"
                id="isFeatured"
                label="Featured Category (display prominently on homepage)"
                name="is_featured"
                checked={categoryData.is_featured}
                onChange={handleCheckboxChange}
              />
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h5>SEO Settings</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="metaTitle">
                <Form.Label>Meta Title</Form.Label>
                <Form.Control
                  type="text"
                  name="meta_title"
                  value={categoryData.meta_title}
                  onChange={handleChange}
                  placeholder="Enter meta title"
                />
                <Form.Text className="text-muted">
                  Title used for SEO purposes (defaults to category name if empty)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="metaDescription">
                <Form.Label>Meta Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="meta_description"
                  value={categoryData.meta_description}
                  onChange={handleTextAreaChange}
                  placeholder="Enter meta description"
                />
                <Form.Text className="text-muted">
                  Description used for SEO purposes
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <hr className="my-4" />
          <h5>Category Attributes</h5>
          
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="attributes">
                <Form.Label>Product Attributes (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  name="attributes"
                  value={categoryData.attributes}
                  onChange={handleTextAreaChange}
                  placeholder="Enter attributes in JSON format"
                />
                <Form.Text className="text-muted">
                  Define product attributes for this category in JSON format
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="alert alert-info">
            <h6 className="alert-heading">Attributes Format Example</h6>
            <p className="mb-0">Define attributes that products in this category can have:</p>
            <pre className="mb-0" style={{ fontSize: '0.8rem' }}>
{`[
  {
    "name": "Color",
    "type": "select",
    "required": false,
    "options": ["Red", "Blue", "Green", "Black", "White"]
  },
  {
    "name": "Size",
    "type": "select",
    "required": false,
    "options": ["S", "M", "L", "XL", "XXL"]
  },
  {
    "name": "Material",
    "type": "text",
    "required": false
  }
]`}
            </pre>
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
                {editCategory ? 'Update Category' : 'Save Category'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
