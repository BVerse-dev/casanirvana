"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardDashboardSnapshot } from "@/hooks/useGuardDashboard";
import Link from "next/link";
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, ProgressBar } from "react-bootstrap";
import GuardAvatar from "./GuardAvatar";

const TopGuardProfile = () => {
  const { data: dashboard, isLoading, isError } = useGuardDashboardSnapshot();
  const guard = dashboard?.topGuards?.[0];

  return (
    <Col xl={4} lg={12}>
      <Card>
        <CardHeader><CardTitle as="h4">Top Guard Performance</CardTitle></CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="placeholder-glow"><div className="placeholder rounded-circle mb-3" style={{ width: 64, height: 64 }} /><div className="placeholder col-8 mb-3" /><div className="placeholder col-12" /></div>
          ) : isError ? (
            <div className="text-center text-danger py-5">Guard performance could not be loaded.</div>
          ) : !guard ? (
            <div className="text-center text-muted py-5">No reviewed guard performance is available.</div>
          ) : (
            <>
              <div className="d-flex align-items-center gap-3 mb-4">
                <GuardAvatar name={guard.guardName} src={guard.avatar} size={64} />
                <div>
                  <h5 className="mb-1">{guard.guardName}</h5>
                  <p className="text-muted mb-0">{guard.totalShifts} recorded shifts</p>
                </div>
              </div>
              {[
                ["Overall rating", guard.overallRating * 20, `${guard.overallRating.toFixed(1)} / 5`],
                ["Attendance", guard.attendancePercentage, `${guard.attendancePercentage.toFixed(0)}%`],
                ["Reliability", guard.reliabilityRating * 20, `${guard.reliabilityRating.toFixed(1)} / 5`],
              ].map(([label, value, display]) => (
                <div className="mb-3" key={String(label)}>
                  <div className="d-flex justify-content-between mb-1"><span>{label}</span><span>{display}</span></div>
                  <ProgressBar now={Number(value)} />
                </div>
              ))}
              <div className="d-flex gap-3 text-muted mt-4">
                <span><IconifyIcon icon="solar:check-circle-broken" /> {guard.completedShifts} completed</span>
                <span><IconifyIcon icon="solar:danger-triangle-broken" /> {guard.incidentReports} incidents</span>
              </div>
            </>
          )}
        </CardBody>
        <CardFooter className="border-top"><Link href="/guards/grid-view" className="btn btn-primary w-100">View Guard Directory</Link></CardFooter>
      </Card>
    </Col>
  );
};

export default TopGuardProfile;
