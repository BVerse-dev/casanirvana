"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, Row } from "react-bootstrap";
import { useSearchParams } from "next/navigation";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import ServiceRequestsStats from "./ServiceRequestsStats";
import ServiceRequestsTable from "./ServiceRequestsTable";
import { useListServiceRequests, useUpdateServiceRequest } from "@/hooks/useServiceRequests";
import { getServiceDisplayName } from "@/hooks/useServices";

const PAGE_SIZE = 12;

const ServiceRequestsView = () => {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId") || undefined;
  const { data: serviceRequests = [], isLoading, isError } = useListServiceRequests(serviceId);
  const updateServiceRequest = useUpdateServiceRequest();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<{ variant: "success" | "danger"; message: string } | null>(null);

  const serviceScopeLabel = useMemo(() => {
    if (!serviceId) return null;
    return serviceRequests[0]?.services ? getServiceDisplayName(serviceRequests[0].services) : `Service ${serviceId}`;
  }, [serviceId, serviceRequests]);

  const filteredData = useMemo(() => {
    return serviceRequests.filter((request) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        String(request.title || request.services?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(request.user_profile?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(request.request_details || request.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || String(request.status || "pending") === statusFilter;
      const matchesPriority = priorityFilter === "all" || String(request.priority || "medium") === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priorityFilter, searchQuery, serviceRequests, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const currentData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleStatusUpdate = async (id: string, status: "in_progress" | "completed" | "cancelled" | "pending") => {
    setFeedback(null);
    try {
      await updateServiceRequest.mutateAsync({
        id,
        data: { status },
      });
      setFeedback({
        variant: "success",
        message: `Service request moved to ${status.replace(/_/g, " ")}.`,
      });
    } catch (error) {
      console.error("Failed to update service request status:", error);
      setFeedback({
        variant: "danger",
        message: "Failed to update service request status.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">Loading service requests...</CardBody>
      </Card>
    );
  }

  if (isError) {
    return <Alert variant="danger">Failed to load service requests.</Alert>;
  }

  return (
    <>
      <ServiceRequestsStats serviceRequests={serviceRequests} />

      <Card>
        <CardHeader className="border-0">
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <CardTitle as="h4" className="mb-2">
                All Service Requests
              </CardTitle>
              <p className="text-muted mb-0">
                {serviceScopeLabel ? `Scoped to ${serviceScopeLabel}.` : "Review and action resident service requests across communities."}
              </p>
            </Col>
            <Col lg={2}>
              <Form.Label>Search</Form.Label>
              <Form.Control
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search requests"
              />
            </Col>
            <Col lg={2}>
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
            </Col>
            <Col lg={2}>
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={priorityFilter}
                onChange={(event) => {
                  setPriorityFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Form.Select>
            </Col>
            <Col lg={2} className="text-lg-end">
              <div className="d-grid gap-2">
                <Link href="/services" className="btn btn-outline-primary">
                  Manage Services
                </Link>
                {serviceId ? (
                  <Link href="/service-requests" className="btn btn-outline-secondary">
                    Clear Scope
                  </Link>
                ) : null}
              </div>
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="px-0 pb-0">
          {feedback ? (
            <Alert variant={feedback.variant} dismissible onClose={() => setFeedback(null)} className="m-3 mb-0">
              {feedback.message}
            </Alert>
          ) : null}
          <ServiceRequestsTable serviceRequests={currentData} onStatusUpdate={handleStatusUpdate} isUpdating={updateServiceRequest.isPending} />
        </CardBody>
        <CardFooter>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <p className="text-muted mb-0">
              {filteredData.length === 0
                ? "No service requests match the current filters."
                : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filteredData.length)} of ${filteredData.length} service requests`}
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                Previous
              </button>
              <button className="btn btn-outline-secondary btn-sm" disabled={currentPage >= totalPages || filteredData.length === 0} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                Next
              </button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default ServiceRequestsView;
