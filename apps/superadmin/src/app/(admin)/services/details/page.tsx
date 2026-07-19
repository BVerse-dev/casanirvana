import { Col, Row } from "react-bootstrap";
import { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import ServiceDetailsHeader from "./components/ServiceDetailsHeader";
import ServiceOverview from "./components/ServiceOverview";
import ServiceRequestsTable from "./components/ServiceRequestsTable";
import ServiceStatsCards from "./components/ServiceStatsCards";

export const metadata: Metadata = { title: "Service Details" };

const ServiceDetailsPage = () => {
  return (
    <>
      <PageTitle title="Service Details" subName="Operations" />
      <ServiceDetailsHeader />
      <ServiceStatsCards />
      <ServiceOverview />
      <Row>
        <Col xl={12}>
          <ServiceRequestsTable />
        </Col>
      </Row>
    </>
  );
};

export default ServiceDetailsPage;
