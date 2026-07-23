"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardDashboardSnapshot, useGuardSummary } from "@/hooks/useGuardDashboard";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "react-bootstrap";
import GuardAvatar from "./GuardAvatar";

const TopGuards = () => {
  const [sortBy, setSortBy] = useState<"performance" | "attendance" | "experience">("performance");
  const { data: dashboard, isLoading, isError } = useGuardDashboardSnapshot();
  const { data: guardSummary } = useGuardSummary();
  const performances = dashboard?.topGuards || [];

  const topGuards = useMemo(() => {
    const sortedGuards = [...performances];

    switch (sortBy) {
      case "attendance":
        sortedGuards.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
        break;
      case "experience":
        sortedGuards.sort((a, b) => b.totalShifts - a.totalShifts);
        break;
      default:
        sortedGuards.sort((a, b) => b.overallRating - a.overallRating);
        break;
    }

    return sortedGuards.slice(0, 5);
  }, [performances, sortBy]);

  if (isLoading) {
    return (
      <Col xl={4} lg={6}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center border-0">
            <div>
              <CardTitle as={"h4"} className="mb-1">
                Top Guards
              </CardTitle>
              <p className="mb-0 fs-13">Loading...</p>
            </div>
          </CardHeader>
          <CardBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="placeholder rounded-circle" style={{ width: "40px", height: "40px" }}></div>
                  <div>
                    <span className="placeholder col-8"></span>
                    <span className="placeholder col-6"></span>
                  </div>
                </div>
                <span className="placeholder col-3"></span>
              </div>
            ))}
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={4} lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as={"h4"} className="mb-1">
              Top Guards
            </CardTitle>
            <p className="mb-0 fs-13">{guardSummary?.totalGuards || performances.length} Total Guards</p>
          </div>
          <Dropdown>
            <DropdownToggle as={"a"} className="rounded arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
              <IconifyIcon icon="ri:edit-box-line" className="fs-20 text-dark" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setSortBy("performance")}>By Performance</DropdownItem>
              <DropdownItem onClick={() => setSortBy("attendance")}>By Attendance</DropdownItem>
              <DropdownItem onClick={() => setSortBy("experience")}>By Shift Volume</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody key={`top-guards-${sortBy}`}>
          {isError ? (
            <div className="text-center text-danger py-4">Guard rankings could not be loaded.</div>
          ) : topGuards.length === 0 ? (
            <div className="text-center py-4">
              <IconifyIcon icon="ri:shield-user-line" className="fs-48 text-muted mb-2" />
              <p className="text-muted">No guard performance data available</p>
            </div>
          ) : (
            topGuards.map((guard, idx) => {
              const isLast = idx === topGuards.length - 1;
              return (
                <div
                  className={`d-flex align-items-center justify-content-between ${
                    !isLast ? "border-bottom" : ""
                  } ${idx === 0 ? "pb-3" : isLast ? "pt-3" : "py-3"} gap-2`}
                  key={guard.id}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar position-relative">
                      <GuardAvatar name={guard.guardName} src={guard.avatar} />
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark"
                        style={{ fontSize: "10px" }}
                      >
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="d-block">
                      <span className="text-dark">
                        <Link href="/guards/grid-view" className="text-dark fw-medium fs-15">
                          {guard.guardName}
                        </Link>
                      </span>
                      <p className="mb-0 fs-14 text-muted">Rating: {guard.overallRating.toFixed(1)}/5.0</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-muted fw-medium mb-0">
                      {sortBy === "attendance"
                        ? `${guard.attendancePercentage.toFixed(0)}%`
                        : sortBy === "experience"
                          ? `${guard.totalShifts}`
                          : guard.overallRating.toFixed(1)}
                    </p>
                    <small className="text-muted">
                      {sortBy === "attendance" ? "Attendance" : sortBy === "experience" ? "Shifts" : "Rating"}
                    </small>
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
        <CardFooter className="border-top">
          <Link href="/guards/grid-view" className="btn btn-primary w-100">
            View All Guards
          </Link>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default TopGuards;
