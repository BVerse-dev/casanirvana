"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useAdminAnalyticsDashboard } from "@/hooks/useAdminAnalyticsDashboard";
import Link from "next/link";
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, ProgressBar } from "react-bootstrap";

const SalesLocation = () => {
  const { data: dashboard, isLoading, isError } = useAdminAnalyticsDashboard();
  const distribution = dashboard?.communityDistribution || [];

  return (
    <Col xl={6} lg={6}>
      <Card className="h-100">
        <CardHeader className="d-flex justify-content-between align-items-start pb-1">
          <div>
            <CardTitle as="h4" className="mb-1">Resident Distribution</CardTitle>
            <p className="fs-13 mb-0">Active resident records by authorized community scope</p>
          </div>
          <span className="badge bg-light text-dark">Live scope</span>
        </CardHeader>
        <CardBody>
          {isLoading && (
            <div className="placeholder-glow" role="status" aria-label="Loading resident distribution">
              {[75, 58, 42, 30].map((width) => (
                <div className="mb-4" key={width}>
                  <span className="placeholder col-5 mb-2" />
                  <span className="placeholder d-block rounded" style={{ width: `${width}%`, height: 12 }} />
                </div>
              ))}
            </div>
          )}
          {isError && <div className="text-center text-muted py-5">Resident distribution is unavailable right now.</div>}
          {!isLoading && !isError && distribution.length === 0 && (
            <div className="text-center text-muted py-5">
              <IconifyIcon icon="solar:buildings-2-broken" className="fs-36 mb-2" />
              <p className="mb-0">No community resident records are available in your scope.</p>
            </div>
          )}
          {!isLoading && !isError && distribution.map((community) => (
            <div className="mb-4" key={community.id}>
              <div className="d-flex justify-content-between gap-3 mb-2">
                <span className="fw-medium text-dark text-truncate">{community.name}</span>
                <span className="text-muted text-nowrap">
                  {community.count.toLocaleString()} resident{community.count === 1 ? "" : "s"} · {community.percentage.toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                now={community.percentage}
                min={0}
                max={100}
                aria-label={`${community.name}: ${community.percentage.toFixed(1)} percent of scoped residents`}
                style={{ height: 10 }}
              />
            </div>
          ))}
        </CardBody>
        <CardFooter className="border-top">
          <Link href="/communities/grid" className="link-dark fw-medium">
            Open Communities <IconifyIcon icon="ri:arrow-right-line" />
          </Link>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default SalesLocation;
