"use client";

import { useMemo, useState } from "react";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListInquiries } from "@/hooks/useInquiries";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";

const STATUS_OPTIONS = ["all", "open", "in_progress", "resolved", "closed"] as const;
const TYPE_OPTIONS = ["all", "general_inquiry", "technical_support", "feedback", "suggestions"] as const;
const PRIORITY_OPTIONS = ["all", "low", "medium", "high", "urgent"] as const;

const formatTypeLabel = (value: string | null | undefined) => {
  if (!value) {
    return "N/A";
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatStatusLabel = (value: string | null | undefined) => {
  if (!value) {
    return "N/A";
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const statusBadgeClass = (status: string | null) => {
  switch (status) {
    case "open":
      return "bg-danger-subtle text-danger";
    case "in_progress":
      return "bg-warning-subtle text-warning";
    case "resolved":
      return "bg-success-subtle text-success";
    case "closed":
      return "bg-secondary-subtle text-secondary";
    default:
      return "bg-light text-muted";
  }
};

const priorityBadgeClass = (priority: string | null) => {
  switch (priority) {
    case "urgent":
      return "bg-danger text-white";
    case "high":
      return "bg-danger-subtle text-danger";
    case "medium":
      return "bg-warning-subtle text-warning";
    case "low":
      return "bg-success-subtle text-success";
    default:
      return "bg-light text-muted";
  }
};

const InquiriesPage = () => {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]>("all");
  const [priorityFilter, setPriorityFilter] = useState<(typeof PRIORITY_OPTIONS)[number]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 15;

  const { data: inquiries = [], isLoading, error } = useListInquiries({
    status: statusFilter === "all" ? undefined : statusFilter,
    inquiryType: typeFilter === "all" ? undefined : typeFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const searchedInquiries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return inquiries;
    }

    return inquiries.filter((inquiry) => {
      const residentName = inquiry.user_profile?.full_name || inquiry.user_name || "";
      const communityName = inquiry.community?.name || "";

      return [inquiry.subject, inquiry.description, residentName, communityName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [inquiries, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(searchedInquiries.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * pageSize;
  const paginatedInquiries = searchedInquiries.slice(pageStart, pageStart + pageSize);

  const stats = useMemo(
    () => ({
      total: inquiries.length,
      open: inquiries.filter((item) => item.status === "open").length,
      inProgress: inquiries.filter((item) => item.status === "in_progress").length,
      resolved: inquiries.filter((item) => item.status === "resolved").length,
    }),
    [inquiries],
  );

  return (
    <>
      <PageTitle title="Help Desk Inquiries" subName="Operations" />

      <Row className="mb-4">
        <Col sm={6} xl={3}>
          <Card className="h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Total</p>
                  <h4 className="mb-0">{stats.total}</h4>
                </div>
                <IconifyIcon icon="ri:inbox-line" className="fs-22 text-primary" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} xl={3}>
          <Card className="h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Open</p>
                  <h4 className="mb-0">{stats.open}</h4>
                </div>
                <IconifyIcon icon="ri:error-warning-line" className="fs-22 text-danger" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} xl={3}>
          <Card className="h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">In Progress</p>
                  <h4 className="mb-0">{stats.inProgress}</h4>
                </div>
                <IconifyIcon icon="ri:loader-4-line" className="fs-22 text-warning" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} xl={3}>
          <Card className="h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Resolved</p>
                  <h4 className="mb-0">{stats.resolved}</h4>
                </div>
                <IconifyIcon icon="ri:check-double-line" className="fs-22 text-success" />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card>
        <CardHeader>
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <CardTitle as="h4" className="mb-0">
              Inquiry Queue
            </CardTitle>
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <InputGroup style={{ minWidth: 260 }}>
                <InputGroup.Text>
                  <IconifyIcon icon="ri:search-line" />
                </InputGroup.Text>
                <Form.Control
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search subject, resident, community"
                />
              </InputGroup>
              <Form.Select
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value as (typeof TYPE_OPTIONS)[number]);
                  setCurrentPage(1);
                }}
                style={{ minWidth: 200 }}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option value={option} key={option}>
                    {option === "all" ? "All Types" : formatTypeLabel(option)}
                  </option>
                ))}
              </Form.Select>
              <Form.Select
                value={priorityFilter}
                onChange={(event) => {
                  setPriorityFilter(event.target.value as (typeof PRIORITY_OPTIONS)[number]);
                  setCurrentPage(1);
                }}
                style={{ minWidth: 160 }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option value={option} key={option}>
                    {option === "all" ? "All Priority" : formatTypeLabel(option)}
                  </option>
                ))}
              </Form.Select>
              <Form.Select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as (typeof STATUS_OPTIONS)[number]);
                  setCurrentPage(1);
                }}
                style={{ minWidth: 180 }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option value={option} key={option}>
                    {option === "all" ? "All Status" : formatStatusLabel(option)}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {isLoading ? (
            <div className="text-center py-5">Loading inquiries...</div>
          ) : error ? (
            <div className="text-center py-5 text-danger">Failed to load inquiries: {error.message}</div>
          ) : paginatedInquiries.length === 0 ? (
            <div className="text-center py-5 text-muted">No inquiries found for current filters.</div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Resident</th>
                  <th>Community</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInquiries.map((inquiry) => {
                  const residentName = inquiry.user_profile?.full_name || inquiry.user_name || "Unknown Resident";
                  const assigneeName = inquiry.assignee_profile?.full_name || "Unassigned";

                  return (
                    <tr key={inquiry.id}>
                      <td>
                        <Link className="text-decoration-none fw-semibold" href={`/help-desk/inquiries/${inquiry.id}`}>
                          {inquiry.subject}
                        </Link>
                        <div className="text-muted fs-12 text-truncate" style={{ maxWidth: 280 }}>
                          {inquiry.description}
                        </div>
                      </td>
                      <td>{formatTypeLabel(inquiry.inquiry_type)}</td>
                      <td>{residentName}</td>
                      <td>{inquiry.community?.name || "N/A"}</td>
                      <td>
                        <span className={`badge ${priorityBadgeClass(inquiry.priority)} px-2 py-1`}>
                          {formatTypeLabel(inquiry.priority)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusBadgeClass(inquiry.status)} px-2 py-1`}>
                          {formatStatusLabel(inquiry.status)}
                        </span>
                      </td>
                      <td>{assigneeName}</td>
                      <td>{inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : "N/A"}</td>
                      <td className="text-end">
                        <Link href={`/help-desk/inquiries/${inquiry.id}`}>
                          <Button variant="soft-primary" size="sm">
                            <IconifyIcon icon="ri:eye-line" className="me-1" />
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardBody>

        {!isLoading && !error && searchedInquiries.length > pageSize && (
          <CardBody className="border-top">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing {pageStart + 1} to {Math.min(pageStart + pageSize, searchedInquiries.length)} of {searchedInquiries.length}
              </small>
              <div className="d-flex align-items-center gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPageSafe <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <span className="small text-muted">
                  Page {currentPageSafe} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPageSafe >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        )}
      </Card>
    </>
  );
};

export default InquiriesPage;
