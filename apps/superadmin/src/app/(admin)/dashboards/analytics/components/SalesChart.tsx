"use client";

import { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";
import { ApexOptions } from "apexcharts";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import { usePaymentTrend } from "@/hooks/usePaymentAnalyticsSummary";

const SalesChart = () => {
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year">("month");
  const { currentMonthCollected, currentMonthOutstanding, error, isLoading, trend } = usePaymentTrend(timeFilter);

  const chartData = useMemo(
    () => ({
      labels: trend.map((point) => point.label),
      series: [
        { name: "Outstanding", data: trend.map((point) => point.outstanding) },
        { name: "Collected", data: trend.map((point) => point.collected) },
      ],
      currentCollected: trend[trend.length - 1]?.collected || 0,
      currentOutstanding: trend[trend.length - 1]?.outstanding || 0,
    }),
    [trend]
  );

  const salesChartOptions: ApexOptions = {
    chart: {
      height: 341,
      type: "area",
      dropShadow: {
        enabled: true,
        opacity: 0.2,
        blur: 10,
        left: -7,
        top: 22,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#fa896b", "#604ae3"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      curve: "smooth",
      width: 2,
      lineCap: "square",
    },
    labels: chartData.labels,
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        show: true,
      },
      labels: {
        offsetX: 0,
        offsetY: 5,
        style: {
          fontSize: "12px",
          cssClass: "apexcharts-xaxis-title",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `${(value / 1000).toFixed(0)}K`,
        offsetX: -15,
        offsetY: 0,
        style: {
          fontSize: "12px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
    },
    grid: {
      borderColor: "#191e3a",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
      padding: {
        top: -50,
        right: 0,
        bottom: 0,
        left: 5,
      },
    },
    legend: {
      show: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.12,
        opacityTo: 0.1,
        stops: [100, 100],
      },
    },
    responsive: [
      {
        breakpoint: 575,
        options: {
          legend: {
            offsetY: -50,
          },
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <Col xl={8}>
        <Card className="overflow-hidden">
          <CardBody>
            <div className="text-center py-5">Loading payment analytics...</div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col xl={8}>
        <Card className="overflow-hidden">
          <CardBody className="text-center py-5 text-muted">Payment analytics are unavailable right now.</CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={8}>
      <Card className="overflow-hidden">
        <CardHeader className="d-flex justify-content-between align-items-center pb-1">
          <div>
            <CardTitle as={"h4"}>Payment Analytics</CardTitle>
          </div>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {timeFilter === "week" ? "Last 7 Days" : timeFilter === "year" ? "Last 3 Years" : "Last 12 Months"}{" "}
              <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter("week")}>Last 7 Days</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("month")}>Last 12 Months</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("year")}>Last 3 Years</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <div className="text-end">
            <p className="mb-0 fs-18 fw-medium text-dark icons-center">
              <IconifyIcon icon="ri:wallet-3-fill" className="me-1" />
              Collections :
              <span className="text-primary fw-bold">&nbsp;{currency}{(currentMonthCollected / 1000).toFixed(1)}K</span>
            </p>
          </div>
          <Row className="align-items-top text-center">
            <Col lg={12}>
              <ReactApexChart
                key={`${timeFilter}-${trend.length}`}
                options={salesChartOptions}
                series={chartData.series}
                height={341}
                type="area"
                className="apex-charts mt-2"
              />
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="p-2 bg-light-subtle text-center">
          <Row className="g-3">
            <Col md={4} className="border-end">
              <p className="text-muted mb-1">Collected</p>
              <p className="text-dark fs-18 fw-medium d-flex align-items-center justify-content-center gap-2 mb-0">
                {currency}{(chartData.currentCollected / 1000).toFixed(2)}K
              </p>
            </Col>
            <Col md={4} className="border-end">
              <p className="text-muted mb-1">Outstanding</p>
              <p className="text-dark fs-18 fw-medium d-flex align-items-center justify-content-center gap-2 mb-0">
                {currency}{(chartData.currentOutstanding / 1000).toFixed(2)}K
              </p>
            </Col>
            <Col md={4}>
              <p className="text-muted mb-1">Current Month Total</p>
              <p className="text-dark fs-18 fw-medium d-flex align-items-center justify-content-center gap-2 mb-0">
                {currency}{((currentMonthCollected + currentMonthOutstanding) / 1000).toFixed(2)}K
              </p>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default SalesChart;
