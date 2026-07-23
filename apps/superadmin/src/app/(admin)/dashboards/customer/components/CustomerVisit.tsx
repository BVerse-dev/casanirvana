"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardShiftTrends, useGuardSummary } from "@/hooks/useGuardDashboard";
import Link from "next/link";
import ReactApexChart from "react-apexcharts";
import { useMemo, useState } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from "react-bootstrap";
import { ApexOptions } from "apexcharts";

const GuardVisits = () => {
  const [timeFilter, setTimeFilter] = useState<"latest" | "month" | "all">("month");
  const { data: shiftTrends, isLoading: trendsLoading, isError: trendsError } = useGuardShiftTrends();
  const { data: guardSummary, isLoading: summaryLoading, isError: summaryError } = useGuardSummary();

  const isLoading = trendsLoading || summaryLoading;

  const visibleData = useMemo(() => {
    if (!shiftTrends) {
      return {
        labels: [] as string[],
        dutyHours: [] as number[],
        overtimeHours: [] as number[],
        totalHours: 0,
        overtimeTotal: 0,
        averageHours: 0,
        periodLabel: "Last 4 Weeks",
      };
    }

    let labels = shiftTrends.labels;
    let dutyHours = shiftTrends.totalDutyHours;
    let overtimeHours = shiftTrends.overtimeHours;
    let periodLabel = "Last 4 Weeks";

    if (timeFilter === "latest") {
      labels = shiftTrends.labels.slice(-1);
      dutyHours = shiftTrends.totalDutyHours.slice(-1);
      overtimeHours = shiftTrends.overtimeHours.slice(-1);
      periodLabel = "Latest Week";
    } else if (timeFilter === "all") {
      periodLabel = "All Available";
    }

    const totalHours = dutyHours.reduce((sum, value) => sum + value, 0);
    const overtimeTotal = overtimeHours.reduce((sum, value) => sum + value, 0);

    return {
      labels,
      dutyHours,
      overtimeHours,
      totalHours,
      overtimeTotal,
      averageHours: dutyHours.length > 0 ? totalHours / dutyHours.length : 0,
      periodLabel,
    };
  }, [shiftTrends, timeFilter]);

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
        data: visibleData.dutyHours,
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
          formatter: () => "",
        },
        formatter: (value) => `${value} hrs`,
      },
      marker: {
        show: false,
      },
    },
  };

  if (isLoading) {
    return (
      <Col xl={4} lg={6}>
        <Card>
          <CardHeader>
            <CardTitle>Guard Duty Hours</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder" style={{ height: "150px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (trendsError || summaryError) {
    return (
      <Col xl={4} lg={6}>
        <Card><CardHeader><CardTitle>Guard Duty Hours</CardTitle></CardHeader><CardBody className="text-center text-danger py-5">Guard shift activity could not be loaded.</CardBody></Card>
      </Col>
    );
  }

  return (
    <Col xl={4} lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center pb-1">
          <CardTitle>Guard Duty Hours</CardTitle>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded icons-center content-none"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {visibleData.periodLabel}{" "}
              <span>
                <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
              </span>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter("latest")}>Latest Week</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("month")}>Last 4 Weeks</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("all")}>All Available</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h3 className="d-flex align-items-center text-dark gap-2 mb-0">
                {Math.round(visibleData.totalHours).toLocaleString()}
                <span className="badge text-primary bg-primary-subtle px-2 py-1 fs-12">{guardSummary?.onDutyGuards || 0} on duty</span>
              </h3>
              <small>(Scheduled duty hours)</small>
            </div>
            <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
              <IconifyIcon icon="solar:shield-user-broken" width={32} height={32} className="fs-32 text-primary" />
            </div>
          </div>
          <div className="mx-n3">
            <ReactApexChart
              key={`guard-duty-hours-${timeFilter}`}
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
                  <IconifyIcon icon="ri:time-line" className="text-dark" /> Average Weekly Hours
                </p>
                <p className="fs-18 text-dark fw-medium">
                  {visibleData.averageHours.toFixed(1)} <span className="text-muted fs-14">hrs</span>
                </p>
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="text-dark mb-0">Available</p>
                    <p className="mb-0">{guardSummary?.availableGuards || 0}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-dark mb-0">On Duty</p>
                    <p className="mb-0">{guardSummary?.onDutyGuards || 0}</p>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="border rounded p-2 text-end">
                <p className="mb-1 text-muted">
                  <IconifyIcon icon="ri:alarm-warning-line" className="text-dark" /> Overtime Hours
                </p>
                <p className="fs-18 text-dark fw-medium">
                  {Math.round(visibleData.overtimeTotal).toLocaleString()} <span className="text-muted fs-14">hrs</span>
                </p>
                <div className="d-flex justify-content-between">
                  <div className="text-start">
                    <p className="text-dark mb-0">Active</p>
                    <p className="mb-0">{guardSummary?.activeGuards || 0}</p>
                  </div>
                  <div>
                    <p className="text-dark mb-0">Training</p>
                    <p className="mb-0">{guardSummary?.trainingRequired || 0}</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="border-top">
          <Row className="g-2">
            <Col lg={7}>
              <Link href="/guards/schedules" className="btn btn-primary w-100">
                View Schedules
              </Link>
            </Col>
            <Col lg={5}>
              <Link href="/guards/assignments" className="btn btn-light w-100">
                Assignments
              </Link>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default GuardVisits;
