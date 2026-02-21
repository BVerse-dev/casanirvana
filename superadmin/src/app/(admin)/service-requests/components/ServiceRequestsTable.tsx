"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Database } from "@/lib/database.types";
import { Button } from "react-bootstrap";
import Link from "next/link";
import { useUpdateServiceRequest } from "@/hooks/useServiceRequests";

type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"] & {
  services?: Database["public"]["Tables"]["services"]["Row"];
  user_profile?: Database["public"]["Tables"]["profiles"]["Row"];
  units?: Database["public"]["Tables"]["units"]["Row"] & {
    community?: Database["public"]["Tables"]["communities"]["Row"];
  };
  priority?: string | null;
};

interface ServiceRequestsTableProps {
  serviceRequests: ServiceRequest[];
}

const ServiceRequestsTable = ({ serviceRequests }: ServiceRequestsTableProps) => {
  const updateServiceRequest = useUpdateServiceRequest();

  const handleStatusUpdate = async (id: string, status: "in_progress" | "completed") => {
    try {
      await updateServiceRequest.mutateAsync({
        id,
        status,
        completion_date: status === "completed" ? new Date().toISOString().slice(0, 10) : null,
      });
    } catch (error) {
      console.error("Failed to update service request status:", error);
    }
  };

  if (serviceRequests.length === 0) {
    return (
      <div className="text-center py-5">
        <IconifyIcon icon="solar:clipboard-list-broken" className="fs-1 text-muted mb-3" />
        <h5 className="text-muted">No service requests found</h5>
        <p className="text-muted mb-0">Service requests will appear here when residents make bookings.</p>
      </div>
    );
  }

  const formatCurrency = (amount?: number | null) => {
    const value = Number(amount || 0);
    return `GHS ${value.toFixed(2)}`;
  };

  const formatStatusLabel = (status?: string | null) => {
    const normalized = status || "pending";
    return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatPriorityLabel = (priority?: string | null) => {
    const normalized = priority || "medium";
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const getStatusBadgeColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'cancelled': 'danger',
      'default': 'secondary'
    };
    return statusColors[status] || statusColors.default;
  };

  const getPriorityBadgeColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
      'low': 'success',
      'medium': 'warning',
      'high': 'danger',
      'default': 'secondary'
    };
    return priorityColors[priority] || priorityColors.default;
  };

  return (
    <div className="table-responsive">
      <table className="table align-middle text-nowrap table-hover table-centered mb-0">
        <thead className="bg-light-subtle">
          <tr>
            <th>Service & Resident</th>
            <th>Unit Details</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Scheduled Date</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {serviceRequests.map((request) => (
            <tr key={request.id}>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar-sm bg-light rounded d-flex align-items-center justify-content-center">
                    <IconifyIcon 
                      icon="solar:settings-minimalistic-broken" 
                      className="fs-18 text-primary"
                    />
                  </div>
                  <div>
                    <Link href={`/service-requests/${request.id}`} className="text-decoration-none">
                      <h6 className="mb-0 fw-medium text-dark hover-primary">
                        {request.services?.name || request.title || "Service Request"}
                      </h6>
                    </Link>
                    <p className="mb-0 text-muted fs-12">
                      {[request.user_profile?.first_name, request.user_profile?.last_name]
                        .filter(Boolean)
                        .join(" ") || request.user_profile?.email || "Resident"}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <span className="fw-medium fs-13">
                    {[request.units?.block, request.units?.number || request.units?.unit_number]
                      .filter(Boolean)
                      .join(" - ") || "N/A"}
                  </span>
                  <p className="mb-0 text-muted fs-12">
                    {request.units?.community?.name || "Community N/A"}
                  </p>
                </div>
              </td>
              <td>
                <span className={`badge bg-${getPriorityBadgeColor(request.priority || 'medium')} text-white fs-11`}>
                  {formatPriorityLabel(request.priority)}
                </span>
              </td>
              <td>
                <span className={`badge bg-${getStatusBadgeColor(request.status || 'pending')} text-white fs-11`}>
                  {formatStatusLabel(request.status)}
                </span>
              </td>
              <td>
                <span className="text-muted fs-13">
                  {request.preferred_date ? 
                    new Date(request.preferred_date).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Not scheduled'
                  }
                </span>
              </td>
              <td>
                <span className="fw-semibold">{formatCurrency(request.total_amount)}</span>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Link href={`/service-requests/${request.id}`}>
                    <Button variant="light" size="sm" title="View Details">
                      <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                    </Button>
                  </Link>
                  {request.status === "pending" && (
                    <Button
                      variant="soft-primary"
                      size="sm"
                      title="Start Service"
                      disabled={updateServiceRequest.isPending}
                      onClick={() => handleStatusUpdate(request.id, "in_progress")}
                    >
                      <IconifyIcon icon="solar:play-circle-broken" className="align-middle fs-18" />
                    </Button>
                  )}
                  {(request.status === "pending" || request.status === "in_progress") && (
                    <Button
                      variant="soft-success"
                      size="sm"
                      title="Mark Complete"
                      disabled={updateServiceRequest.isPending}
                      onClick={() => handleStatusUpdate(request.id, "completed")}
                    >
                      <IconifyIcon icon="solar:check-circle-broken" className="align-middle fs-18" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceRequestsTable;
