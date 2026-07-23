"use client";

import DirectoryToolbar from "@/components/directory/DirectoryToolbar";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useDirectoryView } from "@/hooks/useDirectoryView";
import { useListResidents } from "@/hooks/useResidents";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Form, Row } from "react-bootstrap";

import ResidentData from "../grid-view/Components/ResidentData";
import ResidentDirectoryList from "./ResidentDirectoryList";

const PAGE_SIZE = 12;
const validStatuses = new Set(["active", "inactive", "suspended", "pending"]);

const positivePage = (value: string | null) => {
  const parsed = Number(value || 1);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const ResidentDirectory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { view, setView } = useDirectoryView("residents");
  const page = positivePage(searchParams.get("page"));
  const search = searchParams.get("search")?.trim() || "";
  const requestedStatus = searchParams.get("status") || "";
  const status = validStatuses.has(requestedStatus) ? requestedStatus : "";
  const [searchInput, setSearchInput] = useState(search);
  const residentsQuery = useListResidents({ page, pageSize: PAGE_SIZE, search, status });
  const payload = residentsQuery.data;
  const residents = payload?.data || [];

  useEffect(() => setSearchInput(search), [search]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`/residents?${params.toString()}`, { scroll: false });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateQuery({ search: searchInput.trim() || null, page: null });
  };

  const clearFilters = () => {
    setSearchInput("");
    updateQuery({ search: null, status: null, page: null });
  };

  const totalPages = payload?.totalPages || 0;
  const error = residentsQuery.error instanceof Error ? residentsQuery.error : null;

  return (
    <>
      <PageTitle title="Residents" subName="People" />
      <DirectoryToolbar
        title="Resident directory"
        description="Search and manage residents within your authorized communities."
        view={view}
        onViewChange={setView}
        actions={(
          <>
            <Button variant="outline-secondary" onClick={() => residentsQuery.refetch()} disabled={residentsQuery.isFetching}>
              <IconifyIcon icon="ri:refresh-line" className="me-1" />
              Refresh
            </Button>
            <Link href="/residents/add" className="btn btn-success">
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Resident
            </Link>
          </>
        )}
      />

      <Card className="mb-4">
        <CardBody>
          <Form onSubmit={submitSearch}>
            <Row className="g-3 align-items-end">
              <Col lg={7}>
                <Form.Label htmlFor="resident-search">Search</Form.Label>
                <Form.Control
                  id="resident-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Name, email, phone, unit or community"
                />
              </Col>
              <Col lg={3}>
                <Form.Label htmlFor="resident-status">Status</Form.Label>
                <Form.Select
                  id="resident-status"
                  value={status}
                  onChange={(event) => updateQuery({ status: event.target.value || null, page: null })}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Col>
              <Col lg={2} className="d-flex gap-2">
                <Button type="submit" className="flex-grow-1">Search</Button>
                {(search || status) && <Button type="button" variant="outline-secondary" onClick={clearFilters} aria-label="Clear filters"><IconifyIcon icon="ri:close-line" /></Button>}
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          {payload?.count ?? 0} {(payload?.count ?? 0) === 1 ? "resident" : "residents"}
        </p>
        {residentsQuery.isFetching && !residentsQuery.isLoading && <small className="text-muted">Updating...</small>}
      </div>

      {view === "grid" ? (
        <ResidentData residents={residents} isLoading={residentsQuery.isLoading} error={error} searchTerm={search} statusFilter={status || "all"} totalCount={payload?.count || 0} />
      ) : (
        <ResidentDirectoryList residents={residents} isLoading={residentsQuery.isLoading} error={error} />
      )}

      {totalPages > 1 && (
        <nav aria-label="Residents pagination" className="mt-3">
          <ul className="pagination justify-content-center mb-0">
            <li className={`page-item ${page <= 1 ? "disabled" : ""}`}><button className="page-link" disabled={page <= 1} onClick={() => updateQuery({ page: String(page - 1) })}>Previous</button></li>
            <li className="page-item disabled"><span className="page-link">Page {Math.min(page, totalPages)} of {totalPages}</span></li>
            <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}><button className="page-link" disabled={page >= totalPages} onClick={() => updateQuery({ page: String(page + 1) })}>Next</button></li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default ResidentDirectory;
