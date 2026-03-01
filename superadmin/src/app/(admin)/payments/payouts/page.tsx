'use client';

import { useState } from 'react';
import { Alert, Badge, Card, Col, Nav, Row } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';

type PayoutTab = 'overview' | 'requests' | 'destinations' | 'rules';

const PayoutsPage = () => {
  const [activeTab, setActiveTab] = useState<PayoutTab>('overview');

  return (
    <>
      <PageTitle title="Payouts" subName="Agency withdrawals, payout destinations, and distribution rules." />

      <Row className="g-3 mb-3">
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Available Balance</div>
              <div className="fs-5 fw-semibold">Not enabled</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Reserved</div>
              <div className="fs-5 fw-semibold">Not enabled</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Paid Out</div>
              <div className="fs-5 fw-semibold">Not enabled</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Requests</div>
              <div className="fs-5 fw-semibold">Not enabled</div>
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
                  Payout Workspace
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  Community Hub Only
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  Personal Hub Excluded
                </Badge>
                <small className="text-muted">
                  This page is reserved for agency-scoped distributable balances. Personal Hub transactions will never appear here.
                </small>
              </div>
            </Col>
            <Col xl={4}>
              <Nav
                variant="pills"
                activeKey={activeTab}
                onSelect={(eventKey) => setActiveTab((eventKey as PayoutTab) || 'overview')}
                className="justify-content-xl-end gap-2 flex-wrap"
              >
                <Nav.Item>
                  <Nav.Link eventKey="overview">Overview</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="requests">Requests</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="destinations">Destinations</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="rules">Rules</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {activeTab === 'overview' && (
            <Alert variant="light" className="mb-0">
              The payout ledger has not been deployed yet. This workspace will show agency-scoped Community Hub balances, reserved funds, and payout-eligible revenue only after the payout schema and backend services are enabled.
            </Alert>
          )}

          {activeTab === 'requests' && (
            <Alert variant="light" className="mb-0">
              No payout requests are available yet. Once the payout engine is enabled, agencies will create withdrawal requests here and superadmins will manage approval and settlement states.
            </Alert>
          )}

          {activeTab === 'destinations' && (
            <Alert variant="light" className="mb-0">
              Payout destinations are not enabled yet. This tab is reserved for verified bank accounts and mobile money payout targets owned by each agency.
            </Alert>
          )}

          {activeTab === 'rules' && (
            <Alert variant="light" className="mb-0">
              Distribution rules are not enabled yet. This tab will control how Community Hub revenue is classified and split between agency, community, and platform balances.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default PayoutsPage;
