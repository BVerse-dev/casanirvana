"use client";

import Link from "next/link";
import { Badge, Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";

type RecentResident = {
  id: string;
  name: string;
  email: string | null;
  created_at: string | null;
  unitLabel: string | null;
};

type RecentUnit = {
  id: string;
  label: string;
  status: string | null;
  created_at: string | null;
};

interface CommunityActivitiesProps {
  communityId: string;
  residents: RecentResident[];
  units: RecentUnit[];
}

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "Unknown time";

const CommunityActivities = ({ communityId, residents, units }: CommunityActivitiesProps) => {
  const recentResidents = residents.slice(0, 5);
  const recentUnits = units.slice(0, 5);

  return (
    <Row className="mb-4">
      <Col lg={8}>
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Recent Community Activity</CardTitle>
          </CardHeader>
          <CardBody>
            {recentResidents.length === 0 && recentUnits.length === 0 ? (
              <div className="text-muted">No recent resident or unit activity is available for this community yet.</div>
            ) : (
              <div className="activity-timeline">
                {recentResidents.map((resident) => (
                  <div key={`resident-${resident.id}`} className="d-flex mb-4">
                    <div className="flex-shrink-0">
                      <div className="avatar-sm rounded-circle bg-success-subtle d-flex align-items-center justify-content-center">
                        <IconifyIcon icon="solar:user-bold-duotone" className="fs-18 text-success" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0">{resident.name}</h6>
                        <small className="text-muted">{formatDateTime(resident.created_at)}</small>
                      </div>
                      <p className="text-muted mb-1 small">
                        Resident record is active{resident.unitLabel ? ` in ${resident.unitLabel}` : ""}.
                      </p>
                      <small className="text-muted">{resident.email || "No email recorded"}</small>
                    </div>
                  </div>
                ))}

                {recentUnits.map((unit) => (
                  <div key={`unit-${unit.id}`} className="d-flex mb-4">
                    <div className="flex-shrink-0">
                      <div className="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center">
                        <IconifyIcon icon="solar:home-2-bold-duotone" className="fs-18 text-primary" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0">{unit.label}</h6>
                        <small className="text-muted">{formatDateTime(unit.created_at)}</small>
                      </div>
                      <p className="text-muted mb-0 small">
                        Current status: {unit.status ? unit.status.replace(/_/g, " ") : "unknown"}.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </Col>

      <Col lg={4}>
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Verified Shortcuts</CardTitle>
          </CardHeader>
          <CardBody className="d-grid gap-2">
            <Link href={`/units/add?communityId=${communityId}`} className="btn btn-outline-primary btn-sm text-start">
              <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-2" />
              Add Unit
            </Link>
            <Link href={`/units?communityId=${communityId}`} className="btn btn-outline-success btn-sm text-start">
              <IconifyIcon icon="solar:home-2-bold-duotone" className="me-2" />
              View Units
            </Link>
            <Link href={`/communities/${communityId}/edit`} className="btn btn-outline-warning btn-sm text-start">
              <IconifyIcon icon="solar:pen-bold-duotone" className="me-2" />
              Edit Community
            </Link>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Launch Notes</CardTitle>
          </CardHeader>
          <CardBody>
            <Badge bg="light" text="dark" className="mb-2">
              Truthful data only
            </Badge>
            <div className="text-muted small">
              Event scheduling, community notices, and report generation stay on their dedicated audited modules. This page now only surfaces verified community records and wired shortcuts.
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default CommunityActivities;
