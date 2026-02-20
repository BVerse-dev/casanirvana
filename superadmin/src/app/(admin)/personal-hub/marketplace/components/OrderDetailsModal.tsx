"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  total: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: string;
  items: number;
}

interface OrderDetailsModalProps {
  show: boolean;
  onHide: () => void;
  order: Order | null;
  onStatusUpdate?: (order: Order, newStatus: string) => void;
  onPrintInvoice?: (order: Order) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  show, 
  onHide, 
  order,
  onStatusUpdate,
  onPrintInvoice
}) => {
  const [showStatusConfirm, setShowStatusConfirm] = useState<string | null>(null);

  if (!order) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'returned':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the order
  const extendedOrder = {
    ...order,
    customerInfo: {
      name: order.customer,
      email: 'customer@example.com',
      phone: '+233 50 123 4567',
      customerId: 'CUST-001'
    },
    shippingAddress: {
      street: '123 Main Street, Apt 4B',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      postalCode: 'GA-123-4567'
    },
    billingAddress: {
      street: '123 Main Street, Apt 4B',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      postalCode: 'GA-123-4567'
    },
    orderItems: [
      {
        id: 'ITEM-001',
        productId: 'PRD-001',
        name: 'iPhone 13 Pro Max',
        sku: 'APPL-IP13PM-128',
        vendor: 'Apple Store',
        quantity: 1,
        unitPrice: 1099.00,
        totalPrice: 1099.00,
        image: '/assets/images/marketplace/products/iphone-13.jpg'
      },
      {
        id: 'ITEM-002',
        productId: 'PRD-002',
        name: 'AirPods Pro',
        sku: 'APPL-AIRPODS-PRO',
        vendor: 'Apple Store',
        quantity: 1,
        unitPrice: 249.00,
        totalPrice: 249.00,
        image: '/assets/images/marketplace/products/airpods-pro.jpg'
      }
    ],
    orderSummary: {
      subtotal: 1348.00,
      tax: 67.40,
      shipping: 15.00,
      discount: 0.00,
      total: 1430.40
    },
    paymentInfo: {
      method: order.paymentMethod,
      status: 'paid',
      transactionId: 'TXN-123456789',
      paidDate: order.date,
      cardLast4: order.paymentMethod === 'Credit Card' ? '4567' : null
    },
    shippingInfo: {
      carrier: 'DHL Express',
      trackingNumber: 'DHL123456789',
      shippingMethod: 'Express Delivery',
      estimatedDelivery: '2023-09-25',
      shippingCost: 15.00
    },
    orderTimeline: [
      { status: 'placed', date: order.date, time: '10:30 AM', description: 'Order placed and payment confirmed' },
      { status: 'confirmed', date: order.date, time: '11:15 AM', description: 'Order confirmed by vendor' },
      { status: 'processing', date: '2023-09-17', time: '09:00 AM', description: 'Order is being prepared for shipment' },
      { status: 'shipped', date: '2023-09-18', time: '02:30 PM', description: 'Order shipped via DHL Express' },
      { status: 'out_for_delivery', date: '2023-09-20', time: '08:00 AM', description: 'Out for delivery' }
    ],
    notes: [
      { id: 'NOTE-001', author: 'System', date: order.date, content: 'Order automatically created from website' },
      { id: 'NOTE-002', author: 'Customer Service', date: '2023-09-17', content: 'Customer requested expedited shipping' },
      { id: 'NOTE-003', author: 'Warehouse', date: '2023-09-18', content: 'Items packed and ready for pickup' }
    ],
    refundInfo: order.status === 'returned' ? {
      refundAmount: 1430.40,
      refundMethod: 'Original payment method',
      refundStatus: 'processed',
      refundDate: '2023-09-25',
      refundReason: 'Customer return request'
    } : null
  };

  // Handle status update with confirmation
  const handleStatusUpdate = (newStatus: string) => {
    if (showStatusConfirm === newStatus) {
      onStatusUpdate && onStatusUpdate(order, newStatus);
      setShowStatusConfirm(null);
    } else {
      setShowStatusConfirm(newStatus);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon="ri:shopping-bag-line" className="me-2" />
          Order Details - {order.orderNumber}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Order Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(order.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={
                  order.status === 'pending' ? 'ri:time-line' :
                  order.status === 'processing' ? 'ri:loader-4-line' :
                  order.status === 'shipped' ? 'ri:truck-line' :
                  order.status === 'delivered' ? 'ri:check-double-line' :
                  order.status === 'cancelled' ? 'ri:close-circle-line' :
                  'ri:arrow-go-back-line'
                } 
                className="me-1" 
              />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge bg={extendedOrder.paymentInfo.status === 'paid' ? 'success' : 'warning'} className="px-3 py-2">
              <IconifyIcon icon="ri:secure-payment-line" className="me-1" />
              Payment {extendedOrder.paymentInfo.status}
            </Badge>
          </div>
          <h4 className="mb-1">{order.total} Total Amount</h4>
          <p className="text-muted mb-0">{order.items} items • Ordered on {order.date} • {extendedOrder.paymentInfo.method}</p>
        </div>

        {/* Status Update Confirmation */}
        {showStatusConfirm && (
          <Alert variant="warning" className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Confirm Status Change:</strong> Are you sure you want to change the order status to "{showStatusConfirm}"?
              </div>
              <div>
                <Button variant="success" size="sm" className="me-2" onClick={() => handleStatusUpdate(showStatusConfirm)}>
                  Confirm
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowStatusConfirm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Alert>
        )}

        <Row>
          {/* Order Information */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Order Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Order Number:</td>
                      <td>{order.orderNumber}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Order ID:</td>
                      <td><code>{order.id}</code></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Order Date:</td>
                      <td>{order.date}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Status:</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Total Items:</td>
                      <td>{order.items}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Total Amount:</td>
                      <td className="fw-bold">{order.total}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Customer Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Name:</td>
                      <td>{extendedOrder.customerInfo.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Customer ID:</td>
                      <td><code>{extendedOrder.customerInfo.customerId}</code></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Email:</td>
                      <td>
                        <a href={`mailto:${extendedOrder.customerInfo.email}`} className="text-decoration-none">
                          {extendedOrder.customerInfo.email}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Phone:</td>
                      <td>
                        <a href={`tel:${extendedOrder.customerInfo.phone}`} className="text-decoration-none">
                          {extendedOrder.customerInfo.phone}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Payment Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Payment Method:</td>
                      <td>{extendedOrder.paymentInfo.method}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Payment Status:</td>
                      <td>
                        <Badge bg={extendedOrder.paymentInfo.status === 'paid' ? 'success' : 'warning'}>
                          {extendedOrder.paymentInfo.status.charAt(0).toUpperCase() + extendedOrder.paymentInfo.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Transaction ID:</td>
                      <td><code>{extendedOrder.paymentInfo.transactionId}</code></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Paid Date:</td>
                      <td>{extendedOrder.paymentInfo.paidDate}</td>
                    </tr>
                    {extendedOrder.paymentInfo.cardLast4 && (
                      <tr>
                        <td className="fw-semibold">Card:</td>
                        <td>**** **** **** {extendedOrder.paymentInfo.cardLast4}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Shipping & Address Information */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Shipping Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Shipping Method:</td>
                      <td>{extendedOrder.shippingInfo.shippingMethod}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Carrier:</td>
                      <td>{extendedOrder.shippingInfo.carrier}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Tracking Number:</td>
                      <td>
                        <code>{extendedOrder.shippingInfo.trackingNumber}</code>
                        <Button variant="link" size="sm" className="p-0 ms-2">
                          <IconifyIcon icon="ri:external-link-line" />
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Shipping Cost:</td>
                      <td>${extendedOrder.shippingInfo.shippingCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Est. Delivery:</td>
                      <td>{extendedOrder.shippingInfo.estimatedDelivery}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Shipping Address</h6>
              </Card.Header>
              <Card.Body>
                <div>
                  <div>{extendedOrder.customerInfo.name}</div>
                  <div>{extendedOrder.shippingAddress.street}</div>
                  <div>{extendedOrder.shippingAddress.city}, {extendedOrder.shippingAddress.region}</div>
                  <div>{extendedOrder.shippingAddress.country} {extendedOrder.shippingAddress.postalCode}</div>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Billing Address</h6>
              </Card.Header>
              <Card.Body>
                <div>
                  <div>{extendedOrder.customerInfo.name}</div>
                  <div>{extendedOrder.billingAddress.street}</div>
                  <div>{extendedOrder.billingAddress.city}, {extendedOrder.billingAddress.region}</div>
                  <div>{extendedOrder.billingAddress.country} {extendedOrder.billingAddress.postalCode}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Order Items */}
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Order Items</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table className="table-sm mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Vendor</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {extendedOrder.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            height="40" 
                            className="me-2 rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                            }}
                          />
                          <div>
                            <div className="fw-semibold">{item.name}</div>
                            <small className="text-muted">ID: {item.productId}</small>
                          </div>
                        </div>
                      </td>
                      <td><code>{item.sku}</code></td>
                      <td>{item.vendor}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td className="fw-semibold">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Order Summary */}
            <div className="border-top mt-3 pt-3">
              <Row>
                <Col md={6}>
                  {/* Order Timeline */}
                  <h6 className="mb-3">Order Timeline</h6>
                  <div className="timeline">
                    {extendedOrder.orderTimeline.map((timeline, index) => (
                      <div key={index} className="d-flex mb-3">
                        <div className="flex-shrink-0">
                          <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                            <IconifyIcon 
                              icon={
                                timeline.status === 'placed' ? 'ri:shopping-cart-line' :
                                timeline.status === 'confirmed' ? 'ri:check-line' :
                                timeline.status === 'processing' ? 'ri:loader-line' :
                                timeline.status === 'shipped' ? 'ri:truck-line' :
                                'ri:map-pin-line'
                              } 
                              className="text-primary"
                            />
                          </div>
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-1">{timeline.description}</h6>
                          <small className="text-muted">{timeline.date} at {timeline.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="mb-3">Order Summary</h6>
                  <Table className="table-borderless">
                    <tbody>
                      <tr>
                        <td>Subtotal:</td>
                        <td className="text-end">${extendedOrder.orderSummary.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Tax:</td>
                        <td className="text-end">${extendedOrder.orderSummary.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Shipping:</td>
                        <td className="text-end">${extendedOrder.orderSummary.shipping.toFixed(2)}</td>
                      </tr>
                      {extendedOrder.orderSummary.discount > 0 && (
                        <tr>
                          <td>Discount:</td>
                          <td className="text-end text-success">-${extendedOrder.orderSummary.discount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="border-top">
                        <td className="fw-bold">Total:</td>
                        <td className="text-end fw-bold">${extendedOrder.orderSummary.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>

                  {/* Refund Information */}
                  {extendedOrder.refundInfo && (
                    <div className="mt-3">
                      <h6 className="mb-2">Refund Information</h6>
                      <Table className="table-borderless table-sm">
                        <tbody>
                          <tr>
                            <td>Refund Amount:</td>
                            <td className="text-end">${extendedOrder.refundInfo.refundAmount.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>Refund Method:</td>
                            <td className="text-end">{extendedOrder.refundInfo.refundMethod}</td>
                          </tr>
                          <tr>
                            <td>Refund Status:</td>
                            <td className="text-end">
                              <Badge bg="success">{extendedOrder.refundInfo.refundStatus}</Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>Refund Date:</td>
                            <td className="text-end">{extendedOrder.refundInfo.refundDate}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        {/* Order Notes */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">Order Notes</h6>
          </Card.Header>
          <Card.Body>
            {extendedOrder.notes.map((note) => (
              <div key={note.id} className="d-flex mb-3">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="ri:message-3-line" className="text-secondary" />
                  </div>
                </div>
                <div className="ms-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1">{note.author}</h6>
                    <small className="text-muted">{note.date}</small>
                  </div>
                  <p className="mb-0">{note.content}</p>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary" onClick={() => onPrintInvoice && onPrintInvoice(order)}>
          <IconifyIcon icon="ri:printer-line" className="me-1" />
          Print Invoice
        </Button>
        
        {/* Status Update Buttons */}
        {order.status === 'pending' && (
          <Button variant="info" onClick={() => handleStatusUpdate('processing')}>
            <IconifyIcon icon="ri:loader-4-line" className="me-1" />
            Mark Processing
          </Button>
        )}
        {order.status === 'processing' && (
          <Button variant="primary" onClick={() => handleStatusUpdate('shipped')}>
            <IconifyIcon icon="ri:truck-line" className="me-1" />
            Mark Shipped
          </Button>
        )}
        {order.status === 'shipped' && (
          <Button variant="success" onClick={() => handleStatusUpdate('delivered')}>
            <IconifyIcon icon="ri:check-double-line" className="me-1" />
            Mark Delivered
          </Button>
        )}
        {(order.status === 'pending' || order.status === 'processing') && (
          <Button variant="danger" onClick={() => handleStatusUpdate('cancelled')}>
            <IconifyIcon icon="ri:close-circle-line" className="me-1" />
            Cancel Order
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailsModal;
