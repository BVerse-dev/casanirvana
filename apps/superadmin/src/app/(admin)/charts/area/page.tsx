import { Card, CardBody, CardTitle, Col, Row } from "react-bootstrap";
import UIExamplesList from "@/components/UIExamplesList";
import AllAreaCharts from "./components/AllAreaCharts";
import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Analytics Charts" };

const AreaCharts = () => {
  return (
    <>
      <PageTitle title="Analytics Charts" subName="Charts" />
      <Row>
        <Col xl={9}>
          <Card>
            <CardBody>
              <CardTitle as={"h5"} className="anchor" id="overview">
                Analytics Overview
                <a
                  className="btn btn-sm btn-outline-success rounded-2 float-end"
                  href="https://apexcharts.com/javascript-chart-demos/"
                  target="_blank"
                >
                  Official Website
                </a>
              </CardTitle>
              <p className="text-muted mb-3">
                ApexCharts provides powerful features for society management
                data visualization needs.
              </p>
            </CardBody>
          </Card>
          <AllAreaCharts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#overview", label: "Analytics Overview" },
              { link: "#basic", label: "Resident Distribution" },
              { link: "#spline", label: "Payment Trends" },
              { link: "#datetime", label: "Monthly Collections" },
              { link: "#negative", label: "Expense Analysis" },
              { link: "#stacked", label: "Unit Occupancy" },
              { link: "#timeSeries", label: "Visitor Analytics" },
              { link: "#chart-nullvalues", label: "Maintenance Patterns" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default AreaCharts;
