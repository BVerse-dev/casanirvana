"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useResidentDashboardStats } from "@/hooks/useResidentDashboard";
import ReactApexChart from "react-apexcharts";
import { useMemo, useState } from "react";
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

const ResidentOnboarding = () => {
  const { data: dashboardStats, error, isLoading } = useResidentDashboardStats();
  const [timeFilter, setTimeFilter] = useState<"month" | "year" | "all">("year");

  const chartData = useMemo(() => {
    if (!dashboardStats) {
      return {
        labels: [] as string[],
        registrations: [] as number[],
        latestValue: 0,
        totalInView: 0,
      };
    }

    const fullLabels = dashboardStats.monthlyLabels;
    const fullRegistrations = dashboardStats.monthlyRegistrations;

    let labels = fullLabels;
    let registrations = fullRegistrations;

    if (timeFilter === "month") {
      labels = fullLabels.slice(-4);
      registrations = fullRegistrations.slice(-4);
    }

    return {
      labels,
      registrations,
      latestValue: registrations[registrations.length - 1] || 0,
      totalInView: registrations.reduce((sum, value) => sum + value, 0),
    };
  }, [dashboardStats, timeFilter]);

  const registrationsOptions = {
    series: [
      {
        name: "New Residents",
        data: chartData.registrations,
      },
    ],
    chart: {
      height: 165,
      type: "area" as const,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
    },
    colors: ["#604ae3"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.08,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: chartData.labels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    grid: {
      show: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value: number) => `${value} profiles`,
      },
    },
  };

  if (isLoading) {
    return (
      <Col lg={6}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center border-0">
            <CardTitle as={"h4"}>Resident Registrations</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ height: "165px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={6}>
        <Card>
          <CardHeader className="border-0">
            <CardTitle as={"h4"}>Resident Registrations</CardTitle>
          </CardHeader>
          <CardBody className="text-center text-muted py-5">
            Registration analytics are unavailable right now.
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as={"h4"}>Resident Registrations</CardTitle>
            <p className="text-muted mb-0">New resident profiles created in the selected period</p>
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
          {chartData.registrations.length > 0 ? (
            <div className="mx-n3">
              <ReactApexChart
                key={`resident-registrations-${timeFilter}`}
                options={registrationsOptions}
                series={registrationsOptions.series}
                height={165}
                type="area"
                className="apex-charts mt-2"
              />
            </div>
          ) : (
            <div className="text-center text-muted py-4">No resident registrations are available yet.</div>
          )}
        </CardBody>
        <CardFooter className="border-top">
          <Row className="text-center">
            <Col lg={6}>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <div className="avatar-sm bg-success-subtle rounded flex-centered">
                  <IconifyIcon icon="solar:user-plus-broken" width={20} height={20} className="text-success" />
                </div>
                <div>
                  <p className="mb-0 fs-16 text-dark fw-semibold">{chartData.latestValue}</p>
                  <small>Latest Month</small>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <div className="avatar-sm bg-primary-subtle rounded flex-centered">
                  <IconifyIcon icon="solar:chart-2-broken" width={20} height={20} className="text-primary" />
                </div>
                <div>
                  <p className="mb-0 fs-16 text-dark fw-semibold">{chartData.totalInView}</p>
                  <small>Total In View</small>
                </div>
              </div>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default ResidentOnboarding;
