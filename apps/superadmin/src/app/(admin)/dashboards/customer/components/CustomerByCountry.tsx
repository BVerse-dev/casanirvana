"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardDashboardSnapshot } from "@/hooks/useGuardDashboard";
import Link from "next/link";
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, ProgressBar } from "react-bootstrap";

const GuardsByLocation = () => {
  const { data: dashboard, isLoading, isError } = useGuardDashboardSnapshot();
  const communities = dashboard?.communityOverview || [];

  return (
    <Col xl={6}>
      <Card className="h-100">
        <CardHeader>
          <CardTitle as="h4" className="mb-1">Community Guard Coverage</CardTitle>
          <p className="text-muted mb-0">Assigned guards compared with the staffing requirement.</p>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="placeholder-glow"><div className="placeholder col-12 mb-3" /><div className="placeholder col-10 mb-3" /><div className="placeholder col-11" /></div>
          ) : isError ? (
            <div className="text-center text-danger py-5">Community coverage could not be loaded.</div>
          ) : communities.length === 0 ? (
            <div className="text-center text-muted py-5">
              <IconifyIcon icon="solar:buildings-2-broken" className="fs-40 mb-2" />
              <p className="mb-0">No scoped communities are available.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {communities.slice(0, 6).map((community) => {
                const coverage = community.requiredGuards > 0
                  ? Math.min(100, Math.round((community.currentGuards / community.requiredGuards) * 100))
                  : 0;
                return (
                  <div key={community.id}>
                    <div className="d-flex justify-content-between gap-3 mb-2">
                      <div>
                        <p className="text-dark fw-medium mb-0">{community.name}</p>
                        <small className="text-muted">{community.totalUnits} units</small>
                      </div>
                      <span className="text-nowrap">{community.currentGuards} / {community.requiredGuards} guards</span>
                    </div>
                    <ProgressBar now={coverage} variant={coverage >= 100 ? "success" : coverage >= 60 ? "primary" : "warning"} aria-label={`${community.name} guard coverage`} />
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
        <CardFooter className="border-top">
          <Link href="/guards/grid-view" className="btn btn-light w-100">Manage Guards</Link>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default GuardsByLocation;
