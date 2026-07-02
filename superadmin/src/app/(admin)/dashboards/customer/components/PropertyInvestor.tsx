"use client";

import avatar2 from "@/assets/images/users/avatar-2.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardDashboardSnapshot, useGuardPerformanceTrends } from "@/hooks/useGuardDashboard";
import Image from "next/image";
import Link from "next/link";
import ReactApexChart from "react-apexcharts";
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col } from "react-bootstrap";

const TopGuardProfile = () => {
  const { data: dashboard, isLoading: snapshotLoading } = useGuardDashboardSnapshot();
  const { data: performanceTrends, isLoading: trendsLoading } = useGuardPerformanceTrends();
  const topGuard = dashboard?.topGuardProfile || null;

  const isLoading = trendsLoading || snapshotLoading;
  const guardPhone = topGuard?.contactPhone || "";
  const guardContactHref = guardPhone ? `tel:${guardPhone}` : "";

  const guardPerformanceOptions = {
    chart: {
      height: 182,
      parentHeightOffset: 0,
      type: "bar" as const,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        barHeight: "100%",
        columnWidth: "30%",
        borderRadius: 4,
        distributed: false,
      },
    },
    grid: {
      show: true,
      padding: {
        top: -20,
        bottom: -10,
        left: 0,
        right: 0,
      },
    },
    colors: ["#604ae3"],
    dataLabels: {
      enabled: false,
    },
    series: [
      {
        name: "Performance",
        data: performanceTrends?.performanceScores || [],
      },
    ],
    legend: {
      show: false,
    },
    xaxis: {
      categories: performanceTrends?.labels || [],
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
      y: [
        {
          formatter: (value: number) => (typeof value === "number" ? `${value.toFixed(1)}%` : value),
        },
      ],
    },
  };

  if (isLoading) {
    return (
      <Col xl={4}>
        <Card>
          <CardHeader>
            <CardTitle>Top Guard Performance</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="placeholder rounded-circle" style={{ width: "80px", height: "80px" }}></div>
                <div className="flex-grow-1">
                  <span className="placeholder col-6"></span>
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-8"></span>
                </div>
              </div>
              <div className="placeholder" style={{ height: "182px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (!topGuard) {
    return (
      <Col xl={4}>
        <Card>
          <CardHeader>
            <CardTitle>Top Guard Performance</CardTitle>
          </CardHeader>
          <CardBody className="text-center text-muted py-5">No guard performance reviews are available yet.</CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={4}>
      <Card>
        <CardHeader>
          <CardTitle>Top Guard Performance</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="d-flex align-items-center gap-3">
            <Image
              src={topGuard?.avatar || avatar2}
              className="rounded avatar-xl img-thumbnail"
              alt="guard-profile"
              width={80}
              height={80}
            />
            <div>
              <h4 className="mb-1">
                <Link href={`/guards/details?id=${topGuard.guardId}`} className="mb-1 link-dark fw-semibold">
                  {topGuard.guardName}
                </Link>
              </h4>
              <p className="link-primary fw-medium fs-14 mb-2">Rating: {topGuard.overallRating.toFixed(1)}/5.0</p>
              <ul className="list-inline d-flex flex-wrap gap-1 mb-0 align-items-center">
                <li className="list-inline-item">
                  <Button variant="soft-primary" className="d-flex align-items-center justify-content-center avatar-sm" title={`Punctuality: ${topGuard.punctualityRating.toFixed(1)}`}>
                    <span>
                      <IconifyIcon width={16} height={16} icon="ri:time-line" />
                    </span>
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="soft-success" className="d-flex align-items-center justify-content-center avatar-sm" title={`Reliability: ${topGuard.reliabilityRating.toFixed(1)}`}>
                    <span>
                      <IconifyIcon width={16} height={16} icon="ri:shield-check-line" />
                    </span>
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="soft-info" className="d-flex align-items-center justify-content-center avatar-sm" title={`Communication: ${topGuard.communicationRating.toFixed(1)}`}>
                    <span>
                      <IconifyIcon width={16} height={16} icon="ri:message-3-line" />
                    </span>
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="soft-warning" className="d-flex align-items-center justify-content-center avatar-sm" title={`Attendance: ${topGuard.attendancePercentage.toFixed(1)}%`}>
                    <span>
                      <IconifyIcon width={16} height={16} icon="ri:calendar-check-line" />
                    </span>
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="soft-danger" className="d-flex align-items-center justify-content-center avatar-sm" title={`Incidents: ${topGuard.incidentReports || 0}`}>
                    <span>
                      <IconifyIcon width={16} height={16} icon="ri:alert-line" />
                    </span>
                  </Button>
                </li>
              </ul>
            </div>
          </div>
          {performanceTrends?.performanceScores?.length ? (
            <div>
              <ReactApexChart
                options={guardPerformanceOptions}
                series={guardPerformanceOptions.series}
                height={182}
                type="bar"
                className="apex-charts mt-3"
              />
            </div>
          ) : (
            <p className="text-muted mt-4 mb-0">No monthly performance trend is available for charting yet.</p>
          )}
        </CardBody>
        <CardFooter className="border-top border-dashed gap-1 hstack">
          <Link href={`/guards/details?id=${topGuard.guardId}`} className="btn btn-primary w-100">
            View Profile
          </Link>
          {guardContactHref ? (
            <Button as={"a"} href={guardContactHref} variant="light" className="w-100">
              Contact Guard
            </Button>
          ) : (
            <Button variant="light" className="w-100" disabled>
              No Phone On File
            </Button>
          )}
        </CardFooter>
      </Card>
    </Col>
  );
};

export default TopGuardProfile;
