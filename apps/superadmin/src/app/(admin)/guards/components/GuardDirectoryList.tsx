"use client";

import { avatars } from "@/assets/images/users";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { GuardDirectoryItem } from "@/hooks/useGuardDirectory";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardBody, CardHeader, CardTitle, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "react-bootstrap";
import { toast } from "react-hot-toast";

type Props = {
  guards: GuardDirectoryItem[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onDelete: (guard: GuardDirectoryItem) => void;
  onRefresh: () => Promise<unknown>;
};

const escapeCsv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const GuardDirectoryList = ({ guards, isLoading, error, searchTerm, onDelete, onRefresh }: Props) => {
  const handleExport = () => {
    const rows = [
      ["Name", "Community", "Email", "Phone", "Shift", "Employment Date", "Assignment"],
      ...guards.map((guard) => [
        guard.full_name,
        guard.resolved_community_name || guard.societies?.name || "Awaiting assignment",
        guard.email || "",
        guard.phone || "",
        guard.active_assignment_shift_type || guard.shift_type || "Not set",
        guard.employment_date || "",
        guard.assignment_status_label || (guard.is_active ? "Active" : "Inactive"),
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(escapeCsv).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `guards-current-page-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Current guard page exported");
  };

  if (isLoading) return <Card><CardBody className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading guards...</span></div></CardBody></Card>;
  if (error) return <Card><CardBody className="text-center py-5 text-danger"><IconifyIcon icon="solar:danger-circle-broken" className="fs-48 mb-3" /><h5>Guards could not be loaded</h5><p>{error.message}</p></CardBody></Card>;

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
        <div>
          <CardTitle as="h4">{searchTerm ? `Search Results for "${searchTerm}"` : "All Guards List"}</CardTitle>
          <small className="text-muted">Showing {guards.length} guards on this page</small>
        </div>
        <Dropdown>
          <DropdownToggle as="button" className="btn btn-sm btn-outline-light rounded content-none icons-center">
            Actions <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-end">
            <DropdownItem onClick={handleExport}><IconifyIcon icon="solar:download-broken" className="me-2" />Export Current Page</DropdownItem>
            <DropdownItem onClick={() => window.print()}><IconifyIcon icon="solar:printer-broken" className="me-2" />Print List</DropdownItem>
            <DropdownItem onClick={async () => { await onRefresh(); toast.success("Guard list refreshed"); }}><IconifyIcon icon="solar:refresh-broken" className="me-2" />Refresh</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody className="p-0">
        <div className="table-responsive">
          <table className="table align-middle text-nowrap table-hover table-centered mb-0">
            <thead className="bg-light-subtle"><tr><th>Guard Photo &amp; Name</th><th>Community</th><th>Email</th><th>Contact</th><th>Shift Type</th><th>Employment Date</th><th>Assignment</th><th>Action</th></tr></thead>
            <tbody>
              {guards.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-5"><IconifyIcon icon="solar:shield-user-broken" className="fs-48 text-muted mb-3" /><h5>No guards found</h5><p className="text-muted mb-0">No records match the current filters.</p></td></tr>
              ) : guards.map((guard) => {
                const avatar = mapAvatarUrl(guard.avatar_url);
                const community = guard.resolved_community_name || guard.societies?.name || "Awaiting assignment";
                const shift = guard.active_assignment_shift_type || guard.shift_type || "Not set";
                return (
                  <tr key={guard.id}>
                    <td><div className="d-flex align-items-center gap-2">{avatar ? <Image src={avatar || avatars.dummyAvatar} alt="" width={40} height={40} className="avatar-sm rounded-circle" /> : <div className="avatar-sm rounded-circle bg-light-subtle d-flex align-items-center justify-content-center"><IconifyIcon icon="ri:shield-user-line" className="fs-18" /></div>}<div><Link href={`/guards/${guard.id}`} className="text-dark fw-medium fs-15">{guard.full_name}</Link><div className="text-muted fs-13">ID: {guard.id.slice(0, 8)}...</div></div></div></td>
                    <td>{community}</td>
                    <td>{guard.email || "Not recorded"}</td>
                    <td>{guard.phone || "Not recorded"}</td>
                    <td><span className="badge bg-info-subtle text-info py-1 px-2 fs-13">{shift}</span></td>
                    <td>{guard.employment_date ? new Date(guard.employment_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Not recorded"}</td>
                    <td><span className={`badge bg-${guard.is_active ? "success" : "secondary"}-subtle text-${guard.is_active ? "success" : "secondary"} py-1 px-2 fs-13`}>{guard.assignment_status_label || (guard.is_active ? "Active" : "Inactive")}</span></td>
                    <td><div className="d-flex gap-2"><Link href={`/guards/${guard.id}`} className="btn btn-sm btn-light" aria-label={`View ${guard.full_name}`}><IconifyIcon icon="solar:eye-broken" className="fs-18" /></Link><Link href={`/guards/manage?tab=assignments&guardId=${guard.id}`} className="btn btn-sm btn-soft-primary" aria-label={`Manage ${guard.full_name}`}><IconifyIcon icon="ri:settings-3-line" className="fs-18" /></Link><Button size="sm" variant="soft-danger" onClick={() => onDelete(guard)} aria-label={`Delete ${guard.full_name}`}><IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="fs-18" /></Button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default GuardDirectoryList;
