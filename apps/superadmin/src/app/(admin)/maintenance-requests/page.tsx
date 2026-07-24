"use client";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  useDeleteMaintenanceRequest,
  useListMaintenanceRequests,
  useUpdateMaintenanceRequestById,
} from "@/hooks/useMaintenanceRequests";
import { Database } from "@/lib/database.types";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
} from "react-bootstrap";
import MaintenanceRequestGridCard from "./components/MaintenanceRequestGridCard";
import { useMaintenanceRequestsSubscription } from "@/hooks/useMaintenanceRequests";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

type MaintenanceWithProfiles =
  Database["public"]["Tables"]["maintenance_requests"]["Row"] & {
    requester_profile?: Database["public"]["Tables"]["profiles"]["Row"] | null;
    assigned_profile?: Database["public"]["Tables"]["profiles"]["Row"] | null;
    resolved_by_profile?: Database["public"]["Tables"]["profiles"]["Row"] | null;
    unit?: Database["public"]["Tables"]["units"]["Row"] | null;
  };

const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return "TBD";
  return `GH₵${Number(value).toLocaleString()}`;
};

const formatStatusLabel = (value?: string | null) =>
  (value || "unknown")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getPriorityVariant = (value?: string | null) => {
  switch ((value || "").toLowerCase()) {
    case "urgent":
    case "high":
      return "danger";
    case "medium":
      return "warning";
    default:
      return "info";
  }
};

const getStatusVariant = (value?: string | null) => {
  switch ((value || "").toLowerCase()) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "pending":
      return "warning";
    case "cancelled":
      return "secondary";
    default:
      return "danger";
  }
};

const truncateText = (value?: string | null, maxLength = 50) => {
  if (!value) return "No description";
  return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
};

