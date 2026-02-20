"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Dropdown, 
  Row,
  Col,
  Card,
  Modal
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ProductDetailsModal from './ProductDetailsModal';

interface MarketplaceProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: string;
  sale_price?: string;
  category: {
    id: string;
    name: string;
  };
  vendor?: {
    id: string;
    name: string;
    logo?: string;
  };
  stock: number;
  sku: string;
  status: 'active' | 'draft' | 'out_of_stock' | 'archived';
  featured: boolean;
  rating: number;
  reviews_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

interface ProductManagementTableProps {
  showFilters?: boolean;
  limit?: number;
  sortBy?: 'newest' | 'sales' | 'rating';
}

const ProductManagementTable = ({ showFilters = false, limit, sortBy = 'newest' }: ProductManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<MarketplaceProduct | null>(null);
  
  // Sample data - would be fetched from API in production
  const products: MarketplaceProduct[] = [
    {
      id: 'PRD-001',
      name: 'iPhone 13 Pro Max',
      slug: 'iphone-13-pro-max',
      description: 'Apple iPhone 13 Pro Max with A15 Bionic chip, 6.7" Super Retina XDR display, and Pro camera system',
      images: ['/assets/images/marketplace/products/iphone-13.jpg'],
      price: '$1,099.00',
      category: {
        id: 'CAT-002',
        name: 'Smartphones',
      },
      vendor: {
        id: 'VEN-001',
        name: 'Apple',
        logo: '/assets/images/marketplace/vendors/apple.png',
      },
      stock: 45,
      sku: 'APPL-IP13PM-128',
      status: 'active',
      featured: true,
      rating: 4.8,
      reviews_count: 124,
      sales_count: 256,
      created_at: '10 Jan 2023',
      updated_at: '15 Mar 2023',
    },
    {
      id: 'PRD-002',
      name: 'Samsung Galaxy S22 Ultra',
      slug: 'samsung-galaxy-s22-ultra',
      description: 'Samsung Galaxy S22 Ultra with Snapdragon 8 Gen 1, 6.8" Dynamic AMOLED display, and 108MP camera',
      images: ['/assets/images/marketplace/products/galaxy-s22.jpg'],
      price: '$1,199.00',
      sale_price: '$1,099.00',
      category: {
        id: 'CAT-002',
        name: 'Smartphones',
      },
      vendor: {
        id: 'VEN-002',
        name: 'Samsung',
        logo: '/assets/images/marketplace/vendors/samsung.png',
      },
      stock: 32,
      sku: 'SMSNG-S22U-256',
      status: 'active',
      featured: true,
      rating: 4.7,
      reviews_count: 98,
      sales_count: 187,
      created_at: '15 Jan 2023',
      updated_at: '18 Mar 2023',
    },
    {
      id: 'PRD-003',
      name: 'MacBook Pro 14-inch',
      slug: 'macbook-pro-14-inch',
      description: 'Apple MacBook Pro 14-inch with M1 Pro chip, 16GB RAM, and 512GB SSD',
      images: ['/assets/images/marketplace/products/macbook-pro.jpg'],
      price: '$1,999.00',
      category: {
        id: 'CAT-003',
        name: 'Laptops',
      },
      vendor: {
        id: 'VEN-001',
        name: 'Apple',
        logo: '/assets/images/marketplace/vendors/apple.png',
      },
      stock: 18,
      sku: 'APPL-MBP14-512',
      status: 'active',
      featured: true,
      rating: 4.9,
      reviews_count: 76,
      sales_count: 145,
      created_at: '20 Jan 2023',
      updated_at: '22 Mar 2023',
    },
    {
      id: 'PRD-004',
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'Nike Air Max 270 running shoes with Air unit in heel and breathable mesh upper',
      images: ['/assets/images/marketplace/products/nike-air-max.jpg'],
      price: '$150.00',
      category: {
        id: 'CAT-005',
        name: 'Men\'s Clothing',
      },
      vendor: {
        id: 'VEN-003',
        name: 'Nike',
        logo: '/assets/images/marketplace/vendors/nike.png',
      },
      stock: 64,
      sku: 'NIKE-AM270-001',
      status: 'active',
      featured: false,
      rating: 4.6,
      reviews_count: 215,
      sales_count: 378,
      created_at: '25 Jan 2023',
      updated_at: '28 Mar 2023',
    },
    {
      id: 'PRD-005',
      name: 'Instant Pot Duo 7-in-1',
      slug: 'instant-pot-duo',
      description: 'Instant Pot Duo 7-in-1 electric pressure cooker, 6 quart',
      images: ['/assets/images/marketplace/products/instant-pot.jpg'],
      price: '$99.95',
      sale_price: '$79.95',
      category: {
        id: 'CAT-007',
        name: 'Home & Kitchen',
      },
      vendor: {
        id: 'VEN-004',
        name: 'Instant Brands',
        logo: '/assets/images/marketplace/vendors/instant-brands.png',
      },
      stock: 0,
      sku: 'INST-DUO-6QT',
      status: 'out_of_stock',
      featured: false,
      rating: 4.7,
      reviews_count: 312,
      sales_count: 524,
      created_at: '28 Jan 2023',
      updated_at: '30 Mar 2023',
    },
    {
      id: 'PRD-006',
      name: 'Sony WH-1000XM4',
      slug: 'sony-wh-1000xm4',
      description: 'Sony WH-1000XM4 wireless noise-canceling headphones',
      images: ['/assets/images/marketplace/products/sony-headphones.jpg'],
      price: '$349.99',
      sale_price: '$299.99',
      category: {
        id: 'CAT-001',
        name: 'Electronics',
      },
      vendor: {
        id: 'VEN-005',
        name: 'Sony',
        logo: '/assets/images/marketplace/vendors/sony.png',
      },
      stock: 27,
      sku: 'SONY-WH1000XM4',
      status: 'active',
      featured: true,
      rating: 4.8,
      reviews_count: 187,
      sales_count: 256,
      created_at: '02 Feb 2023',
      updated_at: '05 Apr 2023',
    },
    {
      id: 'PRD-007',
      name: 'The Psychology of Money',
      slug: 'psychology-of-money',
      description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel',
      images: ['/assets/images/marketplace/products/psychology-of-money.jpg'],
      price: '$18.99',
      sale_price: '$14.99',
      category: {
        id: 'CAT-008',
        name: 'Books',
      },
      stock: 42,
      sku: 'BOOK-POM-001',
      status: 'active',
      featured: false,
      rating: 4.9,
      reviews_count: 456,
      sales_count: 1245,
      created_at: '05 Feb 2023',
      updated_at: '10 Apr 2023',
    },
    {
      id: 'PRD-008',
      name: 'Dyson V11 Absolute',
      slug: 'dyson-v11-absolute',
      description: 'Dyson V11 Absolute cordless vacuum cleaner with intelligent suction',
      images: ['/assets/images/marketplace/products/dyson-v11.jpg'],
      price: '$699.99',
      category: {
        id: 'CAT-007',
        name: 'Home & Kitchen',
      },
      vendor: {
        id: 'VEN-006',
        name: 'Dyson',
        logo: '/assets/images/marketplace/vendors/dyson.png',
      },
      stock: 8,
      sku: 'DYSN-V11-ABS',
      status: 'active',
      featured: false,
      rating: 4.7,
      reviews_count: 98,
      sales_count: 132,
      created_at: '10 Feb 2023',
      updated_at: '15 Apr 2023',
    },
  ];
  
  // Apply sorting
  let sortedProducts = [...products];
  
  if (sortBy === 'sales') {
    sortedProducts.sort((a, b) => b.sales_count - a.sales_count);
  } else if (sortBy === 'rating') {
    sortedProducts.sort((a, b) => b.rating - a.rating);
  } else {
    // Default to newest
    sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  // Apply filters
  let filteredProducts = sortedProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = filterCategory === 'all' || product.category.id === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    // Stock filter
    let matchesStock = true;
    if (filterStock === 'in_stock') {
      matchesStock = product.stock > 0;
    } else if (filterStock === 'out_of_stock') {
      matchesStock = product.stock === 0;
    } else if (filterStock === 'low_stock') {
      matchesStock = product.stock > 0 && product.stock <= 10;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });
  
  // Apply limit if provided
  if (limit && filteredProducts.length > limit) {
    filteredProducts = filteredProducts.slice(0, limit);
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: MarketplaceProduct['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'secondary';
      case 'out_of_stock':
        return 'warning';
      case 'archived':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  // Format status for display
  const formatStatus = (status: MarketplaceProduct['status']) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Get stock badge variant
  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) {
      return 'danger';
    } else if (stock <= 10) {
      return 'warning';
    } else {
      return 'success';
    }
  };
  
  // Handle product details view
  const handleViewDetails = (product: MarketplaceProduct) => {
    setCurrentProduct(product);
    setShowDetailsModal(true);
  };

  // Handle enhanced product details view
  const handleViewEnhancedDetails = (product: MarketplaceProduct) => {
    setCurrentProduct(product);
    setShowProductDetailsModal(true);
  };

  // Handle product status change
  const handleStatusChange = (product: MarketplaceProduct, newStatus: string) => {
    console.log(`Changing product ${product.id} status to ${newStatus}`);
    alert(`Successfully changed ${product.name} status to ${newStatus}`);
  };

  // Handle product edit
  const handleEditProduct = (product: MarketplaceProduct) => {
    console.log(`Edit product ${product.id}`);
    alert(`Edit product functionality for ${product.name}`);
  };

  // Handle product delete
  const handleDeleteProduct = (product: MarketplaceProduct) => {
    console.log(`Delete product ${product.id}`);
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      alert(`Product ${product.name} deleted successfully`);
    }
  };

  // Categories for filter dropdown
  const categories = [
    { id: 'CAT-001', name: 'Electronics' },
    { id: 'CAT-002', name: 'Smartphones' },
    { id: 'CAT-003', name: 'Laptops' },
    { id: 'CAT-004', name: 'Fashion' },
    { id: 'CAT-005', name: 'Men\'s Clothing' },
    { id: 'CAT-006', name: 'Women\'s Clothing' },
    { id: 'CAT-007', name: 'Home & Kitchen' },
    { id: 'CAT-008', name: 'Books' },
  ];

  return (
    <>
      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={3} className="mb-2">
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder="Name, SKU, description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="secondary">
                      <IconifyIcon icon="ri:search-line" />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={3} className="mb-2">
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3} className="mb-2">
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3} className="mb-2">
                <Form.Group>
                  <Form.Label>Stock</Form.Label>
                  <Form.Select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="low_stock">Low Stock</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mt-2">
              <Col xs={12} className="d-flex justify-content-between">
                <div>
                  <Button variant="light" className="me-2" onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setFilterStock('all');
                  }}>
                    Reset Filters
                  </Button>
                </div>
                <div>
                  <Button variant="primary">
                    <IconifyIcon icon="ri:add-line" className="me-1" />
                    Add Product
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Products Table */}
      <div className="table-responsive">
        <Table className="table-centered table-nowrap mb-0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Sales</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm me-2">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="img-fluid rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="font-14 mb-0">{product.name}</h5>
                      <div className="text-muted font-13">
                        <span>SKU: {product.sku}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>{product.category.name}</td>
                <td>
                  {product.sale_price ? (
                    <div>
                      <span className="text-decoration-line-through text-muted">{product.price}</span>
                      <div className="text-success">{product.sale_price}</div>
                    </div>
                  ) : (
                    product.price
                  )}
                </td>
                <td>
                  <Badge bg={getStockBadgeVariant(product.stock)}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="text-warning me-1">
                      <IconifyIcon icon="ri:star-fill" />
                    </span>
                    <span>{product.rating}</span>
                    <span className="text-muted ms-1">({product.reviews_count})</span>
                  </div>
                </td>
                <td>{product.sales_count}</td>
                <td>
                  <Badge bg={getStatusBadgeVariant(product.status)}>
                    {formatStatus(product.status)}
                  </Badge>
                  {product.featured && (
                    <Badge bg="info" className="ms-1">Featured</Badge>
                  )}
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewEnhancedDetails(product)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleEditProduct(product)}>
                        <IconifyIcon icon="ri:pencil-line" className="me-1" />
                        Edit Product
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
                        View Analytics
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Change Status</Dropdown.Header>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(product, 'active')}
                        className={product.status === 'active' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:check-line" className="me-1 text-success" />
                        Active
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(product, 'draft')}
                        className={product.status === 'draft' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:draft-line" className="me-1 text-secondary" />
                        Draft
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(product, 'out_of_stock')}
                        className={product.status === 'out_of_stock' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:alert-line" className="me-1 text-warning" />
                        Out of Stock
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(product, 'archived')}
                        className={product.status === 'archived' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:archive-line" className="me-1 text-danger" />
                        Archive
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => handleDeleteProduct(product)}>
                        <IconifyIcon icon="ri:delete-bin-line" className="me-1 text-danger" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-4">
            <IconifyIcon icon="ri:search-line" className="font-36 text-muted" />
            <h5 className="mt-2">No products found</h5>
            <p className="text-muted">Try adjusting your search or filter parameters</p>
          </div>
        )}
      </div>
      
      {/* Product Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Product Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentProduct && (
            <div>
              <Row className="mb-3">
                <Col md={4}>
                  <img 
                    src={currentProduct.images[0]} 
                    alt={currentProduct.name} 
                    className="img-fluid rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                    }}
                  />
                </Col>
                <Col md={8}>
                  <h4>{currentProduct.name}</h4>
                  <p className="text-muted">{currentProduct.description}</p>
                  
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-warning me-1">
                      <IconifyIcon icon="ri:star-fill" />
                    </span>
                    <span>{currentProduct.rating}</span>
                    <span className="text-muted ms-1">({currentProduct.reviews_count} reviews)</span>
                  </div>
                  
                  <div className="mb-2">
                    {currentProduct.sale_price ? (
                      <div>
                        <span className="text-decoration-line-through text-muted">{currentProduct.price}</span>
                        <h4 className="text-success d-inline-block ms-2">{currentProduct.sale_price}</h4>
                      </div>
                    ) : (
                      <h4>{currentProduct.price}</h4>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <Badge bg={getStatusBadgeVariant(currentProduct.status)} className="me-1">
                      {formatStatus(currentProduct.status)}
                    </Badge>
                    {currentProduct.featured && (
                      <Badge bg="info">Featured</Badge>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <strong>SKU:</strong> {currentProduct.sku}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Category:</strong> {currentProduct.category.name}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Stock:</strong> 
                    <Badge bg={getStockBadgeVariant(currentProduct.stock)} className="ms-1">
                      {currentProduct.stock === 0 ? 'Out of Stock' : `${currentProduct.stock} units`}
                    </Badge>
                  </div>
                  
                  {currentProduct.vendor && (
                    <div className="mb-2">
                      <strong>Vendor:</strong> {currentProduct.vendor.name}
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <strong>Sales:</strong> {currentProduct.sales_count} units sold
                  </div>
                  
                  <div>
                    <strong>Created:</strong> {currentProduct.created_at} | <strong>Updated:</strong> {currentProduct.updated_at}
                  </div>
                </Col>
              </Row>
              
              <Row className="mt-3">
                <Col xs={12} className="d-flex justify-content-end">
                  <Button variant="outline-secondary" className="me-2">
                    <IconifyIcon icon="ri:pencil-line" className="me-1" />
                    Edit Product
                  </Button>
                  <Button variant="outline-primary">
                    <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
                    View Analytics
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Enhanced Product Details Modal */}
      <ProductDetailsModal
        show={showProductDetailsModal}
        onHide={() => setShowProductDetailsModal(false)}
        product={currentProduct}
        onEdit={handleEditProduct}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteProduct}
      />
    </>
  );
};

export default ProductManagementTable;

