"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

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

interface ProductDetailsModalProps {
  show: boolean;
  onHide: () => void;
  product: MarketplaceProduct | null;
  onEdit?: (product: MarketplaceProduct) => void;
  onStatusChange?: (product: MarketplaceProduct, newStatus: string) => void;
  onDelete?: (product: MarketplaceProduct) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  show, 
  onHide, 
  product,
  onEdit,
  onStatusChange,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!product) return null;

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

  // Format status for display
  const formatStatus = (status: MarketplaceProduct['status']) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Mock extended data for the product
  const extendedProduct = {
    ...product,
    totalRevenue: product.sales_count * parseFloat(product.sale_price?.replace('$', '') || product.price.replace('$', '')),
    conversionRate: 4.2,
    viewCount: 1247,
    cartAdditions: 89,
    wishlistCount: 156,
    returnRate: 2.1,
    profitMargin: 35.5,
    weight: '1.2 kg',
    dimensions: '15 x 10 x 5 cm',
    tags: ['bestseller', 'premium', 'trending'],
    seoTitle: `${product.name} - Best Deals Online`,
    seoDescription: product.description.substring(0, 160),
    variants: [
      { name: 'Color', options: ['Black', 'White', 'Blue'] },
      { name: 'Size', options: ['Small', 'Medium', 'Large'] }
    ],
    recentOrders: [
      { id: 'ORD-001', customer: 'John Smith', date: '2 hours ago', quantity: 2, total: '$299.98' },
      { id: 'ORD-002', customer: 'Sarah Johnson', date: '5 hours ago', quantity: 1, total: '$149.99' },
      { id: 'ORD-003', customer: 'Mike Brown', date: '1 day ago', quantity: 3, total: '$449.97' }
    ],
    recentReviews: [
      { id: 'REV-001', customer: 'Alice Wilson', rating: 5, comment: 'Excellent product, highly recommend!', date: '2 days ago' },
      { id: 'REV-002', customer: 'Bob Davis', rating: 4, comment: 'Good quality, fast shipping.', date: '3 days ago' },
      { id: 'REV-003', customer: 'Carol Miller', rating: 5, comment: 'Perfect! Exactly as described.', date: '5 days ago' }
    ],
    performanceMetrics: [
      { period: 'Last 7 days', sales: 23, revenue: '$3,450', views: 456 },
      { period: 'Last 30 days', sales: 89, revenue: '$13,350', views: 1890 },
      { period: 'Last 90 days', sales: 256, revenue: '$38,400', views: 5670 }
    ],
    inventoryHistory: [
      { date: '2023-09-20', action: 'Restocked', quantity: '+50', balance: 95 },
      { date: '2023-09-15', action: 'Sale', quantity: '-5', balance: 45 },
      { date: '2023-09-10', action: 'Restocked', quantity: '+30', balance: 50 }
    ]
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            height="32" 
            className="me-2 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
            }}
          />
          {product.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Product Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(product.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={product.status === 'active' ? 'ri:check-line' : 
                      product.status === 'draft' ? 'ri:draft-line' : 
                      product.status === 'out_of_stock' ? 'ri:alert-line' : 
                      'ri:archive-line'} 
                className="me-1" 
              />
              {formatStatus(product.status)}
            </Badge>
            <Badge bg={getStockBadgeVariant(product.stock)} className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:stack-line" className="me-1" />
              {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
            </Badge>
            {product.featured && (
              <Badge bg="info" className="px-3 py-2">
                <IconifyIcon icon="ri:star-line" className="me-1" />
                Featured
              </Badge>
            )}
          </div>
          <h4 className="mb-1">${extendedProduct.totalRevenue.toLocaleString()} Total Revenue</h4>
          <p className="text-muted mb-0">{product.sales_count} units sold • {product.reviews_count} reviews • {extendedProduct.viewCount} views</p>
        </div>

        {/* Tabbed Content */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-3">
          {/* Overview Tab */}
          <Tab eventKey="overview" title="Overview">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Product Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Product ID:</td>
                          <td>{product.id}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">SKU:</td>
                          <td><code>{product.sku}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Category:</td>
                          <td>{product.category.name}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Price:</td>
                          <td>
                            {product.sale_price ? (
                              <div>
                                <span className="text-decoration-line-through text-muted">{product.price}</span>
                                <div className="text-success fw-bold">{product.sale_price}</div>
                              </div>
                            ) : (
                              <span className="fw-bold">{product.price}</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Weight:</td>
                          <td>{extendedProduct.weight}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Dimensions:</td>
                          <td>{extendedProduct.dimensions}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Profit Margin:</td>
                          <td>{extendedProduct.profitMargin}%</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                {product.vendor && (
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">Vendor Information</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        {product.vendor.logo && (
                          <img 
                            src={product.vendor.logo} 
                            alt={product.vendor.name} 
                            height="40" 
                            className="me-3 rounded"
                          />
                        )}
                        <div>
                          <h6 className="mb-1">{product.vendor.name}</h6>
                          <small className="text-muted">Vendor ID: {product.vendor.id}</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Col>

              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Performance Metrics</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className="text-center mb-3">
                      <Col xs={4} className="border-end">
                        <h5 className="text-primary mb-1">{extendedProduct.viewCount}</h5>
                        <p className="text-muted mb-0">Views</p>
                      </Col>
                      <Col xs={4} className="border-end">
                        <h5 className="text-success mb-1">{extendedProduct.cartAdditions}</h5>
                        <p className="text-muted mb-0">Cart Adds</p>
                      </Col>
                      <Col xs={4}>
                        <h5 className="text-info mb-1">{extendedProduct.wishlistCount}</h5>
                        <p className="text-muted mb-0">Wishlisted</p>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Conversion Rate:</span>
                        <span>{extendedProduct.conversionRate}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedProduct.conversionRate} 
                        variant={extendedProduct.conversionRate > 3 ? 'success' : 'warning'}
                        className="mb-2"
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Return Rate:</span>
                        <span>{extendedProduct.returnRate}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedProduct.returnRate} 
                        variant={extendedProduct.returnRate < 5 ? 'success' : 'danger'}
                        className="mb-2"
                      />
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <span className="text-warning me-2">
                        {[...Array(5)].map((_, i) => (
                          <IconifyIcon 
                            key={i} 
                            icon={i < Math.floor(product.rating) ? 'ri:star-fill' : 'ri:star-line'} 
                          />
                        ))}
                      </span>
                      <span>{product.rating}/5 ({product.reviews_count} reviews)</span>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Tags</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex flex-wrap gap-2">
                      {extendedProduct.tags.map((tag, index) => (
                        <Badge key={index} bg="outline-primary" className="px-3 py-2">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Sales & Analytics Tab */}
          <Tab eventKey="analytics" title="Sales & Analytics">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Performance by Period</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Sales</th>
                            <th>Revenue</th>
                            <th>Views</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedProduct.performanceMetrics.map((metric, index) => (
                            <tr key={index}>
                              <td>{metric.period}</td>
                              <td>{metric.sales}</td>
                              <td>{metric.revenue}</td>
                              <td>{metric.views}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Recent Orders</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedProduct.recentOrders.map((order, index) => (
                            <tr key={index}>
                              <td>{order.id}</td>
                              <td>{order.customer}</td>
                              <td>{order.quantity}</td>
                              <td>{order.total}</td>
                              <td>{order.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Inventory Tab */}
          <Tab eventKey="inventory" title="Inventory">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Current Stock Status</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center mb-3">
                      <h2 className={`mb-2 ${product.stock === 0 ? 'text-danger' : product.stock <= 10 ? 'text-warning' : 'text-success'}`}>
                        {product.stock}
                      </h2>
                      <p className="text-muted mb-0">Units Available</p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Stock Level:</span>
                      <Badge bg={getStockBadgeVariant(product.stock)}>
                        {product.stock === 0 ? 'Out of Stock' : 
                         product.stock <= 10 ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Recent Inventory Changes</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Action</th>
                            <th>Change</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedProduct.inventoryHistory.map((entry, index) => (
                            <tr key={index}>
                              <td>{entry.date}</td>
                              <td>{entry.action}</td>
                              <td className={entry.quantity.startsWith('+') ? 'text-success' : 'text-danger'}>
                                {entry.quantity}
                              </td>
                              <td>{entry.balance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Reviews Tab */}
          <Tab eventKey="reviews" title={`Reviews (${product.reviews_count})`}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Customer Reviews</h6>
                <Button variant="outline-primary" size="sm">
                  Manage All Reviews
                </Button>
              </Card.Header>
              <Card.Body>
                {extendedProduct.recentReviews.map((review, index) => (
                  <div key={index} className={`p-3 ${index < extendedProduct.recentReviews.length - 1 ? 'border-bottom' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">{review.customer}</h6>
                        <div className="d-flex align-items-center">
                          <span className="text-warning me-2">
                            {[...Array(5)].map((_, i) => (
                              <IconifyIcon 
                                key={i} 
                                icon={i < review.rating ? 'ri:star-fill' : 'ri:star-line'} 
                              />
                            ))}
                          </span>
                          <small className="text-muted">{review.date}</small>
                        </div>
                      </div>
                    </div>
                    <p className="mb-0">{review.comment}</p>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Tab>

          {/* SEO & Settings Tab */}
          <Tab eventKey="seo" title="SEO & Settings">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">SEO Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">SEO Title:</td>
                          <td>{extendedProduct.seoTitle}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Meta Description:</td>
                          <td>{extendedProduct.seoDescription}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">URL Slug:</td>
                          <td><code>{product.slug}</code></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Product Variants</h6>
                  </Card.Header>
                  <Card.Body>
                    {extendedProduct.variants.map((variant, index) => (
                      <div key={index} className="mb-3">
                        <strong>{variant.name}:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {variant.options.map((option, optIndex) => (
                            <Badge key={optIndex} bg="outline-secondary">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary">
          <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
          Full Analytics
        </Button>
        <Button variant="outline-info">
          <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
          View Orders
        </Button>
        <Button variant="outline-warning">
          <IconifyIcon icon="ri:stack-line" className="me-1" />
          Manage Stock
        </Button>
        <Button 
          variant={product.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(product, product.status === 'active' ? 'draft' : 'active')}
        >
          <IconifyIcon 
            icon={product.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {product.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(product)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Product
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductDetailsModal;
