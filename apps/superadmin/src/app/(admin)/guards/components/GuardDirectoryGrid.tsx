"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { GuardDirectoryItem } from "@/hooks/useGuardDirectory";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import { avatars } from "@/assets/images/users";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardBody, CardFooter, Col, Row } from "react-bootstrap";

const GuardDirectoryGrid = ({ guards, isLoading, error, onDelete }: { guards: GuardDirectoryItem[]; isLoading: boolean; error: Error | null; onDelete: (guard: GuardDirectoryItem) => void }) => {
  if (isLoading) return <Card><CardBody className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading guards...</span></div><p className="mt-2 mb-0">Loading guards...</p></CardBody></Card>;
  if (error) return <Card><CardBody className="text-center py-5 text-danger"><IconifyIcon icon="solar:danger-circle-broken" className="fs-48 mb-3" /><h5>Guards could not be loaded</h5><p className="mb-0">{error.message}</p></CardBody></Card>;
  if (guards.length === 0) return <Card><CardBody className="text-center py-5"><IconifyIcon icon="solar:shield-user-broken" className="fs-48 text-muted mb-3" /><h5>No guards found</h5><p className="text-muted mb-0">No records match the current filters.</p></CardBody></Card>;
  return <Row>{guards.map((guard) => <Col xl={4} lg={6} className="mb-4" key={guard.id}><Card className="h-100"><CardBody><div className="d-flex align-items-center gap-3 border-bottom pb-3"><Image src={mapAvatarUrl(guard.avatar_url) || avatars.dummyAvatar} alt="" width={64} height={64} className="rounded-3" /><div className="min-w-0"><Link href={`/guards/${guard.id}`} className="fw-medium text-dark fs-16">{guard.full_name}</Link><p className="text-muted mb-0 text-truncate">{guard.email || "Email not recorded"}</p></div></div><div className="mt-3"><p className="mb-2"><span className="text-muted">Community:</span> {guard.resolved_community_name || guard.societies?.name || "Awaiting assignment"}</p><p className="mb-2"><span className="text-muted">Shift:</span> {guard.active_assignment_shift_type || guard.shift_type || "Not set"}</p><p className="mb-0"><span className="text-muted">Phone:</span> {guard.phone || "Not recorded"}</p></div></CardBody><CardFooter className="d-flex justify-content-between align-items-center"><span className={`badge bg-${guard.is_active ? "success" : "secondary"}-subtle text-${guard.is_active ? "success" : "secondary"}`}>{guard.assignment_status_label || (guard.is_active ? "Active" : "Inactive")}</span><div className="d-flex gap-2"><Link href={`/guards/manage?tab=assignments&guardId=${guard.id}`} className="btn btn-sm btn-light" aria-label={`Manage ${guard.full_name}`}><IconifyIcon icon="ri:settings-3-line" /></Link><Button size="sm" variant="soft-danger" onClick={() => onDelete(guard)} aria-label={`Delete ${guard.full_name}`}><IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" /></Button></div></CardFooter></Card></Col>)}</Row>;
};

export default GuardDirectoryGrid;
