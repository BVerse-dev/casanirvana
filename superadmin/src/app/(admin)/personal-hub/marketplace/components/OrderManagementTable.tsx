"use client";

import React, { useState } from 'react';
import { Table, Form, InputGroup, Button, Badge, Dropdown } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import OrderDetailsModal from './OrderDetailsModal';

interface OrderManagementTableProps {
  showFilters?: boolean;
  limit?: number;
}

// Order status types and their corresponding styles
const ORDER_STATUS = {
  pending: { variant: 'warning', icon: 'ri:time-line' },
  processing: { variant: 'info', icon: 'ri:loader-4-line' },
  shipped: { variant: 'primary', icon: 'ri:truck-line' },
  delivered: { variant: 'success', icon: 'ri:check-double-line' },
  cancelled: { variant: 'danger', icon: 'ri:close-circle-line' },
  returned: { variant: 'secondary', icon: 'ri:arrow-go-back-line' },
};

type OrderStatusType = keyof typeof ORDER_STATUS;

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  total: string;
  status: OrderStatusType;
  paymentMethod: string;
  items: number;
}

const DEMO_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2023-0001',
    customer: 'John Doe',
    date: '2023-09-15',
    total: '$129.99',
    status: 'delivered',
    paymentMethod: 'Credit Card',
    items: 3
  },
  {
    id: '2',
    orderNumber: 'ORD-2023-0002',
    customer: 'Sarah Johnson',
    date: '2023-09-16',
    total: '$85.50',
    status: 'processing',
    paymentMethod: 'PayPal',
    items: 2
  },
  {
    id: '3',
    orderNumber: 'ORD-2023-0003',
    customer: 'Michael Brown',
    date: '2023-09-16',
    total: '$210.75',
    status: 'shipped',
    paymentMethod: 'Credit Card',
    items: 4
  },
  {
    id: '4',
    orderNumber: 'ORD-2023-0004',
    customer: 'Emily Wilson',
    date: '2023-09-17',
    total: '$45.99',
    status: 'pending',
    paymentMethod: 'Mobile Money',
    items: 1
  },
  {
    id: '5',
    orderNumber: 'ORD-2023-0005',
    customer: 'David Thompson',
    date: '2023-09-15',
    total: '$320.00',
    status: 'cancelled',
    paymentMethod: 'Credit Card',
    items: 5
  },
  {
    id: '6',
    orderNumber: 'ORD-2023-0006',
    customer: 'Lisa Martinez',
    date: '2023-09-14',
    total: '$78.25',
    status: 'returned',
    paymentMethod: 'Bank Transfer',
    items: 2
  },
  {
    id: '7',
    orderNumber: 'ORD-2023-0007',
    customer: 'Robert Wilson',
    date: '2023-09-13',
    total: '$149.99',
    status: 'delivered',
    paymentMethod: 'Credit Card',
    items: 3
  }
];

const OrderManagementTable: React.FC<OrderManagementTableProps> = ({ 
  showFilters = false,
  limit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  // Filter orders based on search term and status
  const filteredOrders = DEMO_ORDERS.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Apply limit if provided
  const displayOrders = limit ? filteredOrders.slice(0, limit) : filteredOrders;

  const handleViewOrder = (orderId: string) => {
    const order = DEMO_ORDERS.find(o => o.id === orderId);
    if (order) {
      setCurrentOrder(order);
      setShowDetailsModal(true);
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatusType) => {
    console.log(`Update order ${orderId} status to: ${newStatus}`);
    alert(`Successfully updated order status to ${newStatus}`);
  };

  const handleStatusUpdate = (order: Order, newStatus: string) => {
    console.log(`Updating order ${order.id} status to ${newStatus}`);
    alert(`Successfully updated order ${order.orderNumber} status to ${newStatus}`);
  };

  const handlePrintInvoice = (order: Order) => {
    console.log(`Printing invoice for order ${order.id}`);
    alert(`Printing invoice for order ${order.orderNumber}`);
  };

  return (
    <div>
      {showFilters && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <div className="flex-grow-1">
            <InputGroup>
              <InputGroup.Text>
                <IconifyIcon icon="ri:search-line" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          <Form.Select 
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </Form.Select>
          
          <Button variant="outline-secondary">
            <IconifyIcon icon="ri:filter-line" className="me-1" />
            More Filters
          </Button>
          
          <Button variant="outline-secondary">
            <IconifyIcon icon="ri:download-2-line" className="me-1" />
            Export
          </Button>
        </div>
      )}
      
      <div className="table-responsive">
        <Table className="table-centered mb-0">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>{order.items}</td>
                <td><strong>{order.total}</strong></td>
                <td>
                  <Badge bg={ORDER_STATUS[order.status].variant} className="px-2 py-1">
                    <IconifyIcon icon={ORDER_STATUS[order.status].icon} className="me-1" />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </td>
                <td>{order.paymentMethod}</td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm" className="btn-sm">
                      <IconifyIcon icon="ri:more-2-fill" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewOrder(order.id)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handlePrintInvoice(order)}>
                        <IconifyIcon icon="ri:printer-line" className="me-1" />
                        Print Invoice
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Update Status</Dropdown.Header>
                      <Dropdown.Item onClick={() => handleUpdateStatus(order.id, 'processing')}>
                        <IconifyIcon icon="ri:loader-4-line" className="me-1 text-info" />
                        Processing
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                        <IconifyIcon icon="ri:truck-line" className="me-1 text-primary" />
                        Shipped
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                        <IconifyIcon icon="ri:check-double-line" className="me-1 text-success" />
                        Delivered
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
                        <IconifyIcon icon="ri:close-circle-line" className="me-1 text-danger" />
                        Cancelled
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {!limit && displayOrders.length > 0 && (
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div>
            Showing 1-{displayOrders.length} of {filteredOrders.length} orders
          </div>
          <div>
            <Button variant="outline-primary" size="sm" className="me-1">Previous</Button>
            <Button variant="outline-primary" size="sm">Next</Button>
          </div>
        </div>
      )}
      
      {displayOrders.length === 0 && (
        <div className="text-center py-4">
          <IconifyIcon icon="ri:file-search-line" width={40} height={40} className="text-muted" />
          <p className="mt-2">No orders found matching your criteria</p>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        order={currentOrder}
        onStatusUpdate={handleStatusUpdate}
        onPrintInvoice={handlePrintInvoice}
      />
    </div>
  );
};

export default OrderManagementTable;
