"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Dropdown, 
  Modal,
  Row,
  Col
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id?: string;
  parent_name?: string;
  product_count: number;
  status: 'active' | 'inactive';
  display_order: number;
  created_at: string;
  updated_at: string;
}

const CategoryManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<MarketplaceCategory | null>(null);
  
  // Sample data - would be fetched from API in production
  const categories: MarketplaceCategory[] = [
    {
      id: 'CAT-001',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      image: '/assets/images/marketplace/categories/electronics.jpg',
      product_count: 124,
      status: 'active',
      display_order: 1,
      created_at: '10 Jan 2023',
      updated_at: '15 Mar 2023',
    },
    {
      id: 'CAT-002',
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      image: '/assets/images/marketplace/categories/smartphones.jpg',
      parent_id: 'CAT-001',
      parent_name: 'Electronics',
      product_count: 78,
      status: 'active',
      display_order: 1,
      created_at: '12 Jan 2023',
      updated_at: '18 Mar 2023',
    },
    {
      id: 'CAT-003',
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and accessories',
      image: '/assets/images/marketplace/categories/laptops.jpg',
      parent_id: 'CAT-001',
      parent_name: 'Electronics',
      product_count: 46,
      status: 'active',
      display_order: 2,
      created_at: '15 Jan 2023',
      updated_at: '20 Mar 2023',
    },
    {
      id: 'CAT-004',
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, shoes, and accessories',
      image: '/assets/images/marketplace/categories/fashion.jpg',
      product_count: 98,
      status: 'active',
      display_order: 2,
      created_at: '18 Jan 2023',
      updated_at: '22 Mar 2023',
    },
    {
      id: 'CAT-005',
      name: 'Men\'s Clothing',
      slug: 'mens-clothing',
      description: 'Clothing for men',
      image: '/assets/images/marketplace/categories/mens-clothing.jpg',
      parent_id: 'CAT-004',
      parent_name: 'Fashion',
      product_count: 42,
      status: 'active',
      display_order: 1,
      created_at: '20 Jan 2023',
      updated_at: '25 Mar 2023',
    },
    {
      id: 'CAT-006',
      name: 'Women\'s Clothing',
      slug: 'womens-clothing',
      description: 'Clothing for women',
      image: '/assets/images/marketplace/categories/womens-clothing.jpg',
      parent_id: 'CAT-004',
      parent_name: 'Fashion',
      product_count: 56,
      status: 'active',
      display_order: 2,
      created_at: '22 Jan 2023',
      updated_at: '28 Mar 2023',
    },
    {
      id: 'CAT-007',
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Home appliances and kitchen essentials',
      image: '/assets/images/marketplace/categories/home-kitchen.jpg',
      product_count: 87,
      status: 'active',
      display_order: 3,
      created_at: '25 Jan 2023',
      updated_at: '30 Mar 2023',
    },
    {
      id: 'CAT-008',
      name: 'Books',
      slug: 'books',
      description: 'Books, e-books, and audiobooks',
      image: '/assets/images/marketplace/categories/books.jpg',
      product_count: 65,
      status: 'inactive',
      display_order: 4,
      created_at: '28 Jan 2023',
      updated_at: '02 Apr 2023',
    },
  ];
  
  // Filter categories based on search term and status
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || category.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: MarketplaceCategory['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  // Handle category edit
  const handleEditCategory = (category: MarketplaceCategory) => {
    setCurrentCategory(category);
    setShowEditModal(true);
  };
  
  // Handle add new category
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setShowEditModal(true);
  };

  return (
    <>
      {/* Filters */}
      <div className="d-flex flex-wrap align-items-center mb-3">
        <div className="me-3 mb-2">
          <InputGroup>
            <Form.Control
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="secondary">
              <IconifyIcon icon="ri:search-line" />
            </Button>
          </InputGroup>
        </div>
        <div className="me-3 mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary">
              Status: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterStatus('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus('active')}>Active</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus('inactive')}>Inactive</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="ms-auto mb-2">
          <Button variant="primary" onClick={handleAddCategory}>
            <IconifyIcon icon="ri:add-line" className="me-1" />
            Add Category
          </Button>
        </div>
      </div>
      
      {/* Categories Table */}
      <div className="table-responsive">
        <Table className="table-centered table-hover mb-0">
          <thead>
            <tr>
              <th>Category</th>
              <th>Parent</th>
              <th>Products</th>
              <th>Display Order</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm me-2">
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="img-fluid rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="font-14 mb-0">{category.name}</h5>
                      <div className="text-muted font-13">
                        <span>{category.slug}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {category.parent_name ? (
                    <span>{category.parent_name}</span>
                  ) : (
                    <Badge bg="light" text="dark">Root Category</Badge>
                  )}
                </td>
                <td>{category.product_count}</td>
                <td>{category.display_order}</td>
                <td>
                  <Badge bg={getStatusBadgeVariant(category.status)}>
                    {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <div>{category.created_at}</div>
                  <small className="text-muted">Updated: {category.updated_at}</small>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEditCategory(category)}>
                        <IconifyIcon icon="ri:pencil-line" className="me-1" />
                        Edit Category
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Products
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:add-line" className="me-1" />
                        Add Subcategory
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Change Status</Dropdown.Header>
                      <Dropdown.Item 
                        className={category.status === 'active' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:check-line" className="me-1 text-success" />
                        Active
                      </Dropdown.Item>
                      <Dropdown.Item 
                        className={category.status === 'inactive' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:close-circle-line" className="me-1 text-danger" />
                        Inactive
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {/* Edit Category Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentCategory ? `Edit Category: ${currentCategory.name}` : 'Add New Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Basic Information */}
            <h5 className="mb-3">Basic Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control 
                type="text" 
                value={currentCategory?.name || ''}
                onChange={() => {}}
                placeholder="e.g. Electronics"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Slug</Form.Label>
              <Form.Control 
                type="text" 
                value={currentCategory?.slug || ''}
                onChange={() => {}}
                placeholder="e.g. electronics"
              />
              <Form.Text className="text-muted">
                URL-friendly version of the name. Used in category URLs.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={currentCategory?.description || ''}
                onChange={() => {}}
                placeholder="Brief description of the category"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Parent Category</Form.Label>
                  <Form.Select
                    value={currentCategory?.parent_id || ''}
                    onChange={() => {}}
                  >
                    <option value="">None (Root Category)</option>
                    {categories
                      .filter(cat => !cat.parent_id) // Only show root categories as potential parents
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    }
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={currentCategory?.status || 'active'}
                    onChange={() => {}}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Display Order</Form.Label>
              <Form.Control 
                type="number" 
                value={currentCategory?.display_order || '1'}
                onChange={() => {}}
                min="1"
              />
              <Form.Text className="text-muted">
                Determines the order in which categories are displayed. Lower numbers appear first.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category Image</Form.Label>
              <Form.Control type="file" />
              {currentCategory?.image && (
                <div className="mt-2">
                  <img 
                    src={currentCategory.image} 
                    alt={currentCategory.name} 
                    height="100" 
                    className="img-thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                    }}
                  />
                </div>
              )}
            </Form.Group>
            
            {/* SEO Information */}
            <h5 className="mb-3 mt-4">SEO Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Meta Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="SEO title for the category page"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Meta Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                placeholder="SEO description for the category page"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Meta Keywords</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Comma-separated keywords"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            {currentCategory ? 'Update Category' : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CategoryManagementTable;

