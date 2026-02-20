import PageTitle from "@/components/PageTitle";
import React from "react";
import EmergencyAlertsView from "./components/EmergencyAlertsView";
import EmergencyAlertsOverview from "./components/EmergencyAlertsOverview";
import { Card, Row } from "react-bootstrap";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Emergency Alerts" };

const EmergencyAlertsPage = () => {
  return (
    <>
      <PageTitle title="Emergency Alerts" subName="Community Management" />
      <EmergencyAlertsOverview />
      <Card>
        <Row className="g-0">
          <EmergencyAlertsView />
        </Row>
      </Card>
    </>
  );
};

export default EmergencyAlertsPage;
