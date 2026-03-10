'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

import type { MarketplaceCategoryView, MarketplaceProductView, MarketplaceVendorView } from '@/hooks/useMarketplaceWorkspace';

type ProductFormValues = {
  name: string;
  description: string;
  category_id: string;
  vendor_id: string;
  sku: string;
  price: string;
  original_price: string;
  stock_quantity: string;
  country_of_origin: string;
  primary_image: string;
  is_imported: boolean;
  is_featured: boolean;
  is_active: boolean;
};

interface AddProductModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (productData: {
    name: string;
    description?: string | null;
    category_id?: string | null;
    vendor_id?: string | null;
    sku?: string | null;
    price: number;
    original_price?: number | null;
    stock_quantity?: number | null;
    country_of_origin?: string | null;
    images?: string[] | null;
    is_imported?: boolean | null;
    is_featured?: boolean | null;
    is_active?: boolean | null;
  }) => Promise<void> | void;
  editProduct?: MarketplaceProductView | null;
  categories?: MarketplaceCategoryView[];
  vendors?: MarketplaceVendorView[];
}

const AddProductModal = ({ show, onHide, onSave, editProduct, categories = [], vendors = [] }: AddProductModalProps) => {
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<ProductFormValues>({
    name: '',
    description: '',
    category_id: '',
    vendor_id: '',
    sku: '',
    price: '',
    original_price: '',
    stock_quantity: '0',
    country_of_origin: '',
    primary_image: '',
    is_imported: false,
    is_featured: false,
    is_active: true,
  });

  const defaultCategoryId = useMemo(() => categories[0]?.id || '', [categories]);
  const defaultVendorId = useMemo(() => vendors[0]?.id || '', [vendors]);

  useEffect(() => {
    if (!show) {
      return;
    }

    if (editProduct) {
      setFormValues({
        name: editProduct.name,
        description: editProduct.description || '',
        category_id: editProduct.category_id || '',
        vendor_id: editProduct.vendor_id || '',
        sku: editProduct.sku || '',
        price: String(editProduct.price || ''),
        original_price: editProduct.original_price ? String(editProduct.original_price) : '',
        stock_quantity: String(editProduct.stock_quantity || 0),
        country_of_origin: editProduct.country_of_origin || '',
        primary_image: editProduct.images?.[0] || '',
        is_imported: Boolean(editProduct.is_imported),
        is_featured: Boolean(editProduct.is_featured),
        is_active: Boolean(editProduct.is_active),
      });
      return;
    }

    setFormValues({
      name: '',
      description: '',
      category_id: defaultCategoryId,
      vendor_id: defaultVendorId,
      sku: '',
      price: '',
      original_price: '',
      stock_quantity: '0',
      country_of_origin: '',
      primary_image: '',
      is_imported: false,
      is_featured: false,
      is_active: true,
    });
    setValidated(false);
  }, [defaultCategoryId, defaultVendorId, editProduct, show]);

  const handleChange = (field: keyof ProductFormValues, value: string | boolean) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        name: formValues.name,
        description: formValues.description || null,
        category_id: formValues.category_id || null,
        vendor_id: formValues.vendor_id || null,
        sku: formValues.sku || null,
        price: Number(formValues.price),
        original_price: formValues.original_price ? Number(formValues.original_price) : null,
        stock_quantity: Number(formValues.stock_quantity || 0),
        country_of_origin: formValues.country_of_origin || null,
        images: formValues.primary_image ? [formValues.primary_image] : null,
        is_imported: formValues.is_imported,
        is_featured: formValues.is_featured,
        is_active: formValues.is_active,
      });
      onHide();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{editProduct ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  required
                  value={formValues.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  value={formValues.sku}
                  onChange={(event) => handleChange('sku', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formValues.category_id}
                  onChange={(event) => handleChange('category_id', event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Vendor</Form.Label>
                <Form.Select
                  value={formValues.vendor_id}
                  onChange={(event) => handleChange('vendor_id', event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.store_name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formValues.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Price</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={formValues.price}
                  onChange={(event) => handleChange('price', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Original Price</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  value={formValues.original_price}
                  onChange={(event) => handleChange('original_price', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Stock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={formValues.stock_quantity}
                  onChange={(event) => handleChange('stock_quantity', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Country of Origin</Form.Label>
                <Form.Control
                  value={formValues.country_of_origin}
                  onChange={(event) => handleChange('country_of_origin', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Primary Image URL</Form.Label>
                <Form.Control
                  value={formValues.primary_image}
                  onChange={(event) => handleChange('primary_image', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Check
                type="switch"
                id="product-is-active"
                label="Active"
                checked={formValues.is_active}
                onChange={(event) => handleChange('is_active', event.target.checked)}
              />
            </Col>
            <Col md={4}>
              <Form.Check
                type="switch"
                id="product-is-featured"
                label="Featured"
                checked={formValues.is_featured}
                onChange={(event) => handleChange('is_featured', event.target.checked)}
              />
            </Col>
            <Col md={4}>
              <Form.Check
                type="switch"
                id="product-is-imported"
                label="Imported"
                checked={formValues.is_imported}
                onChange={(event) => handleChange('is_imported', event.target.checked)}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={submitting}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
