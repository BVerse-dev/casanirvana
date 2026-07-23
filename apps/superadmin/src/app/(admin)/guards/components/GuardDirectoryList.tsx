"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { GuardDirectoryItem } from "@/hooks/useGuardDirectory";
import Link from "next/link";
import { Button, Card, CardBody } from "react-bootstrap";

const GuardDirectoryList = ({ guards, isLoading, error, onDelete }: { guards: GuardDirectoryItem[]; isLoading: boolean; error: Error | null; onDelete: (guard: GuardDirectoryItem) => void }) => {
  if (isLoading) return <Card><CardBody className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading guards...</span></div></CardBody></Card>;
  if (error) return <Card><CardBody className="text-center py-5 text-danger"><h5>Guards could not be loaded</h5><p>{error.message}</p></CardBody></Card>;
  if (guards.length === 0) return <Card><CardBody className="text-center py-5"><h5>No guards found</h5><p className="text-muted mb-0">No records match the current filters.</p></CardBody></Card>;
  return <Card><CardBody className="p-0"><div className="table-responsive"><table className="table align-middle table-hover mb-0"><thead className="bg-light-subtle"><tr><th>Guard</th><th>Community</th><th>Phone</th><th>Shift</th><th>Assignment</th><th className="text-end">Actions</th></tr></thead><tbody>{guards.map((guard) => <tr key={guard.id}><td><Link href={`/guards/details?id=${guard.id}`} className="fw-medium text-dark">{guard.full_name}</Link><small className="d-block text-muted">{guard.email || "Email not recorded"}</small></td><td>{guard.resolved_community_name || guard.societies?.name || "Awaiting assignment"}</td><td>{guard.phone || "Not recorded"}</td><td>{guard.active_assignment_shift_type || guard.shift_type || "Not set"}</td><td>{guard.assignment_status_label || "Not recorded"}</td><td><div className="d-flex justify-content-end gap-2"><Link href={`/guards/details?id=${guard.id}`} className="btn btn-sm btn-light" aria-label={`View ${guard.full_name}`}><IconifyIcon icon="solar:eye-broken" /></Link><Link href={`/guards/manage?tab=assignments&guardId=${guard.id}`} className="btn btn-sm btn-soft-primary" aria-label={`Manage ${guard.full_name}`}><IconifyIcon icon="ri:settings-3-line" /></Link><Button size="sm" variant="soft-danger" onClick={() => onDelete(guard)} aria-label={`Delete ${guard.full_name}`}><IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" /></Button></div></td></tr>)}</tbody></table></div></CardBody></Card>;
};

export default GuardDirectoryList;
