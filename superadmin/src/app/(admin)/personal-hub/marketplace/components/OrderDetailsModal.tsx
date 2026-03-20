'use client';

import { Badge, Col, Modal, Row, Table } from 'react-bootstrap';

import type { MarketplaceOrderView } from '@/hooks/useMarketplaceWorkspace';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);

interface OrderDetailsModalProps {
  show: boolean;
  onHide: () => void;
  order: MarketplaceOrderView | null;
}

const OrderDetailsModal = ({ show, onHide, order }: OrderDetailsModalProps) => {
  if (!order) {
    return null;
  }

  const recordedTotal = Number(order.total_amount || 0);
  const recordedFinalAmount = Number(order.final_amount || recordedTotal);
  const recordedAdjustment = recordedFinalAmount - recordedTotal;

  const badgeVariant = order.status === 'delivered'
    ? 'success'
    : order.status === 'cancelled' || order.status === 'refunded'
      ? 'danger'
      : order.status === 'processing' || order.status === 'shipped' || order.status === 'on_the_way'
        ? 'info'
        : 'warning';

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Order {order.order_number}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3 mb-3">
          <Col md={6}>
            <div className="border rounded p-3 h-100">
              <h6 className="mb-3">Order Summary</h6>
              <dl className="mb-0 row">
                <dt className="col-sm-5">Customer</dt>
                <dd className="col-sm-7">{order.customer_name || order.customer_email || order.user_id || 'Resident'}</dd>
                <dt className="col-sm-5">Vendor</dt>
                <dd className="col-sm-7">{order.vendor_name || 'Unassigned'}</dd>
                <dt className="col-sm-5">Created</dt>
                <dd className="col-sm-7">{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</dd>
                <dt className="col-sm-5">Payment Method</dt>
                <dd className="col-sm-7">{order.payment_method || 'Not recorded'}</dd>
                <dt className="col-sm-5">Payment Status</dt>
                <dd className="col-sm-7">{order.payment_status || 'Not recorded'}</dd>
                <dt className="col-sm-5">Status</dt>
                <dd className="col-sm-7"><Badge bg={badgeVariant}>{order.status || 'pending'}</Badge></dd>
              </dl>
            </div>
          </Col>
          <Col md={6}>
            <div className="border rounded p-3 h-100">
              <h6 className="mb-3">Value Breakdown</h6>
              <dl className="mb-0 row">
                <dt className="col-sm-6">Recorded Total</dt>
                <dd className="col-sm-6">{formatCurrency(recordedTotal)}</dd>
                <dt className="col-sm-6">Line Items</dt>
                <dd className="col-sm-6">{order.item_count}</dd>
                <dt className="col-sm-6">Adjustment</dt>
                <dd className="col-sm-6">{formatCurrency(recordedAdjustment)}</dd>
                <dt className="col-sm-6">Final Amount</dt>
                <dd className="col-sm-6 fw-semibold">{formatCurrency(recordedFinalAmount)}</dd>
              </dl>
            </div>
          </Col>
        </Row>

        <div className="border rounded p-3">
          <h6 className="mb-3">Line Items</h6>
          <div className="table-responsive">
            <Table className="table-centered mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.line_items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name || 'Unassigned product'}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
                {order.line_items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-3 text-muted">No line items were recorded for this order.</td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default OrderDetailsModal;
