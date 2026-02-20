"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface Vendor {
  id: string;
  name: string;
  logo: string;
  category: string;
  products: number;
  joinDate: string;
  commission: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  contact: string;
}

interface VendorDetailsModalProps {
  show: boolean;
  onHide: () => void;
  vendor: Vendor | null;
  onEdit?: (vendor: Vendor) => void;
  onStatusChange?: (vendor: Vendor, newStatus: string) => void;
}

const VendorDetailsModal: React.FC<VendorDetailsModalProps> = ({ 
  show, 
  onHide, 
  vendor,
  onEdit,
  onStatusChange
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!vendor) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: Vendor['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'danger';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the vendor
  const extendedVendor = {
    ...vendor,
    businessName: vendor.name,
    businessType: 'Limited Liability Company',
    taxId: 'TX123456789',
    businessAddress: '123 Business Street, Accra, Ghana',
    phone: '+233 50 123 4567',
    website: `https://www.${vendor.name.toLowerCase().replace(/\s+/g, '')}.com`,
    totalRevenue: 125450.75,
    monthlyRevenue: 18750.50,
    totalOrders: 1247,
    averageOrderValue: 87.50,
    customerRating: 4.6,
    responseTime: '< 2 hours',
    fulfillmentRate: 98.5,
    returnRate: 2.3,
    joinedDate: vendor.joinDate,
    lastActivity: '2 hours ago',
    paymentMethod: 'Bank Transfer',
    bankDetails: {
      accountName: vendor.name,
      accountNumber: '**** **** **56',
      bankName: 'Ghana Commercial Bank',
      swiftCode: 'GHCBGHAC'
    },
    documents: {
      businessLicense: { status: 'verified', uploadDate: '2023-05-12', expiryDate: '2024-05-12' },
      taxCertificate: { status: 'verified', uploadDate: '2023-05-12', expiryDate: '2024-12-31' },
      bankStatement: { status: 'verified', uploadDate: '2023-05-12', expiryDate: null },
      identityCard: { status: 'pending', uploadDate: null, expiryDate: null }
    },
    topProducts: [
      { id: 'PRD-001', name: 'Wireless Headphones', sales: 156, revenue: '$15,600', rating: 4.8 },
      { id: 'PRD-002', name: 'Smart Watch', sales: 89, revenue: '$17,800', rating: 4.7 },
      { id: 'PRD-003', name: 'Phone Case', sales: 234, revenue: '$4,680', rating: 4.5 }
    ],
    recentOrders: [
      { id: 'ORD-001', customer: 'John Smith', product: 'Wireless Headphones', amount: '$99.99', date: '2 hours ago', status: 'processing' },
      { id: 'ORD-002', customer: 'Sarah Johnson', product: 'Smart Watch', amount: '$199.99', date: '5 hours ago', status: 'shipped' },
      { id: 'ORD-003', customer: 'Mike Brown', product: 'Phone Case', amount: '$19.99', date: '1 day ago', status: 'delivered' }
    ],
    performanceMetrics: [
      { metric: 'Monthly Sales', value: '156', change: '+12.5%', trend: 'up' },
      { metric: 'Revenue', value: '$18,750', change: '+8.3%', trend: 'up' },
      { metric: 'Orders', value: '89', change: '+5.2%', trend: 'up' },
      { metric: 'Rating', value: '4.6/5', change: '+0.1', trend: 'up' }
    ],
    commissionHistory: [
      { period: 'September 2023', sales: '$18,750', commission: '$2,812.50', status: 'paid', paidDate: '2023-10-01' },
      { period: 'August 2023', sales: '$16,420', commission: '$2,463.00', status: 'paid', paidDate: '2023-09-01' },
      { period: 'July 2023', sales: '$14,680', commission: '$2,202.00', status: 'paid', paidDate: '2023-08-01' }
    ],
    supportTickets: [
      { id: 'TKT-001', subject: 'Payment delay inquiry', status: 'resolved', created: '2023-09-15', resolved: '2023-09-16' },
      { id: 'TKT-002', subject: 'Product listing issue', status: 'open', created: '2023-09-20', resolved: null },
      { id: 'TKT-003', subject: 'Commission calculation', status: 'resolved', created: '2023-09-10', resolved: '2023-09-11' }
    ]
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <img 
            src={vendor.logo} 
            alt={vendor.name} 
            height="32" 
            className="me-2 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
            }}
          />
          {vendor.name} - Vendor Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Vendor Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(vendor.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={vendor.status === 'active' ? 'ri:check-line' : 
                      vendor.status === 'pending' ? 'ri:time-line' : 
                      vendor.status === 'suspended' ? 'ri:close-line' :
                      'ri:pause-line'} 
                className="me-1" 
              />
              {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
            </Badge>
            <Badge bg="info" className="px-3 py-2">
              <IconifyIcon icon="ri:building-line" className="me-1" />
              {vendor.category}
            </Badge>
          </div>
          <h4 className="mb-1">${extendedVendor.totalRevenue.toLocaleString()} Total Revenue</h4>
          <p className="text-muted mb-0">{vendor.products} products • {extendedVendor.totalOrders} orders • {vendor.commission} commission</p>
        </div>

        {/* Tabbed Content */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-3">
          {/* Overview Tab */}
          <Tab eventKey="overview" title="Overview">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Business Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Vendor ID:</td>
                          <td>{vendor.id}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Business Name:</td>
                          <td>{extendedVendor.businessName}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Business Type:</td>
                          <td>{extendedVendor.businessType}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Tax ID:</td>
                          <td><code>{extendedVendor.taxId}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Category:</td>
                          <td>{vendor.category}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Joined Date:</td>
                          <td>{extendedVendor.joinedDate}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Last Activity:</td>
                          <td>{extendedVendor.lastActivity}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Contact Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Email:</td>
                          <td>
                            <a href={`mailto:${vendor.contact}`} className="text-decoration-none">
                              {vendor.contact}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Phone:</td>
                          <td>
                            <a href={`tel:${extendedVendor.phone}`} className="text-decoration-none">
                              {extendedVendor.phone}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Website:</td>
                          <td>
                            <a href={extendedVendor.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                              {extendedVendor.website}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Address:</td>
                          <td>{extendedVendor.businessAddress}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Response Time:</td>
                          <td>{extendedVendor.responseTime}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Performance Metrics</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className="text-center mb-3">
                      <Col xs={6} className="border-end">
                        <h5 className="text-primary mb-1">${extendedVendor.monthlyRevenue.toLocaleString()}</h5>
                        <p className="text-muted mb-0">Monthly Revenue</p>
                      </Col>
                      <Col xs={6}>
                        <h5 className="text-success mb-1">${extendedVendor.averageOrderValue}</h5>
                        <p className="text-muted mb-0">Avg Order Value</p>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Fulfillment Rate:</span>
                        <span>{extendedVendor.fulfillmentRate}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedVendor.fulfillmentRate} 
                        variant={extendedVendor.fulfillmentRate > 95 ? 'success' : 'warning'}
                        className="mb-2"
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Return Rate:</span>
                        <span>{extendedVendor.returnRate}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedVendor.returnRate} 
                        variant={extendedVendor.returnRate < 5 ? 'success' : 'danger'}
                        className="mb-2"
                      />
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <span className="text-warning me-2">
                        {[...Array(5)].map((_, i) => (
                          <IconifyIcon 
                            key={i} 
                            icon={i < Math.floor(extendedVendor.customerRating) ? 'ri:star-fill' : 'ri:star-line'} 
                          />
                        ))}
                      </span>
                      <span>{extendedVendor.customerRating}/5 Customer Rating</span>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Commission Structure</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Commission Rate:</td>
                          <td><span className="badge bg-success">{vendor.commission}</span></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Payment Method:</td>
                          <td>{extendedVendor.paymentMethod}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Payment Schedule:</td>
                          <td>Monthly (1st of each month)</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Next Payment:</td>
                          <td>October 1, 2023</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Products & Sales Tab */}
          <Tab eventKey="products" title={`Products (${vendor.products})`}>
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Top Performing Products</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Sales</th>
                            <th>Revenue</th>
                            <th>Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedVendor.topProducts.map((product, index) => (
                            <tr key={index}>
                              <td>{product.name}</td>
                              <td>{product.sales}</td>
                              <td>{product.revenue}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className="text-warning me-1">
                                    <IconifyIcon icon="ri:star-fill" />
                                  </span>
                                  <span>{product.rating}</span>
                                </div>
                              </td>
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
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedVendor.recentOrders.map((order, index) => (
                            <tr key={index}>
                              <td>{order.id}</td>
                              <td>{order.customer}</td>
                              <td>{order.amount}</td>
                              <td>
                                <Badge bg={
                                  order.status === 'delivered' ? 'success' :
                                  order.status === 'shipped' ? 'primary' :
                                  order.status === 'processing' ? 'info' : 'warning'
                                }>
                                  {order.status}
                                </Badge>
                              </td>
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

          {/* Financial Tab */}
          <Tab eventKey="financial" title="Financial">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Commission History</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Sales</th>
                            <th>Commission</th>
                            <th>Status</th>
                            <th>Paid Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedVendor.commissionHistory.map((commission, index) => (
                            <tr key={index}>
                              <td>{commission.period}</td>
                              <td>{commission.sales}</td>
                              <td>{commission.commission}</td>
                              <td>
                                <Badge bg={commission.status === 'paid' ? 'success' : 'warning'}>
                                  {commission.status}
                                </Badge>
                              </td>
                              <td>{commission.paidDate || '-'}</td>
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
                    <h6 className="mb-0">Bank Details</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Account Name:</td>
                          <td>{extendedVendor.bankDetails.accountName}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Account Number:</td>
                          <td><code>{extendedVendor.bankDetails.accountNumber}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Bank Name:</td>
                          <td>{extendedVendor.bankDetails.bankName}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">SWIFT Code:</td>
                          <td><code>{extendedVendor.bankDetails.swiftCode}</code></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Documents Tab */}
          <Tab eventKey="documents" title="Documents">
            <Card>
              <Card.Header>
                <h6 className="mb-0">Document Verification Status</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(extendedVendor.documents).map(([docType, doc]) => (
                    <Col md={6} key={docType} className="mb-3">
                      <div className="p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">{docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h6>
                            <Badge bg={
                              doc.status === 'verified' ? 'success' :
                              doc.status === 'pending' ? 'warning' : 'danger'
                            }>
                              <IconifyIcon 
                                icon={
                                  doc.status === 'verified' ? 'ri:check-line' :
                                  doc.status === 'pending' ? 'ri:time-line' : 'ri:close-line'
                                } 
                                className="me-1" 
                              />
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        {doc.uploadDate && (
                          <div className="small text-muted">
                            <div>Uploaded: {doc.uploadDate}</div>
                            {doc.expiryDate && <div>Expires: {doc.expiryDate}</div>}
                          </div>
                        )}
                        {!doc.uploadDate && (
                          <div className="small text-muted">Not uploaded</div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Support Tab */}
          <Tab eventKey="support" title="Support">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Support Tickets</h6>
                <Button variant="outline-primary" size="sm">
                  Create New Ticket
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table className="table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Resolved</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extendedVendor.supportTickets.map((ticket, index) => (
                        <tr key={index}>
                          <td>{ticket.id}</td>
                          <td>{ticket.subject}</td>
                          <td>
                            <Badge bg={ticket.status === 'resolved' ? 'success' : ticket.status === 'open' ? 'warning' : 'info'}>
                              {ticket.status}
                            </Badge>
                          </td>
                          <td>{ticket.created}</td>
                          <td>{ticket.resolved || '-'}</td>
                          <td>
                            <Button variant="outline-primary" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary">
          <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
          View Analytics
        </Button>
        <Button variant="outline-info">
          <IconifyIcon icon="ri:list-check" className="me-1" />
          View Products
        </Button>
        <Button variant="outline-warning">
          <IconifyIcon icon="ri:customer-service-line" className="me-1" />
          Contact Vendor
        </Button>
        <Button 
          variant={vendor.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(vendor, vendor.status === 'active' ? 'suspended' : 'active')}
        >
          <IconifyIcon 
            icon={vendor.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {vendor.status === 'active' ? 'Suspend' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(vendor)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Vendor
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VendorDetailsModal;
