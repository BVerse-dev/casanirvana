"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardDashboardSnapshot } from "@/hooks/useGuardDashboard";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle, Col } from "react-bootstrap";
import GuardAvatar from "./GuardAvatar";

const GuardAssignments = () => {
  const { data: dashboard, isLoading, isError } = useGuardDashboardSnapshot();
  const assignment = dashboard?.recentAssignment || null;

  return (
    <Col xl={4} lg={6}>
      <Card className="h-100">
        <CardHeader><CardTitle as="h4">Recent Guard Assignment</CardTitle></CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="placeholder-glow"><div className="placeholder col-12 mb-3" style={{ height: 120 }} /><div className="placeholder col-8" /></div>
          ) : isError ? (
            <div className="text-center text-danger py-5">The latest assignment could not be loaded.</div>
          ) : !assignment ? (
            <div className="text-center text-muted py-5">No guard assignments have been created yet.</div>
          ) : (
            <>
              <div className="rounded bg-light p-4 mb-4">
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <span className="avatar-sm rounded bg-primary-subtle text-primary flex-centered"><IconifyIcon icon="solar:map-point-wave-broken" width={24} /></span>
                  <span className={`badge align-self-start ${assignment.status === "active" ? "bg-success" : "bg-warning"}`}>{assignment.status}</span>
                </div>
                <h5>{assignment.postLocation || "Assigned location"}</h5>
                <p className="text-muted mb-0">{assignment.societyName}</p>
              </div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <GuardAvatar name={assignment.guardName} src={assignment.guardAvatarUrl} />
                <div>
                  <p className="text-dark fw-medium mb-0">{assignment.guardName}</p>
                  <small className="text-muted">{assignment.guardContact || "Contact not available"}</small>
                </div>
              </div>
              <div className="row g-2 mb-4">
                <div className="col-6"><div className="border rounded p-2"><small className="text-muted d-block">Shift</small>{assignment.shiftType}</div></div>
                <div className="col-6"><div className="border rounded p-2"><small className="text-muted d-block">Priority</small>{assignment.priority}</div></div>
              </div>
              <Link href="/guards/assignments" className="btn btn-light w-100">View Assignments</Link>
            </>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default GuardAssignments;
