"use client";
import ReactApexChart from "react-apexcharts";
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
import { useResidentPerformanceTrends } from "@/hooks/useResidentDashboard";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useState, useMemo } from "react";

const RecentResidents = () => {
  const { data: performanceTrends, isLoading } = useResidentPerformanceTrends();
  const [timeFilter, setTimeFilter] = useState<'month' | 'year' | 'alltime'>('year');

  // Calculate data based on time filter
  const chartData = useMemo(() => {
    if (!performanceTrends) {
      return {
        satisfactionScores: [4.2, 4.3, 4.1, 4.4, 4.5, 4.3, 4.6, 4.4, 4.5, 4.7, 4.6, 4.8],
        communityEngagement: [65, 68, 72, 75, 78, 82, 85, 87, 89, 91, 93, 95],
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        avgSatisfaction: 4.6,
        avgEngagement: 95,
        responseTime: 1.4
      };
    }

    let satisfactionData = performanceTrends.satisfactionScores;
    let engagementData = performanceTrends.communityEngagement;
    let labelsData = performanceTrends.labels;

    if (timeFilter === 'month') {
      // Show last 4 weeks for monthly view
      const weeklyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      satisfactionData = satisfactionData.slice(-4);
      engagementData = engagementData.slice(-4);
      labelsData = weeklyLabels;
    } else if (timeFilter === 'year') {
      // Show full year (default)
      satisfactionData = performanceTrends.satisfactionScores;
      engagementData = performanceTrends.communityEngagement;
      labelsData = performanceTrends.labels;
    } else if (timeFilter === 'alltime') {
      // Show trend over multiple years
      const yearlyLabels = ['2022', '2023', '2024'];
      satisfactionData = [4.1, 4.4, 4.6];
      engagementData = [78, 87, 95];
      labelsData = yearlyLabels;
    }

    const avgSatisfaction = satisfactionData.reduce((a, b) => a + b, 0) / satisfactionData.length;
    const avgEngagement = engagementData[engagementData.length - 1];
    const responseTime = timeFilter === 'month' ? 1.2 : timeFilter === 'year' ? 1.4 : 1.8;

    return {
      satisfactionScores: satisfactionData,
      communityEngagement: engagementData,
      labels: labelsData,
      avgSatisfaction: avgSatisfaction,
      avgEngagement: avgEngagement,
      responseTime: responseTime
    };
  }, [performanceTrends, timeFilter]);

  // Chart options for resident satisfaction trends
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
      opacity: [4, 1],
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
          formatter: function (y: number) {
            if (typeof y !== "undefined") {
              return y.toFixed(1) + " / 5.0";
            }
            return y;
          },
        },
        {
          formatter: function (y: number) {
            if (typeof y !== "undefined") {
              return y.toFixed(0) + "%";
            }
            return y;
          },
        },
      ],
    },
  };

  if (isLoading) {
    return (
      <Col lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Recent Resident Activity</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ height: '330px' }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={12}>
      <Card>
        <CardHeader className="d-flex  justify-content-between align-items-center border-0">
          <div>
            <CardTitle as={"h4"} className="mb-1">
              Resident Satisfaction Trends
            </CardTitle>
            <p className="text-muted mb-0">Community engagement and satisfaction metrics</p>
          </div>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {timeFilter === 'month' ? 'This Month' : timeFilter === 'year' ? 'This Year' : 'All Time'}{" "}
              <IconifyIcon
                className="ms-1"
                width={16}
                height={16}
                icon="ri:arrow-down-s-line"
              />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter('month')}>This Month</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter('year')}>This Year</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter('alltime')}>All Time</DropdownItem>
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
                      {chartData.avgEngagement}%{" "}
                      <span className="text-success font-size-13">
                        +{timeFilter === 'month' ? '8' : timeFilter === 'year' ? '12' : '22'}%{" "}
                        <IconifyIcon icon="mdi:arrow-up" className="ms-1" />
                      </span>
                    </h5>
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="border bg-light-subtle p-2 rounded">
                    <p className="text-muted mb-1">Response Time</p>
                    <h5 className="text-dark mb-1">
                      {chartData.responseTime} days{" "}
                      <span className="text-success font-size-13">
                        -{timeFilter === 'month' ? '0.2' : timeFilter === 'year' ? '0.3' : '0.6'}{" "}
                        <IconifyIcon icon="mdi:arrow-down" className="ms-1" />
                      </span>
                    </h5>
                  </div>
                </Col>
              </Row>
              <ReactApexChart
                key={`satisfaction-trends-${timeFilter}`}
                options={residentOptions}
                series={residentOptions.series}
                height={330}
                type="line"
                className="apex-charts mt-5"
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default RecentResidents;
