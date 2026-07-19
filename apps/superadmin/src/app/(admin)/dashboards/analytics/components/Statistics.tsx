"use client";

import ReactApexChart from "react-apexcharts";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { ApexOptions } from "apexcharts";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import { useAdminAnalyticsDashboard } from "@/hooks/useAdminAnalyticsDashboard";
import { usePaymentAnalyticsSummary } from "@/hooks/usePaymentAnalyticsSummary";

type StatCardProps = {
  amount: string;
  changeLabel?: string;
  icon: string;
  title: string;
  variant?: "success" | "danger";
  series: number[];
};

const buildChartOptions = (series: number[]): ApexOptions => ({
  chart: {
    height: 95,
    parentHeightOffset: 0,
    type: "bar",
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      barHeight: "100%",
      columnWidth: "40%",
      borderRadius: 4,
      distributed: true,
    },
  },
  grid: {
    show: false,
    padding: {
      top: -20,
      bottom: -10,
      left: 0,
      right: 0,
    },
  },
  colors: series.map((value, index) => (index === series.length - 1 && value > 0 ? "#604ae3" : "#eef2f7")),
  dataLabels: {
    enabled: false,
  },
  series: [
    {
      name: "Activity",
      data: series,
    },
  ],
  legend: {
    show: false,
  },
  xaxis: {
    categories: ["S", "M", "T", "W", "T", "F", "S"],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
  tooltip: {
    enabled: true,
  },
});

const percentDelta = (current: number, previous: number) => {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
};

const StatCard = ({ amount, changeLabel, icon, title, variant = "success", series }: StatCardProps) => {
  const chartOptions = buildChartOptions(series);

  return (
    <Card>
      <CardBody>
        <Row className="align-items-center justify-content-between">
          <Col xs={6}>
            <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
              <IconifyIcon width={32} height={32} icon={icon} className="text-primary" />
            </div>
            <p className="text-muted mb-2 mt-3">{title}</p>
            <h3 className="text-dark fw-bold d-flex align-items-center gap-2 mb-0">
              {amount}
              {changeLabel ? (
                <span className={`badge text-${variant} bg-${variant}-subtle fs-12`}>
                  <IconifyIcon icon={variant === "danger" ? "ri:arrow-down-line" : "ri:arrow-up-line"} />
                  {changeLabel}
                </span>
              ) : null}
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
  const { data: dashboard } = useAdminAnalyticsDashboard();
  const { obligations, currentMonthOutstanding } = usePaymentAnalyticsSummary();

  const totalUnitsCount = dashboard?.summary.totalUnits || 0;
  const activeResidentsCount = dashboard?.summary.activeResidents || 0;
  const dailyVisitorSeries = dashboard?.visitorActivity.dailyApprovedSeries || [0, 0, 0, 0, 0, 0, 0];
  const residentSeries = dashboard?.summary.cumulativeResidentSeries || [0, 0, 0, 0, 0, 0, 0];
  const unitSeries = dashboard?.summary.cumulativeUnitSeries || [0, 0, 0, 0, 0, 0, 0];

  const outstandingSeries = Array.from({ length: 7 }, (_, index) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const bucketDate = new Date(startOfToday);
    bucketDate.setDate(bucketDate.getDate() - (6 - index));
    return obligations
      .filter((obligation) => {
        const dueDate = new Date(obligation.due_date || obligation.created_at || bucketDate.toISOString());
        return dueDate <= bucketDate && ["unpaid", "partially_paid", "overdue"].includes(String(obligation.status || "").toLowerCase());
      })
      .reduce((sum, obligation) => sum + Number(obligation.amount || 0), 0);
  });

  const occupiedRate = dashboard?.summary.occupiedRate || 0;
  const visitorDelta = dashboard?.visitorActivity.dayOverDayChangePercentage ?? null;
  const outstandingAmountYesterday = outstandingSeries[outstandingSeries.length - 2] || 0;
  const outstandingDelta = percentDelta(currentMonthOutstanding, outstandingAmountYesterday);

  const statisticData: StatCardProps[] = [
    {
      icon: "solar:buildings-2-broken",
      title: "Total Units",
      amount: totalUnitsCount.toString(),
      changeLabel: `${Math.round(occupiedRate)}% occupied`,
      series: unitSeries,
    },
    {
      icon: "solar:users-group-two-rounded-broken",
      title: "Active Residents",
      amount: activeResidentsCount.toString(),
      series: residentSeries,
    },
    {
      icon: "solar:shield-user-broken",
      title: "Visitors Today",
      amount: String(dashboard?.visitorActivity.todayApprovedCount || 0),
      changeLabel: visitorDelta === null ? undefined : `${Math.abs(visitorDelta).toFixed(1)}%`,
      variant: visitorDelta !== null && visitorDelta < 0 ? "danger" : "success",
      series: dailyVisitorSeries,
    },
    {
      icon: "solar:money-bag-broken",
      title: "Outstanding This Month",
      amount: `${currency}${(currentMonthOutstanding / 1000).toFixed(1)}K`,
      changeLabel: outstandingDelta === null ? undefined : `${Math.abs(outstandingDelta).toFixed(1)}%`,
      variant: outstandingDelta !== null && outstandingDelta > 0 ? "danger" : "success",
      series: outstandingSeries,
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
