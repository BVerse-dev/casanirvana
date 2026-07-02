'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Badge, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const PaymentValidationRules = () => {
  const [category, setCategory] = useState<'all' | 'general' | 'utilities' | 'tv'>('all');
  const { providers, loading, error } = useAdminPersonalHubCatalog({ serviceType: 'bill_payment' });

  const filteredProviders = useMemo(() => {
    if (category === 'all') {
      return providers;
    }
    if (category === 'general') {
      return providers.filter((provider) => !provider.bill_category || provider.bill_category === 'general');
    }
    return providers.filter((provider) => provider.bill_category === category);
  }, [category, providers]);

  const supportsQueryCount = filteredProviders.filter((provider) => provider.supports_query).length;
  const supportsStatusCount = filteredProviders.filter((provider) => provider.supports_status).length;
  const enabledCount = filteredProviders.filter((provider) => provider.is_enabled_for_app && provider.is_active).length;

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">Provider Validation Requirements</Card.Title>
      </Card.Header>
      <Card.Body>
        <Alert variant="light" className="border mb-3">
          <div className="d-flex align-items-start gap-2">
            <IconifyIcon icon="ri:shield-check-line" className="fs-5 mt-1 text-primary" />
            <div>
              Bill-payment validation is enforced through ExpressPay provider capabilities, not through editable local rules. Use this workspace to verify which billers support account query, payment execution, and status reconciliation before exposing them to residents.
            </div>
          </div>
        </Alert>

        <Row className="g-3 mb-3">
          <Col xl={3} md={6}>
            <Card className="border h-100"><Card.Body><div className="text-muted small mb-1">Billers in scope</div><div className="fs-4 fw-semibold">{filteredProviders.length.toLocaleString('en-GH')}</div></Card.Body></Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border h-100"><Card.Body><div className="text-muted small mb-1">Supports query</div><div className="fs-4 fw-semibold">{supportsQueryCount.toLocaleString('en-GH')}</div></Card.Body></Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border h-100"><Card.Body><div className="text-muted small mb-1">Supports status</div><div className="fs-4 fw-semibold">{supportsStatusCount.toLocaleString('en-GH')}</div></Card.Body></Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="border h-100"><Card.Body><div className="text-muted small mb-1">Enabled in app</div><div className="fs-4 fw-semibold">{enabledCount.toLocaleString('en-GH')}</div></Card.Body></Card>
          </Col>
        </Row>

        <Row className="g-3 mb-3">
          <Col xl={3} md={4}>
            <Form.Group>
              <Form.Label>Bill category</Form.Label>
              <Form.Select value={category} onChange={(event) => setCategory(event.target.value as 'all' | 'general' | 'utilities' | 'tv')}>
                <option value="all">All categories</option>
                <option value="utilities">Utilities</option>
                <option value="tv">TV & subscriptions</option>
                <option value="general">General</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading provider capabilities...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : filteredProviders.length === 0 ? (
          <Alert variant="warning" className="mb-0">No bill-payment providers were found for the selected category.</Alert>
        ) : (
          <div className="table-responsive">
            <Table className="table-centered align-middle table-nowrap mb-0">
              <thead className="table-light">
                <tr>
                  <th>Biller</th>
                  <th>Category</th>
                  <th>Service Code</th>
                  <th>Query</th>
                  <th>Pay</th>
                  <th>Status</th>
                  <th>App Visibility</th>
                  <th>Last Synced</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.map((provider) => (
                  <tr key={provider.id}>
                    <td>
                      <div className="fw-semibold">{provider.provider_name}</div>
                    </td>
                    <td className="text-capitalize">{provider.bill_category || 'general'}</td>
                    <td>{provider.external_service_code || '—'}</td>
                    <td>
                      <Badge bg={provider.supports_query ? 'success' : 'secondary'}>
                        {provider.supports_query ? 'Required' : 'Not exposed'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={provider.supports_pay ? 'success' : 'secondary'}>
                        {provider.supports_pay ? 'Enabled' : 'Blocked'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={provider.supports_status ? 'info' : 'secondary'}>
                        {provider.supports_status ? 'Tracked' : 'No status rail'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={provider.is_enabled_for_app && provider.is_active ? 'primary' : 'secondary'}>
                        {provider.is_enabled_for_app && provider.is_active ? 'Visible' : 'Hidden'}
                      </Badge>
                    </td>
                    <td>{formatDateTime(provider.last_synced_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PaymentValidationRules;