const MaintenanceRequestsPage = () => {
  useMaintenanceRequestsSubscription();
  const { data: maintenanceRequests = [], isLoading, error } =
    useListMaintenanceRequests();
  const updateMaintenanceRequestById = useUpdateMaintenanceRequestById();
  const deleteMaintenanceRequest = useDeleteMaintenanceRequest();
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          maintenanceRequests
            .map((request) => request.request_type?.trim())
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [maintenanceRequests],
  );

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return maintenanceRequests.filter((request) => {
      const unitLabel = request.unit?.unit_number || request.unit?.number || "";
      const searchable = [
        request.requester_profile?.full_name,
        unitLabel,
        request.title,
        request.description,
        request.request_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (statusFilter === "all" || request.status === statusFilter) &&
        (priorityFilter === "all" || request.priority === priorityFilter) &&
        (typeFilter === "all" || request.request_type === typeFilter)
      );
    });
  }, [maintenanceRequests, priorityFilter, searchTerm, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredRequests]);
  const hasActiveFilters = Boolean(
    searchTerm.trim() || statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all",
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [priorityFilter, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleToggleCompletion = async (
    request: MaintenanceWithProfiles,
  ) => {
    setFeedback(null);
    const newStatus = request.status === "completed" ? "pending" : "completed";

    try {
      await updateMaintenanceRequestById.mutateAsync({
        id: request.id,
        updates: { status: newStatus },
      });
      setFeedback({
        variant: "success",
        message:
          newStatus === "completed"
            ? `Maintenance request #${request.id} marked as completed.`
            : `Maintenance request #${request.id} reopened successfully.`,
      });
    } catch (error) {
      console.error("Failed to update maintenance status:", error);
      setFeedback({
        variant: "danger",
        message: `Failed to update maintenance request #${request.id}.`,
      });
    }
  };

  const handleDelete = async (request: MaintenanceWithProfiles) => {
    setFeedback(null);
    const shouldDelete = window.confirm(
      `Delete maintenance request #${request.id}? This action cannot be undone.`,
    );
    if (!shouldDelete) return;

    try {
      await deleteMaintenanceRequest.mutateAsync(request.id);
      setFeedback({
        variant: "success",
        message: `Maintenance request #${request.id} was deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete maintenance request:", error);
      setFeedback({
        variant: "danger",
        message: `Failed to delete maintenance request #${request.id}.`,
      });
    }
  };

  if (isLoading) {
    return <div>Loading maintenance requests...</div>;
  }

  if (error) {
    return (
      <>
        <PageTitle title="Maintenance Requests" subName="Casa Nirvana" />
        <Alert variant="danger">Unable to load maintenance requests. Please try again.</Alert>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Maintenance Requests" subName="Casa Nirvana" />
      <MaintenanceRequestGridCard />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={"h4"}>All Maintenance Requests</CardTitle>
                <p className="text-muted mb-0 fs-13">
                  {maintenanceRequests.length.toLocaleString()} live requests
                </p>
              </div>
              <span className="badge bg-light-subtle text-muted border">
                Real-time list
              </span>
            </CardHeader>
            <CardBody className="p-0">
              {feedback ? (
                <Alert
                  variant={feedback.variant}
                  className="m-3 mb-0"
                  onClose={() => setFeedback(null)}
                  dismissible
                >
                  {feedback.message}
                </Alert>
              ) : null}
              <div className="p-3 border-bottom">
                <Row className="g-3 align-items-end">
                  <Col xl={4} lg={6}>
                    <Form.Label className="mb-1">Search</Form.Label>
                    <Form.Control
                      type="search"
                      value={searchTerm}
                      placeholder="Requester, unit, title, description or type"
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </Col>
                  <Col xl={2} lg={6}>
                    <Form.Label className="mb-1">Status</Form.Label>
                    <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Col>
                  <Col xl={2} lg={6}>
                    <Form.Label className="mb-1">Priority</Form.Label>
                    <Form.Select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Form.Select>
                  </Col>
                  <Col xl={2} lg={6}>
                    <Form.Label className="mb-1">Type</Form.Label>
                    <Form.Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                      <option value="all">All Types</option>
                      {typeOptions.map((type) => (
                        <option key={type} value={type}>{formatStatusLabel(type)}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col xl={2} lg={12}>
                    <Button
                      variant="outline-secondary"
                      className="w-100"
                      disabled={!hasActiveFilters}
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                        setTypeFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Col>
                </Row>
              </div>
              <div className="table-responsive">
                <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th>Requester &amp; Unit</th>
                      <th>Request Date</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th>Cost</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">
                          {hasActiveFilters ? "No maintenance requests match the selected filters." : "No maintenance requests found."}
                        </td>
                      </tr>
                    ) : paginatedRequests.map((request) => {
                      return (
                        <tr key={request.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                {(() => {
                                  const avatarImage = mapAvatarUrl(request.requester_profile?.avatar_url);
                                  return avatarImage ? (
                                    <Image
                                      src={avatarImage}
                                      alt="avatar"
                                      width={40}
                                      height={40}
                                      className="avatar-sm rounded-circle"
                                    />
                                  ) : (
                                    <div className="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center">
                                      <IconifyIcon icon="ri:user-line" className="fs-16 text-muted" />
                                    </div>
                                  );
                                })()}
                              </div>
                              <div>
                                <Link
                                  href={`/maintenance-requests/${request.id}`}
                                  className="text-dark fw-medium fs-15"
                                >
                                  {request.requester_profile?.full_name ||
                                    "Unknown"}
                                </Link>
                                <p className="text-muted mb-0 fs-13">
                                  Unit: {request.unit?.unit_number || request.unit?.number || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            {request.created_at 
                              ? new Date(request.created_at).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>{formatStatusLabel(request.request_type)}</td>
                          <td>
                            <span
                              className={`badge bg-${getPriorityVariant(request.priority)} text-white fs-11`}
                            >
                              {formatStatusLabel(request.priority)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${getStatusVariant(request.status)} text-white fs-11`}
                            >
                              {formatStatusLabel(request.status)}
                            </span>
                          </td>
                          <td>{truncateText(request.description)}</td>
                          <td>{formatMoney(request.estimated_cost)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link
                                href={`/maintenance-requests/${request.id}`}
                                className="btn btn-light btn-sm"
                              >
                                <IconifyIcon
                                  icon="solar:eye-broken"
                                  className="align-middle fs-18"
                                />
                              </Link>
                              <Button
                                variant={
                                  request.status === "completed"
                                    ? "soft-warning"
                                    : "soft-success"
                                }
                                size="sm"
                                onClick={() => handleToggleCompletion(request)}
                                disabled={updateMaintenanceRequestById.isPending}
                                title={
                                  request.status === "completed"
                                    ? "Reopen Request"
                                    : "Mark Completed"
                                }
                              >
                                <IconifyIcon
                                  icon={
                                    request.status === "completed"
                                      ? "solar:refresh-broken"
                                      : "solar:check-read-broken"
                                  }
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDelete(request)}
                                disabled={deleteMaintenanceRequest.isPending}
                                title="Delete Request"
                              >
                                <IconifyIcon
                                  icon="solar:trash-bin-minimalistic-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
            <CardFooter className="border-top">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="text-muted fs-13">
                  Showing {paginatedRequests.length.toLocaleString()} of {filteredRequests.length.toLocaleString()} matching request
                  {filteredRequests.length === 1 ? "" : "s"}.
                </span>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-muted fs-13">Page {currentPage} of {totalPages}</span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default MaintenanceRequestsPage;
