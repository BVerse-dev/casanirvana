"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "react-bootstrap";
import { useResidentDashboardRoster } from "@/hooks/useResidentDashboard";
import ResidentAvatar from "./ResidentAvatar";

const TopResidents = () => {
  const { data: residentRoster, error, isLoading } = useResidentDashboardRoster();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Latest Active Resident</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="placeholder-glow">
            <div className="placeholder rounded" style={{ height: "200px" }}></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return <Card><CardHeader><CardTitle as="h4">Latest Active Resident</CardTitle></CardHeader><CardBody className="text-center text-muted py-5">Resident details are unavailable right now.</CardBody></Card>;
  }

  const featuredResident = residentRoster?.featuredResident || null;

  if (!featuredResident) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Latest Active Resident</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-4">
            <IconifyIcon icon="ri:user-line" className="fs-48 text-muted mb-2" />
            <p className="text-muted">No resident data available</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const residentName =
    featuredResident.full_name || `${featuredResident.first_name} ${featuredResident.last_name}`.trim() || "Resident";
  const hasUnit = featuredResident.unit_number && featuredResident.unit_number !== "N/A";

  return (
    <Card>
      <CardHeader>
        <CardTitle as={"h4"}>Latest Active Resident</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="bg-primary position-relative rounded p-3 overflow-hidden z-1 text-center">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <span className="border border-light border-3 rounded-circle d-inline-flex">
              <ResidentAvatar name={residentName} src={featuredResident.avatar_url} size={80} />
            </span>
          </div>
          <div className="bg-light bg-opacity-25 p-3 rounded text-start">
            <div className="d-flex align-items-center justify-content-between">
              <div className="flex-grow-1">
                <Link href={`/residents/${featuredResident.id}`} className="text-white fw-medium fs-16">
                  {residentName}
                </Link>
                <p className="mb-0 text-white-50">
                  {hasUnit ? `Unit ${featuredResident.unit_number}` : "No linked unit"}
                </p>
                <div className="d-flex flex-wrap gap-2 align-items-center mt-2">
                  <span className="badge bg-success bg-opacity-75 text-white">
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    {featuredResident.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="badge bg-info bg-opacity-75 text-white">
                    <IconifyIcon icon="ri:home-line" className="me-1" />
                    {hasUnit ? "Unit Linked" : "Needs Unit Assignment"}
                  </span>
                </div>
              </div>
              <div>
                <Link href={`/residents/${featuredResident.id}`}>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title bg-white bg-opacity-25 text-white fs-4 rounded-circle">
                      <IconifyIcon icon="ri:arrow-right-line" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TopResidents;
