"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, Row } from "react-bootstrap";

import PageTitle from "@/components/PageTitle";
import ServicesStats from "./components/ServicesStats";
import ServicesTable from "./components/ServicesTable";
import { getServiceDisplayName, getServiceStatus, useListServices } from "@/hooks/useServices";
import { useListServiceRequests } from "@/hooks/useServiceRequests";

const PAGE_SIZE = 12;

const ServicesPage = () => {
  const { data: services = [], isLoading, error } = useListServices();
  const { data: serviceRequests = [] } = useListServiceRequests();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => ["all", ...new Set(services.map((service) => String(service.category || "general")).filter(Boolean))],
    [services],
  );

  const requestCounts = useMemo(() => {
    return serviceRequests.reduce<Record<string, { total: number; pending: number; inProgress: number; completed: number; cancelled: number }>>(
      (accumulator, request) => {
        const key = String(request.service_id || request.services?.id || "");
        if (!key) return accumulator;
        const status = String(request.status || "pending");
        const current =
          accumulator[key] ||
          ({
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0,
          } as const);

        accumulator[key] = {
          total: current.total + 1,
          pending: current.pending + (status === "pending" ? 1 : 0),
          inProgress: current.inProgress + (status === "in_progress" ? 1 : 0),
          completed: current.completed + (status === "completed" ? 1 : 0),
          cancelled: current.cancelled + (status === "cancelled" ? 1 : 0),
        };
        return accumulator;
      },
      {},
    );
  }, [serviceRequests]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        getServiceDisplayName(service).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(service.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || String(service.category || "general") === categoryFilter;
      const matchesStatus = statusFilter === "all" || getServiceStatus(service) === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, searchQuery, services, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedServices = filteredServices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isLoading) {
    return (
      <>
        <PageTitle subName="Operations" title="Services" />
        <Card>
          <CardBody className="text-center py-5">Loading services...</CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Operations" title="Services" />

      {error ? <Alert variant="danger">Failed to load services.</Alert> : null}

      <ServicesStats services={services} serviceRequests={serviceRequests} />

      <Card>
        <CardHeader className="border-0 pb-0">
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <CardTitle as="h4" className="mb-2">
                Services Directory
              </CardTitle>
              <p className="text-muted mb-0">Manage service catalog availability and track request demand from one surface.</p>
            </Col>
            <Col lg={2}>
              <Form.Label>Search</Form.Label>
              <Form.Control
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search services"
              />
            </Col>
            <Col lg={2}>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(1);
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category
                          .split("_")
                          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
                          .join(" ")}
                  </option>
                ))}
              </Form.Select>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
            <Col lg={2} className="text-lg-end">
              <div className="d-grid gap-2">
                <Link href="/services/add" className="btn btn-success">
                  Add Service
                </Link>
                <Link href="/service-requests" className="btn btn-outline-primary">
                  View Requests
                </Link>
              </div>
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="px-0 pb-0">
          <ServicesTable services={paginatedServices} requestCounts={requestCounts} />
        </CardBody>
        <CardFooter>
          <Row className="align-items-center g-3">
            <Col md={6}>
              <p className="text-muted mb-0">
                {filteredServices.length === 0
                  ? "No services match the current filters."
                  : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filteredServices.length)} of ${filteredServices.length} services`}
              </p>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-md-end gap-2">
                <button className="btn btn-outline-secondary btn-sm" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  Previous
                </button>
                <button className="btn btn-outline-secondary btn-sm" disabled={currentPage >= totalPages || filteredServices.length === 0} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                  Next
                </button>
              </div>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </>
  );
};

export default ServicesPage;
