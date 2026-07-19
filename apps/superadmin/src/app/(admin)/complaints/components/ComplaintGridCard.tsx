"use client";
import React from "react";
import { Row, Col } from "react-bootstrap";
import ComplaintOverviewCard from "./ComplaintOverviewCard";
import ComplaintMetrics from "./ComplaintMetrics";

import ComplaintProgressCard from "./ComplaintProgressCard";

const ComplaintGridCard = () => {
  return (
    <>
      {/* Complaint Metrics Row */}
      <Row className="mb-4">
        <ComplaintMetrics />
      </Row>

      {/* Welcome Admin + Progress Card Row - Side by Side */}
      <Row className="mb-4">
        <Col xl={6} lg={12} className="mb-4 mb-xl-0">
          <ComplaintOverviewCard />
        </Col>
        <Col xl={6} lg={12}>
          <ComplaintProgressCard />
        </Col>
      </Row>
    </>
  );
};

export default ComplaintGridCard;
