import PageTitle from "@/components/PageTitle";
import { Col, Row } from "react-bootstrap";
import ResidentPayments from "./components/CollectionRent";
import ResidentSatisfaction from "./components/Goals";
import RecentResidentsCard from "./components/JoinAgent";
import RecentResidents from "./components/RecentAgent";
import ResidentOnboarding from "./components/SalesFunnel";
import ResidentsBySociety from "./components/SessionsCountry";
import Statistics from "./components/Statistics";
import TopResidents from "./components/TopAgents";
import ResidentRevenue from "./components/TotalRevenue";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Resident Dashboard" };

const AgentPage = () => {
  return (
    <>
      <PageTitle title="Resident Dashboard" subName="Management" />
      <Row>
        <Statistics />
      </Row>
      <Row>
        <Col xl={9}>
          <Row>
            <ResidentOnboarding />
            <ResidentRevenue />
          </Row>
          <Row>
            <RecentResidents />
          </Row>
          <Row>
            <ResidentPayments />
            <ResidentsBySociety />
          </Row>
        </Col>
        <Col xl={3}>
          <TopResidents />
          <ResidentSatisfaction />
          <RecentResidentsCard />
        </Col>
      </Row>
    </>
  );
};

export default AgentPage;
