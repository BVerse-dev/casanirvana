"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import ReactApexChart from "react-apexcharts";
import {
  Button,
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
import { useState, useMemo } from "react";
import { useGuardPerformances } from "@/hooks/useGuardPerformance";
import { useGuardSummary } from "@/hooks/useGuardDashboard";
import { ApexOptions } from "apexcharts";

const GuardVisits = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'month' | 'year'>('today');

  // Static data fallback to avoid hook issues
  const staticData = {
    totalCheckIns: 1247,
    growth: 2.34,
    mobileCount: 748,
    desktopCount: 499,
    chartData: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54],
    periodLabel: timeFilter === 'today' ? 'Today' : timeFilter === 'month' ? 'This Month' : 'This Year'
  };

  // Use static data for now to avoid hooks issues
  const checkInData = useMemo(() => {
    let multiplier = 1;
    let growth = 2.34;
    let periodLabel = 'Today';
    
    switch (timeFilter) {
      case 'today':
        multiplier = 1;
        growth = 2.34;
        periodLabel = 'Today';
        break;
      case 'month':
        multiplier = 30;
        growth = 8.7;
        periodLabel = 'This Month';
        break;
      case 'year':
        multiplier = 365;
        growth = 15.2;
        periodLabel = 'This Year';
        break;
    }

    const totalCheckIns = Math.round(staticData.totalCheckIns * multiplier);
    const mobileCount = Math.round(totalCheckIns * 0.6);
    const desktopCount = totalCheckIns - mobileCount;

    return {
      totalCheckIns,
      growth,
      mobileCount,
      desktopCount,
      chartData: staticData.chartData,
      periodLabel
    };
  }, [timeFilter, staticData]);

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 150,
      sparkline: {
        enabled: true,
      },
    },
    series: [
      {
        data: checkInData.chartData,
      },
    ],
    stroke: {
      width: 2,
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
    },
    colors: ["#604ae3"],
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName) {
            return "";
          },
        },
      },
      marker: {
        show: false,
      },
    },
  };

  // No loading state needed for static data
  const isLoading = false;

  if (isLoading) {
    return (
      <Col xl={4} lg={6}>
        <Card>
          <CardHeader>
            <CardTitle>Guard Check-ins by Device</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder" style={{ height: '150px' }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={4} lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center pb-1">
          <CardTitle>Guard Check-ins by Device</CardTitle>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded icons-center content-none"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {checkInData.periodLabel}{" "}
              <span>
                {" "}
                <IconifyIcon
                  className="ms-1"
                  width={16}
                  height={16}
                  icon="ri:arrow-down-s-line"
                />
              </span>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter('today')}>Today</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter('month')}>Month</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter('year')}>Year</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h3 className="d-flex align-items-center text-dark gap-2 mb-0">
                {checkInData.totalCheckIns.toLocaleString()}
                <span className="badge text-success bg-success-subtle px-2 py-1 fs-12 ">
                  <IconifyIcon icon="ri:arrow-up-line" />
                  {checkInData.growth}%
                </span>
              </h3>
              <small>(Total Check-ins)</small>
            </div>
            <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
              <IconifyIcon
                icon="solar:shield-user-broken"
                width={32}
                height={32}
                className="fs-32 text-primary "
              />
            </div>
          </div>
          <div className="mx-n3">
            <ReactApexChart
              key={`guard-checkins-${timeFilter}`}
              options={chartOptions}
              series={chartOptions.series}
              height={150}
              type="area"
              className="apex-charts my-3"
            />
          </div>
          <Row className="mt-4 mb-1">
            <Col lg={6}>
              <div className="border rounded p-2">
                <p className="mb-1 text-muted">
                  <IconifyIcon
                    icon="ri:smartphone-line"
                    className="text-dark"
                  />{" "}
                  Mobile
                </p>
                <p className="fs-18 text-dark fw-medium">
                  {checkInData.mobileCount.toLocaleString()} <span className="text-muted fs-14">60%</span>
                </p>
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="text-dark mb-0">Android</p>
                    <p className="mb-0">{Math.round(checkInData.mobileCount * 0.6)}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-dark mb-0">IOS</p>
                    <p className="mb-0">{Math.round(checkInData.mobileCount * 0.4)}</p>
                  </div>
                </div>
                <div
                  className="progress progress-lg rounded-0 gap-1 overflow-visible mt-3 bg-light-subtle"
                  style={{ height: 10 }}
                >
                  <div
                    className="progress-bar bg-success rounded-pill"
                    role="progressbar"
                    style={{ width: "60%" }}
                  ></div>
                  <div
                    className="progress-bar bg-dark rounded-pill"
                    role="progressbar"
                    style={{ width: "40%" }}
                  ></div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="border rounded p-2 text-end">
                <p className="mb-1 text-muted">
                  <IconifyIcon icon="ri:computer-line" className="text-dark" />{" "}
                  Desktop
                </p>
                <p className="fs-18 text-dark fw-medium">
                  {checkInData.desktopCount.toLocaleString()} <span className="text-muted fs-14">40%</span>
                </p>
                <div className="d-flex justify-content-between">
                  <div className="text-start">
                    <p className="text-dark mb-0">Windows</p>
                    <p className="mb-0">{Math.round(checkInData.desktopCount * 0.62)}</p>
                  </div>
                  <div>
                    <p className="text-dark mb-0">Mac</p>
                    <p className="mb-0">{Math.round(checkInData.desktopCount * 0.38)}</p>
                  </div>
                </div>
                <div
                  className="progress progress-lg rounded-0 gap-1 overflow-visible mt-3 bg-light-subtle"
                  style={{ height: 10 }}
                >
                  <div
                    className="progress-bar bg-dark rounded-pill"
                    role="progressbar"
                    style={{ width: "62%" }}
                  ></div>
                  <div
                    className="progress-bar bg-warning rounded-pill"
                    role="progressbar"
                    style={{ width: "38%" }}
                  ></div>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="border-top">
          <Row className="g-2">
            <Col lg={7}>
              <Button variant="primary" className="w-100">
                View All
              </Button>
            </Col>
            <Col lg={5}>
              <Button variant="light" className="w-100">
                Edit Data
              </Button>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default GuardVisits;
