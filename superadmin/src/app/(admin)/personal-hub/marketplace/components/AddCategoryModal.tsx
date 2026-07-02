'use client';

import { useEffect, useState } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';

import type { MarketplaceCategoryView } from '@/hooks/useMarketplaceWorkspace';

type CategoryFormValues = {
  name: string;
  description: string;
  icon_name: string;
  background_colors: string;
  category_type: string;
  display_order: number;
  is_active: boolean;
};

interface AddCategoryModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (categoryData: CategoryFormValues) => Promise<void> | void;
  editCategory?: MarketplaceCategoryView | null;
}

const defaultValues: CategoryFormValues = {
  name: '',
  description: '',
  icon_name: '',
  background_colors: '',
  category_type: 'local',
  display_order: 0,
  is_active: true,
};

const AddCategoryModal = ({ show, onHide, onSave, editCategory }: AddCategoryModalProps) => {
  const [formValues, setFormValues] = useState<CategoryFormValues>(defaultValues);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) {
      return;
    }

    if (editCategory) {
      setFormValues({
        name: editCategory.name,
        description: editCategory.description || '',
        icon_name: editCategory.icon_name || '',
        background_colors: editCategory.background_colors || '',
        category_type: editCategory.category_type || 'local',
        display_order: editCategory.display_order || 0,
        is_active: Boolean(editCategory.is_active),
      });
      return;
    }

    setFormValues(defaultValues);
    setValidated(false);
  }, [editCategory, show]);

  const handleChange = (field: keyof CategoryFormValues, value: string | number | boolean) => {
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
      await onSave(formValues);
      onHide();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{editCategory ? 'Edit Category' : 'Add Category'}</Modal.Title>
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
                <Form.Label>Display Order</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={formValues.display_order}
                  onChange={(event) => handleChange('display_order', Number(event.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category Type</Form.Label>
                <Form.Select
                  value={formValues.category_type}
                  onChange={(event) => handleChange('category_type', event.target.value)}
                >
                  <option value="local">Local</option>
                  <option value="imported">Imported</option>
                  <option value="featured">Featured</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Icon Name</Form.Label>
                <Form.Control
                  placeholder="ri:shopping-bag-3-line"
                  value={formValues.icon_name}
                  onChange={(event) => handleChange('icon_name', event.target.value)}
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
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Background Colors</Form.Label>
                <Form.Control
                  placeholder="#F3F4F6, #E5E7EB"
                  value={formValues.background_colors}
                  onChange={(event) => handleChange('background_colors', event.target.value)}
                />
                <Form.Text className="text-muted">
                  Optional comma-separated palette used by the marketplace UI.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="category-is-active"
                label="Category is active"
                checked={formValues.is_active}
                onChange={(event) => handleChange('is_active', event.target.checked)}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editCategory ? 'Save Changes' : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
