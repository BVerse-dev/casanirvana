'use client';

import { useMemo, useState } from 'react';
import { Alert, Badge, Card, Col, Nav, Row, Spinner, Table } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { useListPaymentObligations, useListPaymentStatements } from '@/hooks/usePayments';

type InvoiceTab = 'all' | 'open' | 'paid' | 'overdue';

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const getStatusVariant = (status?: string | null) => {
  if (status === 'paid') return 'success';
  if (status === 'overdue') return 'danger';
  if (status === 'cancelled') return 'secondary';
  return 'warning';
};

const InvoicesPage = () => {
  const [activeTab, setActiveTab] = useState<InvoiceTab>('all');
  const obligationsQuery = useListPaymentObligations();
  const statementsQuery = useListPaymentStatements();

  const obligations = obligationsQuery.data || [];
  const statements = statementsQuery.data || [];

  const counts = useMemo(() => {
    const open = obligations.filter((item: Record<string, any>) =>
      ['unpaid', 'partially_paid', 'overdue'].includes(item.status)
    ).length;
    const paid = obligations.filter((item: Record<string, any>) => item.status === 'paid').length;
    const overdue = obligations.filter((item: Record<string, any>) => item.status === 'overdue').length;
    return {
      all: obligations.length,
      open,
      paid,
      overdue,
      statements: statements.length,
    };
  }, [obligations, statements]);

  const filteredObligations = useMemo(() => {
    if (activeTab === 'all') return obligations;
    if (activeTab === 'open') {
      return obligations.filter((item: Record<string, any>) =>
        ['unpaid', 'partially_paid', 'overdue'].includes(item.status)
      );
    }
    if (activeTab === 'paid') {
      return obligations.filter((item: Record<string, any>) => item.status === 'paid');
    }
    return obligations.filter((item: Record<string, any>) => item.status === 'overdue');
  }, [activeTab, obligations]);

  const loading = obligationsQuery.isLoading || statementsQuery.isLoading;

  return (
    <>
      <PageTitle title="Invoices" subName="Review issued invoices, obligation status, and statement coverage." />

      <Row className="g-3 mb-3">
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Invoices</div>
              <div className="fs-3 fw-semibold">{counts.all}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Open</div>
              <div className="fs-3 fw-semibold">{counts.open}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Paid</div>
              <div className="fs-3 fw-semibold">{counts.paid}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Statements</div>
              <div className="fs-3 fw-semibold">{counts.statements}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body className="py-3">
          <Row className="g-3 align-items-center">
            <Col xl={8}>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <Badge bg="dark-subtle" text="dark">
                  Invoice Workspace
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  Resident Obligations
                </Badge>
                <small className="text-muted">
                  Issued charges become invoices here. This page tracks open, paid, and overdue obligations without mixing them with raw payment transactions.
                </small>
              </div>
            </Col>
            <Col xl={4}>
              <Nav
                variant="pills"
                activeKey={activeTab}
                onSelect={(eventKey) => setActiveTab((eventKey as InvoiceTab) || 'all')}
                className="justify-content-xl-end gap-2 flex-wrap"
              >
                <Nav.Item>
                  <Nav.Link eventKey="all">All Invoices</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="open">Open</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="paid">Paid</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="overdue">Overdue</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-5 text-center">
            <Spinner animation="border" />
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          <Col xl={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  {activeTab === 'all'
                    ? 'All Invoices'
                    : activeTab === 'open'
                      ? 'Open Invoices'
                      : activeTab === 'paid'
                        ? 'Paid Invoices'
                        : 'Overdue Invoices'}
                </h5>
                <small className="text-muted">Finance operators should use this page for invoice-level review, resend, and follow-up.</small>
              </Card.Header>
              <Card.Body className="p-0">
                {filteredObligations.length === 0 ? (
                  <Alert variant="light" className="m-3 mb-0">
                    No invoices match the current filter.
                  </Alert>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: 560 }}>
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Charge</th>
                          <th>Community</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredObligations.map((item: Record<string, any>) => (
                          <tr key={item.id}>
                            <td className="font-monospace small">{item.invoice_number || '—'}</td>
                            <td>
                              <div className="fw-semibold">{item.title}</div>
                              <small className="text-muted">{item.category || 'Charge'}</small>
                            </td>
                            <td>{item.community?.name || item.society?.name || '—'}</td>
                            <td>{formatDate(item.due_date)}</td>
                            <td>
                              <Badge bg={getStatusVariant(item.status)}>{item.status || 'unpaid'}</Badge>
                            </td>
                            <td className="text-end">GH₵ {Number(item.amount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xl={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Statement Coverage</h5>
                <small className="text-muted">Monthly statements generated from the payment ledger.</small>
              </Card.Header>
              <Card.Body className="p-0">
                {statements.length === 0 ? (
                  <Alert variant="light" className="m-3 mb-0">
                    No statements have been generated yet.
                  </Alert>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: 560 }}>
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Status</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statements.map((statement: Record<string, any>) => (
                          <tr key={statement.id}>
                            <td>
                              <div className="fw-semibold">{statement.title || statement.month_year || 'Statement'}</div>
                              <small className="text-muted">{formatDate(statement.generated_date)}</small>
                            </td>
                            <td>
                              <Badge bg={statement.status === 'ready' ? 'success' : 'warning'}>
                                {statement.status || 'pending'}
                              </Badge>
                            </td>
                            <td className="text-end">GH₵ {Number(statement.total_amount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default InvoicesPage;
