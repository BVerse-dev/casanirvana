"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useDeleteResident, type Resident } from "@/hooks/useResidents";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import { avatars } from "@/assets/images/users";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardBody } from "react-bootstrap";
import { toast } from "react-hot-toast";

const statusVariant = (status: Resident["status"]) => status === "active" ? "success" : status === "pending" ? "warning" : status === "suspended" ? "secondary" : "danger";

const ResidentDirectoryList = ({ residents, isLoading, error }: { residents: Resident[]; isLoading: boolean; error: Error | null }) => {
  const deleteResident = useDeleteResident();

  const handleDelete = async (resident: Resident) => {
    if (!window.confirm(`Delete ${resident.full_name}? This action cannot be undone.`)) return;
    try {
      await deleteResident.mutateAsync(resident.id);
      toast.success("Resident deleted successfully");
    } catch {
      toast.error("The resident could not be deleted. Check linked ownership records and try again.");
    }
  };

  if (isLoading) return <Card><CardBody className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading residents...</span></div><p className="mt-2 mb-0">Loading residents...</p></CardBody></Card>;
  if (error) return <Card><CardBody className="text-center py-5 text-danger"><IconifyIcon icon="solar:danger-circle-broken" className="fs-48 mb-3" /><h5>Residents could not be loaded</h5><p className="mb-0">{error.message}</p></CardBody></Card>;
  if (residents.length === 0) return <Card><CardBody className="text-center py-5"><IconifyIcon icon="solar:users-group-two-rounded-broken" className="fs-48 text-muted mb-3" /><h5>No residents found</h5><p className="text-muted">No records match the current filters.</p></CardBody></Card>;

  return (
    <Card>
      <CardBody className="p-0">
        <div className="table-responsive">
          <table className="table align-middle table-hover mb-0">
            <thead className="bg-light-subtle"><tr><th>Resident</th><th>Unit</th><th>Community</th><th>Phone</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {residents.map((resident) => (
                <tr key={resident.id}>
                  <td><div className="d-flex align-items-center gap-2"><Image src={mapAvatarUrl(resident.avatar_url) || avatars.dummyAvatar} alt="" width={40} height={40} className="rounded-circle" /><div><Link href={`/residents/${resident.id}`} className="fw-medium text-dark">{resident.full_name || "Unnamed resident"}</Link><small className="d-block text-muted">{resident.email}</small></div></div></td>
                  <td>{resident.unit_number || "Not assigned"}</td>
                  <td>{resident.communities?.name || "Not assigned"}</td>
                  <td>{resident.phone || "Not recorded"}</td>
                  <td><span className={`badge bg-${statusVariant(resident.status)}-subtle text-${statusVariant(resident.status)}`}>{resident.status.replaceAll("_", " ")}</span></td>
                  <td><div className="d-flex justify-content-end gap-2"><Link href={`/residents/${resident.id}`} className="btn btn-sm btn-light" aria-label={`View ${resident.full_name}`}><IconifyIcon icon="solar:eye-broken" /></Link><Link href={`/residents/${resident.id}/edit`} className="btn btn-sm btn-soft-primary" aria-label={`Edit ${resident.full_name}`}><IconifyIcon icon="solar:pen-2-broken" /></Link><Button size="sm" variant="soft-danger" aria-label={`Delete ${resident.full_name}`} disabled={deleteResident.isPending} onClick={() => handleDelete(resident)}><IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default ResidentDirectoryList;
