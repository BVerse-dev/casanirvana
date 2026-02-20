"use client";

import PageTitle from "@/components/PageTitle";
import { Metadata } from "next";
import { useSearchParams } from "next/navigation";
import PaymentDetails from "./components/PaymentDetails";
import PaymentTimeline from "./components/PaymentTimeline";
import PaymentHistory from "./components/PaymentHistory";
import UpcomingPayments from "./components/UpcomingPayments";
import { Row, Col, Alert, Spinner } from "react-bootstrap";
import { useGetPayment } from "@/hooks/usePayments";
import Link from "next/link";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useQueryClient } from "@tanstack/react-query";

// Export metadata via layout.tsx since this is a client component
// export const metadata: Metadata = { title: "Payment Details" };

const PaymentDetailsPage = () => {
  // Get payment ID from the query parameters
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("id");
  const queryClient = useQueryClient();

  // Debug function to clear cache
  const clearCache = () => {
    queryClient.clear();
    console.log("React Query cache cleared");
  };

  // If no payment ID is provided, show an error message
  if (!paymentId) {
    return (
      <>
        <PageTitle title="Payment Details Not Found" subName="Payments" />
        <Alert variant="danger">
          No payment ID provided. Please select a payment from the payments list.
        </Alert>
      </>
    );
  }

  // Fetch payment data
  const { data: payment, isLoading, error } = useGetPayment(paymentId);

  // Show loading state
  if (isLoading) {
    return (
      <>
        <PageTitle title="Loading Payment Details..." subName="Payments" />
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading payment details...</p>
        </div>
      </>
    );
  }

  // Show error state
  if (error || !payment) {
    return (
      <>
        <PageTitle title="Payment Details Error" subName="Payments" />
        <Alert variant="danger">
          <h5>Error Loading Payment</h5>
          <p>{error?.message || "Payment not found"}</p>
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageTitle title={`Payment #${paymentId.substring(0, 8)}`} subName="Payments" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/payments" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Payments
            </Link>
            <button 
              onClick={clearCache}
              className="btn btn-outline-secondary btn-sm"
            >
              <IconifyIcon icon="ri:refresh-line" className="me-1" />
              Clear Cache (Debug)
            </button>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col xl={12}>
          <PaymentDetails payment={payment} />
        </Col>
      </Row>
      
      <Row>
        <Col xl={8} lg={12}>
          <PaymentTimeline payment={payment} />
        </Col>
        <Col xl={4} lg={12}>
          <UpcomingPayments paymentId={paymentId} />
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col xl={12}>
          <PaymentHistory paymentId={paymentId} />
        </Col>
      </Row>
    </>
  );
};

export default PaymentDetailsPage;
