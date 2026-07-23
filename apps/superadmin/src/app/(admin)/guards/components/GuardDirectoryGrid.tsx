"use client";

import { avatars } from "@/assets/images/users";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { GuardDirectoryItem } from "@/hooks/useGuardDirectory";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardFooter,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";

type GuardDirectoryGridProps = {
  guards: GuardDirectoryItem[];
  isLoading: boolean;
  error: Error | null;
  onDelete: (guard: GuardDirectoryItem) => void;
};

const GuardDirectoryGrid = ({ guards, isLoading, error, onDelete }: GuardDirectoryGridProps) => {
  if (isLoading) {
    return <Card><CardBody className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading guards...</span></div><p className="mt-2 mb-0">Loading guards...</p></CardBody></Card>;
  }

  if (error) {
    return <Card><CardBody className="text-center py-5 text-danger"><IconifyIcon icon="solar:danger-circle-broken" className="fs-48 mb-3" /><h5>Guards could not be loaded</h5><p className="mb-0">{error.message}</p></CardBody></Card>;
  }

  if (guards.length === 0) {
    return <Card><CardBody className="text-center py-5"><IconifyIcon icon="solar:shield-user-broken" className="fs-48 text-muted mb-3" /><h5>No guards found</h5><p className="text-muted mb-0">No records match the current filters.</p></CardBody></Card>;
  }

  return (
    <Row>
      {guards.map((guard) => {
        const avatarUrl = mapAvatarUrl(guard.avatar_url);
        const communityName = guard.resolved_community_name || guard.societies?.name || "Awaiting assignment";
        const shift = guard.active_assignment_shift_type || guard.shift_type || "Not set";

        return (
          <Col xl={4} lg={6} className="mb-4" key={guard.id}>
            <Card className="h-100">
              <CardBody>
                <div className="d-flex flex-wrap align-items-center gap-2 border-bottom pb-3">
                  {avatarUrl ? (
                    <Image src={avatarUrl || avatars.dummyAvatar} alt={`${guard.full_name} avatar`} width={64} height={64} className="avatar-lg rounded-3 border border-light border-3" />
                  ) : (
                    <div className="avatar-lg rounded-3 border border-light border-3 bg-light-subtle d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="ri:shield-user-line" className="fs-24" />
                    </div>
                  )}
                  <div className="d-block flex-grow-1 min-w-0">
                    <Link href={`/guards/${guard.id}`} className="text-dark fw-medium fs-16">{guard.full_name}</Link>
                    <p className="mb-0 text-muted text-truncate">{guard.email || "No email"}</p>
                    <p className="mb-0 text-primary fs-13"># {guard.id.slice(0, 8)}...</p>
                  </div>
                  <div className="ms-auto">
                    <Dropdown>
                      <DropdownToggle as="button" className="btn btn-sm btn-outline-light rounded arrow-none fs-16" aria-label={`Actions for ${guard.full_name}`}>
                        <IconifyIcon icon="ri:more-2-fill" />
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
                        <DropdownItem as={Link} href={`/guards/${guard.id}`}><IconifyIcon icon="solar:eye-broken" className="me-2" />View Details</DropdownItem>
                        <DropdownItem as={Link} href={`/guards/manage?tab=assignments&guardId=${guard.id}`}><IconifyIcon icon="ri:settings-3-line" className="me-2" />Manage Assignments</DropdownItem>
                        <DropdownItem as="button" onClick={() => onDelete(guard)} className="text-danger"><IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-2" />Delete</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="d-flex align-items-center gap-2 mb-2"><IconifyIcon icon="solar:buildings-bold-duotone" className="fs-18 text-primary" /><span className="text-muted">Community:</span> {communityName}</p>
                  <p className="d-flex align-items-center gap-2 mb-2"><IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-18 text-warning" /><span className="text-muted">Shift:</span> {shift}</p>
                  <p className="d-flex align-items-center gap-2 mb-0"><IconifyIcon icon="solar:phone-bold-duotone" className="fs-18 text-success" /><span className="text-muted">Phone:</span> {guard.phone || "No phone"}</p>
                </div>
              </CardBody>
              <CardFooter>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <span className={`badge bg-${guard.is_active ? "success" : "danger"}-subtle text-${guard.is_active ? "success" : "danger"} py-1 px-2 fs-13`}>
                    {guard.assignment_status_label || (guard.is_active ? "Active" : "Inactive")}
                  </span>
                  <p className="fs-13 text-muted mb-0">Employed: {guard.employment_date ? new Date(guard.employment_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</p>
                </div>
              </CardFooter>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default GuardDirectoryGrid;
