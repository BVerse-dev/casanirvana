"use client";
import React from "react";
import { Row, Col } from "react-bootstrap";
import PaymentMetrics from "./PaymentMetrics";
import PaymentOverviewCard from "./PaymentOverviewCard";
import PaymentStatusCard from "./PaymentStatusCard";

const PaymentGridCard = () => {
  return (
    <>
      {/* Payment Metrics Row */}
      <Row className="mb-4">
        <PaymentMetrics />
      </Row>

      {/* Payment Overview + Collection Status Row */}
      <Row className="mb-4">
        <Col xl={6} lg={12}>
          <PaymentOverviewCard />
        </Col>
        <Col xl={6} lg={12}>
          <PaymentStatusCard />
        </Col>
      </Row>


    </>
  );
};

export default PaymentGridCard;
