'use client';

import { useMemo, useState } from 'react';
import { Badge, Dropdown, Form, InputGroup, Spinner, Table } from 'react-bootstrap';

import type { MarketplaceOrderView } from '@/hooks/useMarketplaceWorkspace';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import OrderDetailsModal from './OrderDetailsModal';

interface OrderManagementTableProps {
  orders: MarketplaceOrderView[];
  loading?: boolean;
  showFilters?: boolean;
  limit?: number;
  onUpdateStatus: (order: MarketplaceOrderView, nextStatus: string) => void;
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'on_the_way', 'delivered', 'cancelled', 'refunded'];
const formatCurrency = (value: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);

const getStatusVariant = (status: string | null) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'cancelled':
    case 'refunded':
      return 'danger';
    case 'processing':
    case 'shipped':
    case 'on_the_way':
      return 'info';
    default:
      return 'warning';
  }
};

const OrderManagementTable = ({ orders, loading = false, showFilters = false, limit, onUpdateStatus }: OrderManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrderView | null>(null);

  const visibleOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch = [order.order_number, order.customer_name || '', order.customer_email || '', order.vendor_name || '']
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (order.status || 'pending') === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return limit ? filtered.slice(0, limit) : filtered;
  }, [limit, orders, searchTerm, statusFilter]);

  if (loading) {
    return <div className="py-4 text-center"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      {showFilters ? (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <div className="flex-grow-1">
            <InputGroup>
              <InputGroup.Text><IconifyIcon icon="ri:search-line" /></InputGroup.Text>
              <Form.Control placeholder="Search orders..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </InputGroup>
          </div>
          <Form.Select style={{ width: 'auto' }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
          </Form.Select>
        </div>
      ) : null}

      <div className="table-responsive">
        <Table className="table-centered mb-0">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>
                  <div>{order.customer_name || 'Resident'}</div>
                  <div className="text-muted small">{order.customer_email || order.user_id || 'No profile linked'}</div>
                </td>
                <td>{order.vendor_name || 'Unassigned'}</td>
                <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</td>
                <td>{order.item_count}</td>
                <td>{formatCurrency(order.final_amount || order.total_amount || 0)}</td>
                <td><Badge bg={getStatusVariant(order.status)}>{order.status || 'pending'}</Badge></td>
                <td>{order.payment_method || order.payment_status || 'Not recorded'}</td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm"><IconifyIcon icon="ri:more-2-fill" /></Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setSelectedOrder(order)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" /> View Details
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Update Status</Dropdown.Header>
                      {ORDER_STATUSES.filter((status) => status !== (order.status || 'pending')).map((status) => (
                        <Dropdown.Item key={status} onClick={() => onUpdateStatus(order, status)}>
                          <IconifyIcon icon="ri:refresh-line" className="me-1" /> {status.replace(/_/g, ' ')}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
            {visibleOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-muted">No marketplace orders found.</td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </div>
      <OrderDetailsModal show={Boolean(selectedOrder)} onHide={() => setSelectedOrder(null)} order={selectedOrder} />
    </div>
  );
};

export default OrderManagementTable;
