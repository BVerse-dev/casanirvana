"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { chartOptions, StatisticType } from "../data";
import { useListUnits } from "@/hooks/useUnits";
import { useListProfiles } from "@/hooks/useProfiles";
import { useListVisitorPasses } from "@/hooks/useVisitorPasses";
import { useListPayments } from "@/hooks/usePayments";
import { currency } from "@/context/constants";

const StatCard = ({ amount, change, icon, title, variant }: StatisticType) => {
  return (
    <Card>
      <CardBody>
        <Row className="align-items-center justify-content-between">
          <Col xs={6}>
            <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
              <IconifyIcon
                width={32}
                height={32}
                icon={icon}
                className="text-primary"
              />
            </div>
            <p className="text-muted mb-2 mt-3">{title}</p>
            <h3 className="text-dark fw-bold d-flex align-items-center gap-2 mb-0">
              {amount}{" "}
              <span
                className={`badge text-${variant == "danger" ? "danger" : "success"} bg-${variant == "danger" ? "danger" : "success"}-subtle fs-12`}
              >
                {variant == "danger" ? (
                  <IconifyIcon icon="ri:arrow-down-line" />
                ) : (
                  <IconifyIcon icon="ri:arrow-up-line" />
                )}
                {change}%
              </span>
            </h3>
          </Col>
          <Col xs={6}>
            <ReactApexChart
              options={chartOptions}
              series={chartOptions.series}
              height={95}
              type="bar"
              className="apex-charts"
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

const Statistics = () => {
  const { data: unitsResponse } = useListUnits();
  const units = unitsResponse?.data || [];
  const totalUnitsCount = unitsResponse?.count || units.length; // Use the count from pagination
  const { data: profiles = [] } = useListProfiles();
  const { data: todayVisitors = [] } = useListVisitorPasses();
  const { data: payments = [] } = useListPayments();

  // Filter for active residents (users with role 'user')
  const activeResidents = profiles.filter((profile) => profile.role === "user");

  // Filter for today's visitors
  const today = new Date().toISOString().split("T")[0];
  const todayVisitorPasses = todayVisitors.filter(
    (pass) =>
      pass.from_date <= today &&
      pass.to_date >= today &&
      pass.status === "approved",
  );

  // Calculate pending payments total
  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending",
  );
  const pendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const statisticData: StatisticType[] = [
    {
      icon: "solar:buildings-2-broken",
      title: "Total Units",
      amount: totalUnitsCount.toString(),
      change: 7.34,
    },
    {
      icon: "solar:users-group-two-rounded-broken",
      title: "Active Residents",
      amount: activeResidents.length.toString(),
      change: 76.89,
    },
    {
      icon: "solar:shield-user-broken",
      title: "Visitors Today",
      amount: todayVisitorPasses.length.toString(),
      change: 45.0,
      variant: "danger",
    },
    {
      icon: "solar:money-bag-broken",
      title: "Pending Payments",
      amount: `${currency}${(pendingAmount / 1000).toFixed(1)}K`,
      change: 8.76,
    },
  ];

  return (
    <Row>
      {statisticData.map((item, idx) => (
        <Col md={6} xl={3} key={idx}>
          <StatCard {...item} />
        </Col>
      ))}
    </Row>
  );
};

export default Statistics;
