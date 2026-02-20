"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Tab, Nav } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface AddProductModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (productData: any) => void;
  editProduct?: any;
  categories?: any[];
  vendors?: any[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ 
  show, 
  onHide,
  onSave,
  editProduct,
  categories = [],
  vendors = []
}) => {
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [activeImageMode, setActiveImageMode] = useState<'upload' | 'json'>('upload');
  const [activeVariantMode, setActiveVariantMode] = useState<'form' | 'json'>('form');
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [formVariants, setFormVariants] = useState([
    {
      name: "Default",
      price: 0,
      sku: "",
      inventory: 0,
      attributes: {}
    }
  ]);
  
  // Form state
  const [productData, setProductData] = useState({
    name: editProduct?.name || '',
    slug: editProduct?.slug || '',
    description: editProduct?.description || '',
    short_description: editProduct?.short_description || '',
    category_id: editProduct?.category_id || '',
    vendor_id: editProduct?.vendor_id || '',
    sku: editProduct?.sku || '',
    barcode: editProduct?.barcode || '',
    price: editProduct?.price || '',
    compare_price: editProduct?.compare_price || '',
    cost_price: editProduct?.cost_price || '',
    track_inventory: editProduct?.track_inventory || true,
    inventory_quantity: editProduct?.inventory_quantity || '',
    low_stock_threshold: editProduct?.low_stock_threshold || '',
    weight: editProduct?.weight || '',
    dimensions: editProduct?.dimensions || '',
    status: editProduct?.status || 'active',
    visibility: editProduct?.visibility || 'public',
    featured: editProduct?.featured || false,
    digital_product: editProduct?.digital_product || false,
    requires_shipping: editProduct?.requires_shipping || true,
    tax_class: editProduct?.tax_class || 'standard',
    meta_title: editProduct?.meta_title || '',
    meta_description: editProduct?.meta_description || '',
    tags: editProduct?.tags ? editProduct.tags.join(', ') : '',
    images: editProduct?.images ? JSON.stringify(editProduct.images, null, 2) : JSON.stringify([
      {
        url: "",
        alt: "",
        is_primary: true
      }
    ], null, 2),
    variants: editProduct?.variants ? JSON.stringify(editProduct.variants, null, 2) : JSON.stringify([
      {
        name: "Default",
        price: 0,
        sku: "",
        inventory: 0,
        attributes: {}
      }
    ], null, 2),
    attributes: editProduct?.attributes ? JSON.stringify(editProduct.attributes, null, 2) : JSON.stringify({
      color: "",
      size: "",
      material: ""
    }, null, 2)
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!editProduct && productData.name && !productData.slug) {
      const generatedSlug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setProductData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [productData.name, editProduct]);

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (show) {
      setValidated(false);
      setActiveTab('basic');
      setActiveImageMode('upload');
      setActiveVariantMode('form');
      setUploadedImages([]);
      if (editProduct) {
        setProductData({
          name: editProduct.name || '',
          slug: editProduct.slug || '',
          description: editProduct.description || '',
          short_description: editProduct.short_description || '',
          category_id: editProduct.category_id || '',
          vendor_id: editProduct.vendor_id || '',
          sku: editProduct.sku || '',
          barcode: editProduct.barcode || '',
          price: editProduct.price || '',
          compare_price: editProduct.compare_price || '',
          cost_price: editProduct.cost_price || '',
          track_inventory: editProduct.track_inventory || true,
          inventory_quantity: editProduct.inventory_quantity || '',
          low_stock_threshold: editProduct.low_stock_threshold || '',
          weight: editProduct.weight || '',
          dimensions: editProduct.dimensions || '',
          status: editProduct.status || 'active',
          visibility: editProduct.visibility || 'public',
          featured: editProduct.featured || false,
          digital_product: editProduct.digital_product || false,
          requires_shipping: editProduct.requires_shipping || true,
          tax_class: editProduct.tax_class || 'standard',
          meta_title: editProduct.meta_title || '',
          meta_description: editProduct.meta_description || '',
          tags: editProduct.tags ? editProduct.tags.join(', ') : '',
          images: editProduct.images ? JSON.stringify(editProduct.images, null, 2) : JSON.stringify([
            {
              url: "",
              alt: "",
              is_primary: true
            }
          ], null, 2),
          variants: editProduct.variants ? JSON.stringify(editProduct.variants, null, 2) : JSON.stringify([
            {
              name: "Default",
              price: 0,
              sku: "",
              inventory: 0,
              attributes: {}
            }
          ], null, 2),
          attributes: editProduct.attributes ? JSON.stringify(editProduct.attributes, null, 2) : JSON.stringify({
            color: "",
            size: "",
            material: ""
          }, null, 2)
        });
        
        // Initialize form variants from edit data
        if (editProduct.variants) {
          try {
            const variants = typeof editProduct.variants === 'string' 
              ? JSON.parse(editProduct.variants) 
              : editProduct.variants;
            setFormVariants(variants);
          } catch (error) {
            console.error('Error parsing edit product variants:', error);
          }
        }
      } else {
        setProductData({
          name: '',
          slug: '',
          description: '',
          short_description: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          vendor_id: vendors.length > 0 ? vendors[0].id : '',
          sku: '',
          barcode: '',
          price: '',
          compare_price: '',
          cost_price: '',
          track_inventory: true,
          inventory_quantity: '0',
          low_stock_threshold: '5',
          weight: '',
          dimensions: '',
          status: 'active',
          visibility: 'public',
          featured: false,
          digital_product: false,
          requires_shipping: true,
          tax_class: 'standard',
          meta_title: '',
          meta_description: '',
          tags: '',
          images: JSON.stringify([
            {
              url: "",
              alt: "",
              is_primary: true
            }
          ], null, 2),
          variants: JSON.stringify([
            {
              name: "Default",
              price: 0,
              sku: "",
              inventory: 0,
              attributes: {}
            }
          ], null, 2),
          attributes: JSON.stringify({
            color: "",
            size: "",
            material: ""
          }, null, 2)
        });
        
        // Reset form variants for new product
        setFormVariants([
          {
            name: "Default",
            price: 0,
            sku: "",
            inventory: 0,
            attributes: {}
          }
        ]);
      }
    }
  }, [show, editProduct, categories, vendors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage = {
            file: file,
            preview: event.target?.result as string,
            name: file.name,
            size: file.size,
            url: '', // This would be set after upload to server
            alt: `Product image - ${file.name.split('.')[0]}`
          };
          
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Clear the input
    e.target.value = '';
  };

  // Remove uploaded image
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Variant management functions
  const addVariant = () => {
    setFormVariants(prev => [...prev, {
      name: "",
      price: 0,
      sku: "",
      inventory: 0,
      attributes: {}
    }]);
  };

  const removeVariant = (index: number) => {
    setFormVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
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
      // Parse JSON fields or use form data
      let parsedImages, parsedVariants, parsedAttributes;
      
      // Handle images - use uploaded images if in upload mode, otherwise parse JSON
      if (activeImageMode === 'upload' && uploadedImages.length > 0) {
        parsedImages = uploadedImages.map((image, index) => ({
          url: image.preview, // In production, this would be the uploaded URL
          alt: image.alt,
          is_primary: index === 0
        }));
      } else {
        try {
          parsedImages = JSON.parse(productData.images);
        } catch (error) {
          alert('Invalid JSON format in Images');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Handle variants - use form variants if in form mode, otherwise parse JSON
      if (activeVariantMode === 'form') {
        parsedVariants = formVariants;
      } else {
        try {
          parsedVariants = JSON.parse(productData.variants);
        } catch (error) {
          alert('Invalid JSON format in Variants');
          setIsSubmitting(false);
          return;
        }
      }
      
      try {
        parsedAttributes = JSON.parse(productData.attributes);
      } catch (error) {
        alert('Invalid JSON format in Attributes');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...productData,
        price: parseFloat(productData.price as unknown as string),
        compare_price: productData.compare_price ? parseFloat(productData.compare_price as unknown as string) : null,
        cost_price: productData.cost_price ? parseFloat(productData.cost_price as unknown as string) : null,
        inventory_quantity: productData.track_inventory ? parseInt(productData.inventory_quantity as unknown as string, 10) : null,
        low_stock_threshold: productData.track_inventory ? parseInt(productData.low_stock_threshold as unknown as string, 10) : null,
        weight: productData.weight ? parseFloat(productData.weight as unknown as string) : null,
        tags: productData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: parsedImages,
        variants: parsedVariants,
        attributes: parsedAttributes
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
      size="xl"
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editProduct ? `Edit Product: ${editProduct.name}` : 'Add New Product'}
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'basic')}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="basic">
                  <IconifyIcon icon="ri:information-line" className="me-1" />
                  Basic Info
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="pricing">
                  <IconifyIcon icon="ri:money-dollar-circle-line" className="me-1" />
                  Pricing & Inventory
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="shipping">
                  <IconifyIcon icon="ri:truck-line" className="me-1" />
                  Shipping & Attributes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="media">
                  <IconifyIcon icon="ri:image-2-line" className="me-1" />
                  Media & Variants
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="seo">
                  <IconifyIcon icon="ri:search-line" className="me-1" />
                  SEO & Settings
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Basic Info Tab */}
              <Tab.Pane eventKey="basic">
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="productName">
                      <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                      />
                      <Form.Control.Feedback type="invalid">
                        Product name is required
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="productSlug">
                      <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        required
                        type="text"
                        name="slug"
                        value={productData.slug}
                        onChange={handleChange}
                        placeholder="Enter product slug"
                      />
                      <Form.Text className="text-muted">
                        URL-friendly version of the name
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="category">
                      <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        required
                        name="category_id"
                        value={productData.category_id}
                        onChange={handleSelectChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="vendor">
                      <Form.Label>Vendor</Form.Label>
                      <Form.Select
                        name="vendor_id"
                        value={productData.vendor_id}
                        onChange={handleSelectChange}
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map(vendor => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="shortDescription">
                      <Form.Label>Short Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="short_description"
                        value={productData.short_description}
                        onChange={handleTextAreaChange}
                        placeholder="Enter short description"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="description">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="description"
                        value={productData.description}
                        onChange={handleTextAreaChange}
                        placeholder="Enter detailed product description"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Pricing & Inventory Tab */}
              <Tab.Pane eventKey="pricing">
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group controlId="price">
                      <Form.Label>Price <span className="text-danger">*</span></Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          required
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={productData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="comparePrice">
                      <Form.Label>Compare Price</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="compare_price"
                          value={productData.compare_price}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Original price for discount display
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="costPrice">
                      <Form.Label>Cost Price</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="cost_price"
                          value={productData.cost_price}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Your cost for this product
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="sku">
                      <Form.Label>SKU</Form.Label>
                      <Form.Control
                        type="text"
                        name="sku"
                        value={productData.sku}
                        onChange={handleChange}
                        placeholder="Enter SKU"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="barcode">
                      <Form.Label>Barcode</Form.Label>
                      <Form.Control
                        type="text"
                        name="barcode"
                        value={productData.barcode}
                        onChange={handleChange}
                        placeholder="Enter barcode"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Check
                      type="checkbox"
                      id="trackInventory"
                      label="Track inventory for this product"
                      name="track_inventory"
                      checked={productData.track_inventory}
                      onChange={handleCheckboxChange}
                    />
                  </Col>
                </Row>
                
                {productData.track_inventory && (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="inventoryQuantity">
                        <Form.Label>Inventory Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          name="inventory_quantity"
                          value={productData.inventory_quantity}
                          onChange={handleChange}
                          placeholder="0"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="lowStockThreshold">
                        <Form.Label>Low Stock Threshold</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          name="low_stock_threshold"
                          value={productData.low_stock_threshold}
                          onChange={handleChange}
                          placeholder="5"
                        />
                        <Form.Text className="text-muted">
                          Alert when stock falls below this number
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Tab.Pane>

              {/* Shipping & Attributes Tab */}
              <Tab.Pane eventKey="shipping">
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      id="digitalProduct"
                      label="This is a digital product"
                      name="digital_product"
                      checked={productData.digital_product}
                      onChange={handleCheckboxChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      id="requiresShipping"
                      label="This product requires shipping"
                      name="requires_shipping"
                      checked={productData.requires_shipping}
                      onChange={handleCheckboxChange}
                      disabled={productData.digital_product}
                    />
                  </Col>
                </Row>
                
                {productData.requires_shipping && !productData.digital_product && (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="weight">
                        <Form.Label>Weight (kg)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="weight"
                          value={productData.weight}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="dimensions">
                        <Form.Label>Dimensions (L x W x H cm)</Form.Label>
                        <Form.Control
                          type="text"
                          name="dimensions"
                          value={productData.dimensions}
                          onChange={handleChange}
                          placeholder="e.g. 10 x 5 x 2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="taxClass">
                      <Form.Label>Tax Class</Form.Label>
                      <Form.Select
                        name="tax_class"
                        value={productData.tax_class}
                        onChange={handleSelectChange}
                      >
                        <option value="standard">Standard</option>
                        <option value="reduced">Reduced Rate</option>
                        <option value="zero">Zero Rate</option>
                        <option value="exempt">Tax Exempt</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="tags">
                      <Form.Label>Tags</Form.Label>
                      <Form.Control
                        type="text"
                        name="tags"
                        value={productData.tags}
                        onChange={handleChange}
                        placeholder="Enter tags separated by commas"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="attributes">
                      <Form.Label>Product Attributes (JSON)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="attributes"
                        value={productData.attributes}
                        onChange={handleTextAreaChange}
                        placeholder="Enter product attributes in JSON format"
                      />
                      <Form.Text className="text-muted">
                        Define product attributes like color, size, material, etc.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Media & Variants Tab */}
              <Tab.Pane eventKey="media">
                <div className="alert alert-info">
                  <IconifyIcon icon="ri:information-line" className="me-1" />
                  You can either upload images directly or use JSON configuration for advanced settings.
                </div>

                {/* Product Images Section */}
                <h6 className="mb-3">Product Images</h6>
                <Row className="mb-3">
                  <Col md={12}>
                    <Nav variant="pills" className="mb-3">
                      <Nav.Item>
                        <Nav.Link 
                          active={activeImageMode === 'upload'} 
                          onClick={() => setActiveImageMode('upload')}
                          style={{ cursor: 'pointer' }}
                        >
                          <IconifyIcon icon="ri:upload-2-line" className="me-1" />
                          Upload Images
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link 
                          active={activeImageMode === 'json'} 
                          onClick={() => setActiveImageMode('json')}
                          style={{ cursor: 'pointer' }}
                        >
                          <IconifyIcon icon="ri:code-line" className="me-1" />
                          JSON Configuration
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>

                    {activeImageMode === 'upload' && (
                      <div>
                        <Form.Group controlId="imageUpload" className="mb-3">
                          <Form.Label>Upload Product Images</Form.Label>
                          <Form.Control
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                          <Form.Text className="text-muted">
                            Select multiple images. First image will be the primary image.
                          </Form.Text>
                        </Form.Group>

                        {/* Image Preview */}
                        {uploadedImages.length > 0 && (
                          <div className="mb-3">
                            <Form.Label>Image Previews</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                              {uploadedImages.map((image, index) => (
                                <div key={index} className="position-relative">
                                  <img
                                    src={image.preview}
                                    alt={`Product ${index + 1}`}
                                    style={{
                                      width: '100px',
                                      height: '100px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      border: index === 0 ? '2px solid #0d6efd' : '1px solid #dee2e6'
                                    }}
                                  />
                                  {index === 0 && (
                                    <div 
                                      className="position-absolute top-0 start-0 bg-primary text-white px-1"
                                      style={{ fontSize: '10px', borderRadius: '0 0 4px 0' }}
                                    >
                                      Primary
                                    </div>
                                  )}
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="position-absolute top-0 end-0"
                                    style={{ padding: '2px 6px', fontSize: '10px' }}
                                    onClick={() => removeUploadedImage(index)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Form.Text className="text-muted">
                              Blue border indicates primary image. Click × to remove images.
                            </Form.Text>
                          </div>
                        )}
                      </div>
                    )}

                    {activeImageMode === 'json' && (
                      <Form.Group controlId="images">
                        <Form.Label>Product Images (JSON)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={8}
                          name="images"
                          value={productData.images}
                          onChange={handleTextAreaChange}
                          placeholder="Enter product images in JSON format"
                        />
                        <Form.Text className="text-muted">
                          Define product images with URLs and alt text
                        </Form.Text>
                      </Form.Group>
                    )}
                  </Col>
                </Row>

                <hr className="my-4" />

                {/* Product Variants Section */}
                <h6 className="mb-3">Product Variants</h6>
                <Row className="mb-3">
                  <Col md={12}>
                    <Nav variant="pills" className="mb-3">
                      <Nav.Item>
                        <Nav.Link 
                          active={activeVariantMode === 'form'} 
                          onClick={() => setActiveVariantMode('form')}
                          style={{ cursor: 'pointer' }}
                        >
                          <IconifyIcon icon="ri:list-check" className="me-1" />
                          Form Builder
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link 
                          active={activeVariantMode === 'json'} 
                          onClick={() => setActiveVariantMode('json')}
                          style={{ cursor: 'pointer' }}
                        >
                          <IconifyIcon icon="ri:code-line" className="me-1" />
                          JSON Configuration
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>

                    {activeVariantMode === 'form' && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Product Variants</span>
                          <Button variant="outline-primary" size="sm" onClick={addVariant}>
                            <IconifyIcon icon="ri:add-line" className="me-1" />
                            Add Variant
                          </Button>
                        </div>

                        {formVariants.map((variant, index) => (
                          <div key={index} className="border rounded p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0">Variant {index + 1}</h6>
                              {formVariants.length > 1 && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeVariant(index)}
                                >
                                  <IconifyIcon icon="ri:delete-bin-line" />
                                </Button>
                              )}
                            </div>

                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Variant Name</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={variant.name}
                                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                    placeholder="e.g., Small, Red, Cotton"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Price ($)</Form.Label>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={variant.price}
                                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group className="mb-2">
                                  <Form.Label>SKU</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={variant.sku}
                                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                    placeholder="SKU-001"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>

                            <Row>
                              <Col md={4}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Inventory</Form.Label>
                                  <Form.Control
                                    type="number"
                                    min="0"
                                    value={variant.inventory}
                                    onChange={(e) => updateVariant(index, 'inventory', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={8}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Attributes (JSON)</Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={JSON.stringify(variant.attributes, null, 2)}
                                    onChange={(e) => {
                                      try {
                                        const attrs = JSON.parse(e.target.value);
                                        updateVariant(index, 'attributes', attrs);
                                      } catch (error) {
                                        // Handle invalid JSON gracefully
                                      }
                                    }}
                                    placeholder='{"color": "red", "size": "M"}'
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeVariantMode === 'json' && (
                      <Form.Group controlId="variants">
                        <Form.Label>Product Variants (JSON)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={8}
                          name="variants"
                          value={productData.variants}
                          onChange={handleTextAreaChange}
                          placeholder="Enter product variants in JSON format"
                        />
                        <Form.Text className="text-muted">
                          Define product variants with different prices and attributes
                        </Form.Text>
                      </Form.Group>
                    )}
                  </Col>
                </Row>
              </Tab.Pane>

              {/* SEO & Settings Tab */}
              <Tab.Pane eventKey="seo">
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="status">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={productData.status}
                        onChange={handleSelectChange}
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="visibility">
                      <Form.Label>Visibility</Form.Label>
                      <Form.Select
                        name="visibility"
                        value={productData.visibility}
                        onChange={handleSelectChange}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="hidden">Hidden</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Check
                      type="checkbox"
                      id="featured"
                      label="Featured product (display prominently)"
                      name="featured"
                      checked={productData.featured}
                      onChange={handleCheckboxChange}
                    />
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="metaTitle">
                      <Form.Label>Meta Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="meta_title"
                        value={productData.meta_title}
                        onChange={handleChange}
                        placeholder="Enter meta title"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="metaDescription">
                      <Form.Label>Meta Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="meta_description"
                        value={productData.meta_description}
                        onChange={handleTextAreaChange}
                        placeholder="Enter meta description"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
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
                {editProduct ? 'Update Product' : 'Save Product'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
