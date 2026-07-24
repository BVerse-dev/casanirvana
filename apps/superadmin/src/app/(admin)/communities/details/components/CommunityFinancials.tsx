"use client";

import { Alert, Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";

type CommunityFinancialsSummary = {
  maintenanceCharge: number;
  occupiedUnits: number;
  totalUnits: number;
  securityDeposit: number;
  parkingSlots: number;
  totalAreaSqft: number;
};

interface CommunityFinancialsProps {
  summary: CommunityFinancialsSummary;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);

const CommunityFinancials = ({ summary }: CommunityFinancialsProps) => {
  const estimatedRecurringRevenue = summary.maintenanceCharge * summary.occupiedUnits;
  const potentialFullOccupancyRevenue = summary.maintenanceCharge * summary.totalUnits;

  const cards = [
    {
      title: "Maintenance Charge",
      value: formatMoney(summary.maintenanceCharge),
      subtitle: "Per occupied unit",
      icon: "solar:wallet-money-bold-duotone",
      color: "success",
    },
    {
      title: "Current Billing Potential",
      value: formatMoney(estimatedRecurringRevenue),
      subtitle: `${summary.occupiedUnits} occupied units`,
      icon: "solar:chart-2-bold-duotone",
      color: "primary",
    },
    {
      title: "Full Occupancy Potential",
      value: formatMoney(potentialFullOccupancyRevenue),
      subtitle: `${summary.totalUnits} total units`,
      icon: "solar:graph-new-bold-duotone",
      color: "info",
    },
    {
      title: "Security Deposit",
      value: formatMoney(summary.securityDeposit),
      subtitle: "Configured deposit per unit",
      icon: "solar:shield-check-bold-duotone",
      color: "warning",
    },
  ];

  return (
    <Row className="mb-4">
      <Col lg={12} className="mb-4">
        <Row>
          {cards.map((card) => (
            <Col lg={3} md={6} className="mb-3" key={card.title}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted mb-1">{card.title}</div>
                      <h4 className="mb-1">{card.value}</h4>
                      <div className="text-muted small">{card.subtitle}</div>
                    </div>
                    <div className={`avatar-lg rounded-circle bg-${card.color}-subtle d-flex align-items-center justify-content-center`}>
                      <IconifyIcon icon={card.icon} className={`fs-24 text-${card.color}`} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      <Col lg={8}>
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Operational Totals</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small mb-1">Parking Slots</div>
                  <h4 className="mb-0">{summary.parkingSlots}</h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small mb-1">Known Unit Area</div>
                  <h4 className="mb-0">
                    {summary.totalAreaSqft > 0 ? `${summary.totalAreaSqft.toLocaleString()} sqft` : "Not recorded"}
                  </h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small mb-1">Vacant Units</div>
                  <h4 className="mb-0">{Math.max(summary.totalUnits - summary.occupiedUnits, 0)}</h4>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      <Col lg={4}>
        <Alert variant="info" className="h-100 mb-0">
          <div className="fw-semibold mb-2">Truthful Launch Note</div>
          Community-scoped payment collection history is not surfaced on this page yet. Use the audited Payments module for live transactions and obligations until the community financial read model is added.
        </Alert>
      </Col>
    </Row>
  );
};

export default CommunityFinancials;
