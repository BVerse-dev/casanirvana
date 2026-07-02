"use client";

import Link from "next/link";
import { Badge, Button } from "react-bootstrap";

import { formatServiceRequestStatusLabel } from "@/hooks/useServiceRequests";

interface ServiceRequestsTableProps {
  serviceRequests: Array<any>;
  onStatusUpdate: (id: string, status: "in_progress" | "completed" | "cancelled" | "pending") => Promise<void> | void;
  isUpdating: boolean;
}

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const getPaymentLabel = (value?: string | null) =>
  value ? formatServiceRequestStatusLabel(value) : "Not tracked";

const getStatusVariant = (status?: string | null) => {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "cancelled":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
};

const getPriorityVariant = (priority?: string | null) => {
  switch (priority) {
    case "high":
      return "danger";
    case "low":
      return "success";
    case "medium":
    default:
      return "warning";
  }
};

const ServiceRequestsTable = ({ serviceRequests, onStatusUpdate, isUpdating }: ServiceRequestsTableProps) => {
  if (!serviceRequests.length) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">No service requests found</h5>
        <p className="text-muted mb-0">Requests will appear here once residents start booking services.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle text-nowrap table-hover table-centered mb-0">
        <thead className="bg-light-subtle">
          <tr>
            <th>Request</th>
            <th>Resident</th>
            <th>Unit / Community</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Amount</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {serviceRequests.map((request) => (
            <tr key={request.id}>
              <td>
                <div className="fw-semibold">{request.title || request.services?.name || "Service Request"}</div>
                <small className="text-muted">{request.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : "No preferred date"}</small>
              </td>
              <td>
                <div className="fw-semibold">
                  {[request.user_profile?.first_name, request.user_profile?.last_name].filter(Boolean).join(" ") || request.user_profile?.email || "Resident"}
                </div>
                <small className="text-muted">{request.user_profile?.email || "No email"}</small>
              </td>
              <td>
                <div className="fw-semibold">{[request.units?.block, request.units?.number || request.units?.unit_number].filter(Boolean).join("-") || "N/A"}</div>
                <small className="text-muted">{request.units?.community?.name || "Community N/A"}</small>
              </td>
              <td>
                <Badge bg={getPriorityVariant(request.priority)}>{formatServiceRequestStatusLabel(request.priority || "medium")}</Badge>
              </td>
              <td>
                <Badge bg={getStatusVariant(request.status)}>{formatServiceRequestStatusLabel(request.status)}</Badge>
              </td>
              <td>{getPaymentLabel(request.payment_status)}</td>
              <td>{formatMoney(request.total_amount)}</td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Link href={`/service-requests/${request.id}`} className="btn btn-outline-primary btn-sm">
                    View
                  </Link>
                  {request.status === "pending" ? (
                    <Button variant="outline-info" size="sm" disabled={isUpdating} onClick={() => void onStatusUpdate(request.id, "in_progress")}>
                      Start
                    </Button>
                  ) : null}
                  {request.status === "pending" || request.status === "in_progress" ? (
                    <Button variant="outline-success" size="sm" disabled={isUpdating} onClick={() => void onStatusUpdate(request.id, "completed")}>
                      Complete
                    </Button>
                  ) : null}
                  {request.status === "pending" || request.status === "in_progress" ? (
                    <Button variant="outline-danger" size="sm" disabled={isUpdating} onClick={() => void onStatusUpdate(request.id, "cancelled")}>
                      Cancel
                    </Button>
                  ) : null}
                  {request.status === "completed" || request.status === "cancelled" ? (
                    <Button variant="outline-secondary" size="sm" disabled={isUpdating} onClick={() => void onStatusUpdate(request.id, "pending")}>
                      Reopen
                    </Button>
                  ) : null}
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
