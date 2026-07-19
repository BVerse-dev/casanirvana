'use client';

import { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

import type { MarketplaceVendorView } from '@/hooks/useMarketplaceWorkspace';

type VendorFormValues = {
  store_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  logo_url: string;
  banner_url: string;
  is_active: boolean;
  is_verified: boolean;
};

interface AddVendorModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (vendorData: {
    store_name: string;
    owner_name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    description?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    is_active?: boolean | null;
    is_verified?: boolean | null;
  }) => Promise<void> | void;
  editVendor?: MarketplaceVendorView | null;
}

const defaultValues: VendorFormValues = {
  store_name: '',
  owner_name: '',
  email: '',
  phone: '',
  address: '',
  description: '',
  logo_url: '',
  banner_url: '',
  is_active: true,
  is_verified: false,
};

const AddVendorModal = ({ show, onHide, onSave, editVendor }: AddVendorModalProps) => {
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<VendorFormValues>(defaultValues);

  useEffect(() => {
    if (!show) {
      return;
    }

    if (editVendor) {
      setFormValues({
        store_name: editVendor.store_name,
        owner_name: editVendor.owner_name || '',
        email: editVendor.email || '',
        phone: editVendor.phone || '',
        address: editVendor.address || '',
        description: editVendor.description || '',
        logo_url: editVendor.logo_url || '',
        banner_url: editVendor.banner_url || '',
        is_active: Boolean(editVendor.is_active),
        is_verified: Boolean(editVendor.is_verified),
      });
      return;
    }

    setFormValues(defaultValues);
    setValidated(false);
  }, [editVendor, show]);

  const handleChange = (field: keyof VendorFormValues, value: string | boolean) => {
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
        store_name: formValues.store_name,
        owner_name: formValues.owner_name || null,
        email: formValues.email || null,
        phone: formValues.phone || null,
        address: formValues.address || null,
        description: formValues.description || null,
        logo_url: formValues.logo_url || null,
        banner_url: formValues.banner_url || null,
        is_active: formValues.is_active,
        is_verified: formValues.is_verified,
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
          <Modal.Title>{editVendor ? 'Edit Vendor' : 'Add Vendor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Store Name</Form.Label>
                <Form.Control
                  required
                  value={formValues.store_name}
                  onChange={(event) => handleChange('store_name', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Owner Name</Form.Label>
                <Form.Control
                  value={formValues.owner_name}
                  onChange={(event) => handleChange('owner_name', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formValues.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  value={formValues.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  value={formValues.address}
                  onChange={(event) => handleChange('address', event.target.value)}
                />
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
            <Col md={6}>
              <Form.Group>
                <Form.Label>Logo URL</Form.Label>
                <Form.Control
                  value={formValues.logo_url}
                  onChange={(event) => handleChange('logo_url', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Banner URL</Form.Label>
                <Form.Control
                  value={formValues.banner_url}
                  onChange={(event) => handleChange('banner_url', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="vendor-is-active"
                label="Vendor is active"
                checked={formValues.is_active}
                onChange={(event) => handleChange('is_active', event.target.checked)}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="vendor-is-verified"
                label="Vendor is verified"
                checked={formValues.is_verified}
                onChange={(event) => handleChange('is_verified', event.target.checked)}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={submitting}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editVendor ? 'Save Changes' : 'Create Vendor'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddVendorModal;
