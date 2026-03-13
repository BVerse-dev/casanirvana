"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useResidentPerformanceTrends } from "@/hooks/useResidentDashboard";
import ReactApexChart from "react-apexcharts";
import { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";

const computeDelta = (series: number[]) => {
  const nonZeroValues = series.filter((value) => Number.isFinite(value) && value > 0);
  if (nonZeroValues.length < 2) return null;
  const first = nonZeroValues[0];
  const last = nonZeroValues[nonZeroValues.length - 1];
  if (first === 0) return null;
  return ((last - first) / first) * 100;
};

const RecentResidents = () => {
  const { data: performanceTrends, error, isLoading } = useResidentPerformanceTrends();
  const [timeFilter, setTimeFilter] = useState<"month" | "year" | "all">("year");

  const chartData = useMemo(() => {
    if (!performanceTrends) {
      return {
        satisfactionScores: [] as number[],
        communityEngagement: [] as number[],
        labels: [] as string[],
        avgSatisfaction: 0,
        avgEngagement: 0,
        responseTime: 0,
        engagementDelta: null as number | null,
        responseDelta: null as number | null,
      };
    }

    let labels = performanceTrends.labels;
    let satisfactionScores = performanceTrends.satisfactionScores;
    let communityEngagement = performanceTrends.communityEngagement;
    let maintenanceResponseTime = performanceTrends.maintenanceResponseTime;

    if (timeFilter === "month") {
      labels = labels.slice(-4);
      satisfactionScores = satisfactionScores.slice(-4);
      communityEngagement = communityEngagement.slice(-4);
      maintenanceResponseTime = maintenanceResponseTime.slice(-4);
    }

    const satisfactionValues = satisfactionScores.filter((value) => value > 0);
    const engagementValues = communityEngagement.filter((value) => value > 0);
    const responseValues = maintenanceResponseTime.filter((value) => value > 0);

    return {
      satisfactionScores,
      communityEngagement,
      labels,
      avgSatisfaction:
        satisfactionValues.length > 0
          ? satisfactionValues.reduce((sum, value) => sum + value, 0) / satisfactionValues.length
          : 0,
      avgEngagement: engagementValues[engagementValues.length - 1] || 0,
      responseTime: responseValues[responseValues.length - 1] || 0,
      engagementDelta: computeDelta(communityEngagement),
      responseDelta: computeDelta(maintenanceResponseTime),
    };
  }, [performanceTrends, timeFilter]);

  const residentOptions = {
    series: [
      {
        name: "Satisfaction Score",
        type: "bar" as const,
        data: chartData.satisfactionScores,
      },
      {
        name: "Community Engagement",
        type: "line" as const,
        data: chartData.communityEngagement,
      },
    ],
    chart: {
      height: 330,
      type: "line" as const,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight" as const,
      dashArray: [0, 8],
      width: [0, 2],
    },
    fill: {
      opacity: [0.4, 1],
    },
    markers: {
      size: [0, 0],
      strokeWidth: 2,
      hover: {
        size: 4,
      },
    },
    xaxis: {
      categories: chartData.labels,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    grid: {
      show: true,
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
        top: 0,
        right: -2,
        bottom: 15,
        left: 10,
      },
    },
    legend: {
      show: true,
      horizontalAlign: "center" as const,
      offsetX: 0,
      offsetY: -5,
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "30%",
        barHeight: "70%",
      },
    },
    colors: ["#604ae3", "#fa896b"],
    tooltip: {
      shared: true,
      y: [
        {
          formatter: (value: number) => (typeof value === "number" ? `${value.toFixed(1)} / 5.0` : value),
        },
        {
          formatter: (value: number) => (typeof value === "number" ? `${value.toFixed(0)}%` : value),
        },
      ],
    },
  };

  if (isLoading) {
    return (
      <Col lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Resident Satisfaction Trends</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ height: "330px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Resident Satisfaction Trends</CardTitle>
          </CardHeader>
          <CardBody className="text-center text-muted py-5">
            Satisfaction and engagement trends are unavailable right now.
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={12}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as={"h4"} className="mb-1">
              Resident Satisfaction Trends
            </CardTitle>
            <p className="text-muted mb-0">Feedback scores, login engagement, and maintenance response timing</p>
          </div>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {timeFilter === "month" ? "Last 4 Months" : timeFilter === "all" ? "All Available" : "This Year"}{" "}
              <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter("month")}>Last 4 Months</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("year")}>This Year</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("all")}>All Available</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <Row className="align-items-center g-2">
            <Col lg={12}>
              <Row className="g-2 text-center">
                <Col lg={4}>
                  <div className="border bg-light-subtle p-2 rounded">
                    <p className="text-muted mb-1">Avg Satisfaction</p>
                    <h5 className="text-dark mb-1">{chartData.avgSatisfaction.toFixed(1)} / 5.0</h5>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="border bg-light-subtle p-2 rounded">
                    <p className="text-muted mb-1">Community Engagement</p>
                    <h5 className="text-dark mb-1">
                      {chartData.avgEngagement.toFixed(0)}%
                      {chartData.engagementDelta !== null ? (
                        <span
                          className={`ms-2 font-size-13 ${
                            chartData.engagementDelta >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {chartData.engagementDelta >= 0 ? "+" : ""}
                          {chartData.engagementDelta.toFixed(1)}%
                          <IconifyIcon
                            icon={chartData.engagementDelta >= 0 ? "mdi:arrow-up" : "mdi:arrow-down"}
                            className="ms-1"
                          />
                        </span>
                      ) : null}
                    </h5>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="border bg-light-subtle p-2 rounded">
                    <p className="text-muted mb-1">Response Time</p>
                    <h5 className="text-dark mb-1">
                      {chartData.responseTime.toFixed(1)} days
                      {chartData.responseDelta !== null ? (
                        <span
                          className={`ms-2 font-size-13 ${
                            chartData.responseDelta <= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {chartData.responseDelta >= 0 ? "+" : ""}
                          {chartData.responseDelta.toFixed(1)}%
                          <IconifyIcon
                            icon={chartData.responseDelta <= 0 ? "mdi:arrow-down" : "mdi:arrow-up"}
                            className="ms-1"
                          />
                        </span>
                      ) : null}
                    </h5>
                  </div>
                </Col>
              </Row>
              {chartData.labels.length > 0 ? (
                <ReactApexChart
                  key={`satisfaction-trends-${timeFilter}`}
                  options={residentOptions}
                  series={residentOptions.series}
                  height={330}
                  type="line"
                  className="apex-charts mt-5"
                />
              ) : (
                <div className="text-center text-muted py-5">
                  No resident feedback or engagement history has been recorded yet.
                </div>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default RecentResidents;
