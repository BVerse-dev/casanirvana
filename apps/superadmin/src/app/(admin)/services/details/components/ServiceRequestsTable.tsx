"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Form, Table } from "react-bootstrap";
import { useSearchParams } from "next/navigation";

import { useListServiceRequests, useUpdateServiceRequest, formatServiceRequestStatusLabel } from "@/hooks/useServiceRequests";

const PAGE_SIZE = 8;

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

const ServiceRequestsTable = () => {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id") || "";
  const { data: serviceRequests = [], isLoading, error } = useListServiceRequests(serviceId);
  const updateServiceRequest = useUpdateServiceRequest();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<{ variant: "success" | "danger"; message: string } | null>(null);

  const filtered = useMemo(() => {
    return serviceRequests.filter((request) => statusFilter === "all" || String(request.status || "pending") === statusFilter);
  }, [serviceRequests, statusFilter]);

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleStatusUpdate = async (id: string, status: "in_progress" | "completed" | "cancelled") => {
    setFeedback(null);

    try {
      await updateServiceRequest.mutateAsync({
        id,
        data: { status },
      });
      setFeedback({
        variant: "success",
        message: `Service request moved to ${formatServiceRequestStatusLabel(status)}.`,
      });
    } catch (mutationError) {
      console.error("Failed to update service request:", mutationError);
      setFeedback({
        variant: "danger",
        message: "Failed to update service request.",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="d-flex flex-wrap justify-content-between gap-3 align-items-end">
        <div>
          <CardTitle as="h5" className="mb-1">
            Service Requests
          </CardTitle>
          <p className="text-muted mb-0">Requests tied to this service.</p>
        </div>
        <div style={{ minWidth: 220 }}>
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </div>
      </CardHeader>
      <CardBody>
        {feedback ? (
          <Alert variant={feedback.variant} dismissible onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}
        {error ? <Alert variant="danger">Failed to load service requests.</Alert> : null}
        {isLoading ? (
          <div className="text-center py-5">Loading service requests...</div>
        ) : paginated.length ? (
          <>
            <Table responsive hover className="align-middle mb-3">
              <thead className="table-light">
                <tr>
                  <th>Resident</th>
                  <th>Unit</th>
                  <th>Preferred</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="fw-semibold">
                        {[request.user_profile?.first_name, request.user_profile?.last_name].filter(Boolean).join(" ") || request.user_profile?.email || "Resident"}
                      </div>
                      <small className="text-muted">{request.title || request.services?.name || "Service Request"}</small>
                    </td>
                    <td>
                      {[request.units?.block, request.units?.number || request.units?.unit_number].filter(Boolean).join("-") || "N/A"}
                    </td>
                    <td>{request.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : "Not set"}</td>
                    <td>
                      <Badge bg={getStatusVariant(request.status)}>{formatServiceRequestStatusLabel(request.status)}</Badge>
                    </td>
                    <td>{getPaymentLabel((request as any).payment_status)}</td>
                    <td>{formatMoney(request.total_amount)}</td>
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <Link href={`/service-requests/${request.id}`} className="btn btn-outline-primary btn-sm">
                          View
                        </Link>
                        {request.status === "pending" ? (
                          <Button size="sm" variant="outline-info" onClick={() => void handleStatusUpdate(request.id, "in_progress")}>
                            Start
                          </Button>
                        ) : null}
                        {request.status === "pending" || request.status === "in_progress" ? (
                          <Button size="sm" variant="outline-success" onClick={() => void handleStatusUpdate(request.id, "completed")}>
                            Complete
                          </Button>
                        ) : null}
                        {request.status === "pending" || request.status === "in_progress" ? (
                          <Button size="sm" variant="outline-danger" onClick={() => void handleStatusUpdate(request.id, "cancelled")}>
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center">
              <p className="text-muted mb-0">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} requests
              </p>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  Previous
                </button>
                <button className="btn btn-outline-secondary btn-sm" disabled={currentPage * PAGE_SIZE >= filtered.length} onClick={() => setPage((value) => value + 1)}>
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted mb-0">No service requests match the current filter.</p>
        )}
      </CardBody>
    </Card>
  );
};

export default ServiceRequestsTable;
