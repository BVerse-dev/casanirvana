import PageTitle from "@/components/PageTitle";
import GuardsByLocation from "./components/CustomerByCountry";
import GuardCountry from "./components/CustomerCountry";
import GuardsInvestment from "./components/CustomersInvest";
import TopGuardProfile from "./components/PropertyInvestor";
import TopGuards from "./components/TopCustomer";
import GuardVisits from "./components/CustomerVisit";
import GuardAssignments from "./components/PurchaseProperty";
import { Col, Row } from "react-bootstrap";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Guards Dashboard" };

const GuardsPage = () => {
  return (
    <>
      <PageTitle title="Guards Dashboard" subName="Analytics" />
        <Row>
          <Col xl={8} lg={12}>
            <GuardCountry />
          </Col>
        <TopGuardProfile />
      </Row>
      <Row>
        <GuardsInvestment />
        <GuardsByLocation />
      </Row>
      <Row>
        <TopGuards />
        <GuardVisits />
        <GuardAssignments />
      </Row>
    </>
  );
};

export default GuardsPage;
