"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Database } from "@/lib/database.types";
import { Button } from "react-bootstrap";
import Link from "next/link";

type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"] & {
  services?: Database["public"]["Tables"]["services"]["Row"];
  user_profile?: Database["public"]["Tables"]["profiles"]["Row"];
  units?: Database["public"]["Tables"]["units"]["Row"] & {
    communities?: Database["public"]["Tables"]["communities"]["Row"];
  };
  priority?: string | null;
};

interface ServiceRequestsTableProps {
  serviceRequests: ServiceRequest[];
}

const ServiceRequestsTable = ({ serviceRequests }: ServiceRequestsTableProps) => {
  if (serviceRequests.length === 0) {
    return (
      <div className="text-center py-5">
        <IconifyIcon icon="solar:clipboard-list-broken" className="fs-1 text-muted mb-3" />
        <h5 className="text-muted">No service requests found</h5>
        <p className="text-muted mb-0">Service requests will appear here when residents make bookings.</p>
      </div>
    );
  }

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
            <th style={{ width: 20 }}>
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="customCheck1" />
                <label className="form-check-label" htmlFor="customCheck1" />
              </div>
            </th>
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
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id={`check-${request.id}`} />
                  <label className="form-check-label" htmlFor={`check-${request.id}`}>
                    &nbsp;
                  </label>
                </div>
              </td>
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
                      <h6 className="mb-0 fw-medium text-dark hover-primary">{request.services?.name || 'Unknown Service'}</h6>
                    </Link>
                    <p className="mb-0 text-muted fs-12">
                      {request.user_profile?.first_name} {request.user_profile?.last_name}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <span className="fw-medium fs-13">
                    {request.units?.block} - {request.units?.number}
                  </span>
                  <p className="mb-0 text-muted fs-12">
                    {request.units?.communities?.name}
                  </p>
                </div>
              </td>
              <td>
                <span className={`badge bg-${getPriorityBadgeColor(request.priority || 'medium')} text-white fs-11`}>
                  {(request.priority || 'medium').charAt(0).toUpperCase() + (request.priority || 'medium').slice(1)}
                </span>
              </td>
              <td>
                <span className={`badge bg-${getStatusBadgeColor(request.status || 'pending')} text-white fs-11`}>
                  {(request.status || 'pending').replace('_', ' ')}
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
                <span className="fw-semibold">
                  {request.total_amount ? `$${request.total_amount}` : 'Free'}
                </span>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Link href={`/service-requests/${request.id}`}>
                    <Button variant="light" size="sm" title="View Details">
                      <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                    </Button>
                  </Link>
                  <Button variant="soft-primary" size="sm" title="Update Status">
                    <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                  </Button>
                  <Button variant="soft-success" size="sm" title="Mark Complete">
                    <IconifyIcon icon="solar:check-circle-broken" className="align-middle fs-18" />
                  </Button>
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
