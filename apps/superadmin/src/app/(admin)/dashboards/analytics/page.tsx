import PageTitle from "@/components/PageTitle";
import { Row } from "react-bootstrap";
import BalanceCard from "./components/BalanceCard";
import SalesChart from "./components/SalesChart";
import SocialSource from "./components/SocialSource";
import Statistics from "./components/Statistics";
import Transaction from "./components/Transaction";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Casa Nirvana Dashboard" };

const AnalyticsPage = () => {
  return (
    <>
      <PageTitle title="Casa Nirvana Dashboard" subName="Overview" />
      <Statistics />
      <Row>
        <SalesChart />
        <BalanceCard />
      </Row>
      <SocialSource />
      <Transaction />
    </>
  );
};

export default AnalyticsPage;
