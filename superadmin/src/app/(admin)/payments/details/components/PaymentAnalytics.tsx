"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { usePaymentAnalyticsSummary } from "@/hooks/usePaymentAnalyticsSummary";
import { Database } from "@/lib/database.types";
import { Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type Payment = Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
  id: string;
  amount: number;
  unit?: {
    id: string;
    unit_number: string | null;
    block: string | null;
    floor_area: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    society_id: string | null;
    owner_id: string | null;
    tenant_id: string | null;
  } | null;
  payer_profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: string | null;
  } | null;
  society?: {
    id: string;
    name: string;
    address: string | null;
  } | null;
  created_at?: string;
};

interface PaymentAnalyticsProps {
  payment: Payment;
}

const PaymentAnalytics = ({ payment }: PaymentAnalyticsProps) => {
  const { error, payments } = usePaymentAnalyticsSummary();

  if (error) {
    return (
      <Card className="shadow-sm mb-4">
        <CardHeader className="border-bottom bg-transparent py-3">
          <h5 className="mb-0">Payment Status</h5>
        </CardHeader>
        <CardBody className="text-center text-muted py-4">Payment analytics are unavailable right now.</CardBody>
      </Card>
    );
  }

  const relatedPayments = payments.filter((item) => {
    if (item.id === payment.id) return true;

    if (payment.payer_profile?.id && item.payer_profile?.id === payment.payer_profile.id) {
      return true;
    }

    if (payment.unit?.id && item.unit?.id === payment.unit.id) {
      return true;
    }

    if (payment.society?.id && item.society?.id === payment.society.id) {
      return true;
    }

    return false;
  });

  const completedPayments = relatedPayments.filter((item) =>
    ["completed", "paid", "success", "successful"].includes(String(item.status || "").toLowerCase())
  ).length;
  const failedPayments = relatedPayments.filter((item) =>
    ["failed", "cancelled", "canceled", "expired", "rejected"].includes(String(item.status || "").toLowerCase())
  ).length;
  const pendingPayments = relatedPayments.filter((item) =>
    !["completed", "paid", "success", "successful", "failed", "cancelled", "canceled", "expired", "rejected"].includes(
      String(item.status || "").toLowerCase()
    )
  ).length;
  const totalPayments = completedPayments + failedPayments + pendingPayments;
  
  const analyticsData = [
    {
      name: 'Completed',
      value: completedPayments,
      color: '#10b981'
    },
    {
      name: 'Failed', 
      value: failedPayments,
      color: '#ef4444'
    },
    {
      name: 'Pending',
      value: pendingPayments,
      color: '#f59e0b'
    }
  ];

  const completedPercentage = totalPayments > 0 ? Math.round((completedPayments / totalPayments) * 100) : 0;

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="border-bottom bg-transparent py-3">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Payment Status</h5>
          <div className="d-flex align-items-center">
            <IconifyIcon icon="solar:chart-2-broken" className="text-primary fs-18" />
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="align-items-center mb-3">
          <Col lg={7} className="border-end border-light">
            <div className="d-flex align-items-center justify-content-center">
              <div style={{ height: '95px', width: '100px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {analyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
          <Col lg={5}>
            <div className="ps-3">
              <div className="text-center">
                <h5 className="fw-semibold text-success mb-1">{completedPercentage}%</h5>
                <p className="text-muted mb-0 fs-14">Success Rate</p>
              </div>
            </div>
          </Col>
        </Row>
        
        <hr className="my-2" />
        
        <Row>
          <Col lg={12}>
            <div className="mb-1">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
                    <IconifyIcon icon="ri:circle-fill" className="text-success fs-10" />
                  </div>
                  <span className="fw-medium fs-14">Completed</span>
                </div>
                <span className="fw-semibold">{completedPayments}</span>
              </div>
            </div>
            <div className="mb-1">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
                    <IconifyIcon icon="ri:circle-fill" className="text-danger fs-10" />
                  </div>
                  <span className="fw-medium fs-14">Failed</span>
                </div>
                <span className="fw-semibold">{failedPayments}</span>
              </div>
            </div>
            <div className="mb-1">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
                    <IconifyIcon icon="ri:circle-fill" className="text-warning fs-10" />
                  </div>
                  <span className="fw-medium fs-14">Pending</span>
                </div>
                <span className="fw-semibold">{pendingPayments}</span>
              </div>
            </div>
            <hr className="my-1" />
            <div className="mb-0">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
                    <IconifyIcon icon="ri:circle-fill" className="text-muted fs-10" />
                  </div>
                  <span className="fw-medium fs-14">Total</span>
                </div>
                <span className="fw-semibold">{totalPayments}</span>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default PaymentAnalytics;
