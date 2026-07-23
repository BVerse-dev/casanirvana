"use client";

import Link from "next/link";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col } from "react-bootstrap";
import type { ApexOptions } from "apexcharts";
import { currency } from "@/context/constants";
import { usePaymentTrend } from "@/hooks/usePaymentAnalyticsSummary";

const WeeklySales = () => {
  const { error, isLoading, trend } = usePaymentTrend("week");
  const weeklyTotal = trend.reduce((sum, point) => sum + point.collected, 0);

  const options: ApexOptions = {
    chart: { height: 260, parentHeightOffset: 0, type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: "42%", borderRadius: 5, distributed: true } },
    grid: { borderColor: "#eef2f7", strokeDashArray: 4 },
    colors: trend.map((point) => (point.collected > 0 ? "#604ae3" : "#dfe5ec")),
    dataLabels: { enabled: false },
    series: [{ name: "Collections", data: trend.map((point) => point.collected) }],
    legend: { show: false },
    xaxis: {
      categories: trend.map((point) => point.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (value) => `${currency}${(value / 1000).toFixed(0)}K` } },
    tooltip: { y: { formatter: (value) => `${currency}${value.toLocaleString("en-GH", { maximumFractionDigits: 2 })}` } },
  };

  return (
    <Col xl={3} lg={6}>
      <Card className="h-100">
        <CardHeader>
          <CardTitle as="h4" className="mb-1">Weekly Collections</CardTitle>
          <p className="fs-13 mb-0">Completed payments over the last seven days</p>
        </CardHeader>
        <CardBody>
          {isLoading && <div className="placeholder rounded w-100" style={{ height: 260 }} role="status" aria-label="Loading weekly collections" />}
          {error && <div className="text-center text-muted py-5">Weekly collections are unavailable right now.</div>}
          {!isLoading && !error && (
            <>
              <h3 className="fw-bold mb-0">{currency}{weeklyTotal.toLocaleString("en-GH", { maximumFractionDigits: 2 })}</h3>
              <p className="text-muted mb-2">Collected this week</p>
              <ReactApexChart options={options} series={options.series} height={260} type="bar" className="apex-charts" />
            </>
          )}
        </CardBody>
        <CardFooter className="border-top">
          <Link href="/payments" className="link-dark fw-medium">Open Payments</Link>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default WeeklySales;
