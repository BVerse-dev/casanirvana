"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Badge, Button } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getServiceDisplayName, getServiceStatus, useDeleteService, type Service } from "@/hooks/useServices";

interface RequestCounts {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

interface ServicesTableProps {
  services: Service[];
  requestCounts: Record<string, RequestCounts>;
}

const formatMoney = (amount?: number | null) =>
  Number(amount || 0) > 0
    ? new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
      }).format(Number(amount || 0))
    : "Free";

const formatLabel = (value?: string | null) => {
  if (!value) return "General";
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const ServicesTable = ({ services, requestCounts }: ServicesTableProps) => {
  const deleteServiceMutation = useDeleteService();
  const [feedback, setFeedback] = useState<{ variant: "success" | "danger"; message: string } | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      services.map((service) => ({
        service,
        counts: requestCounts[String(service.id)] || {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        },
      })),
    [requestCounts, services],
  );

  const handleDelete = async (service: Service) => {
    const serviceName = getServiceDisplayName(service);
    if (!window.confirm(`Delete \"${serviceName}\"? This cannot be undone.`)) {
      return;
    }

    setFeedback(null);
    setDeletingServiceId(String(service.id));

    try {
      await deleteServiceMutation.mutateAsync(String(service.id));
      setFeedback({
        variant: "success",
        message: `${serviceName} was deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete service:", error);
      setFeedback({
        variant: "danger",
        message: `Failed to delete ${serviceName}.`,
      });
    } finally {
      setDeletingServiceId(null);
    }
  };

  if (!rows.length) {
    return (
      <div className="text-center py-5">
        <IconifyIcon icon="solar:settings-bold-duotone" className="fs-1 text-muted mb-3" />
        <h5 className="text-muted">No services available</h5>
        <p className="text-muted mb-0">Create a service to make it available for resident booking.</p>
      </div>
    );
  }

  return (
    <>
      {feedback ? (
        <Alert variant={feedback.variant} dismissible onClose={() => setFeedback(null)} className="m-3 mb-0">
          {feedback.message}
        </Alert>
      ) : null}
      <div className="table-responsive">
        <table className="table align-middle text-nowrap table-hover table-centered mb-0">
          <thead className="bg-light-subtle">
            <tr>
              <th>Service</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Community</th>
              <th>Requests</th>
              <th>Status</th>
              <th>Created</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ service, counts }) => {
              const status = getServiceStatus(service);
              return (
                <tr key={service.id}>
                  <td>
                    <div className="d-flex align-items-start gap-2">
                      <div className="avatar-sm bg-primary-subtle rounded d-flex align-items-center justify-content-center">
                        <IconifyIcon icon="solar:settings-bold-duotone" className="fs-18 text-primary" />
                      </div>
                      <div>
                        <Link href={`/services/details?id=${service.id}`} className="text-dark fw-semibold text-decoration-none">
                          {getServiceDisplayName(service)}
                        </Link>
                        <p className="mb-0 text-muted fs-12">
                          {service.description ? `${service.description.slice(0, 70)}${service.description.length > 70 ? "..." : ""}` : "No description provided."}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {formatLabel(service.category)}
                    </Badge>
                  </td>
                  <td>
                    <div className="fw-semibold">{formatMoney((service as any).base_price)}</div>
                    <small className="text-muted">Base price</small>
                  </td>
                  <td>{(service as any).communities?.name || "All Communities"}</td>
                  <td>
                    <div className="fw-semibold">{counts.total}</div>
                    <small className="text-muted">
                      {counts.pending} pending, {counts.inProgress} active
                    </small>
                  </td>
                  <td>
                    <Badge bg={status === "active" ? "success" : "secondary"}>{formatLabel(status)}</Badge>
                  </td>
                  <td>{service.created_at ? new Date(service.created_at).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <div className="d-flex justify-content-end gap-2">
                      <Link href={`/service-requests?serviceId=${service.id}`} className="btn btn-outline-secondary btn-sm">
                        Requests
                      </Link>
                      <Link href={`/services/details?id=${service.id}`} className="btn btn-outline-primary btn-sm">
                        View
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => void handleDelete(service)}
                        disabled={deletingServiceId === String(service.id)}
                      >
                        {deletingServiceId === String(service.id) ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ServicesTable;
