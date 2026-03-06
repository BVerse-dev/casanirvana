"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Badge, Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, Row } from "react-bootstrap";

import PageTitle from "@/components/PageTitle";
import { formatNoticeLabel, getNoticeStatus, useDeleteNotice, useListNotices } from "@/hooks/useNotices";

const PAGE_SIZE = 12;

const getPriorityVariant = (priority?: string | null) => {
  switch (priority) {
    case "urgent":
      return "danger";
    case "high":
      return "warning";
    case "low":
      return "success";
    case "medium":
    default:
      return "info";
  }
};

const getStatusVariant = (status?: string | null) => {
  switch (getNoticeStatus({ status })) {
    case "draft":
      return "secondary";
    case "archived":
      return "dark";
    case "published":
    default:
      return "success";
  }
};

const NoticeBoardPage = () => {
  const { data: notices = [], isLoading, error } = useListNotices();
  const deleteNotice = useDeleteNotice();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<{ variant: "success" | "danger"; message: string } | null>(null);

  const categories = useMemo(
    () => ["all", ...new Set(notices.map((notice) => String(notice.category || "general")).filter(Boolean))],
    [notices],
  );

  const stats = useMemo(() => {
    const total = notices.length;
    const featured = notices.filter((notice) => notice.is_featured).length;
    const urgent = notices.filter((notice) => ["urgent", "high"].includes(String(notice.priority || "medium"))).length;
    const published = notices.filter((notice) => getNoticeStatus(notice) === "published").length;
    return { total, featured, urgent, published };
  }, [notices]);

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(notice.author_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || String(notice.category || "general") === categoryFilter;
      const matchesStatus = statusFilter === "all" || getNoticeStatus(notice) === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, notices, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedNotices = filteredNotices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete \"${title}\"? This cannot be undone.`)) return;
    setFeedback(null);
    try {
      await deleteNotice.mutateAsync(id);
      setFeedback({ variant: "success", message: `${title} was deleted successfully.` });
    } catch (deleteError) {
      console.error("Failed to delete notice:", deleteError);
      setFeedback({ variant: "danger", message: `Failed to delete ${title}.` });
    }
  };

  return (
    <>
      <PageTitle title="Notice Board" subName="Communication" />

      {error ? <Alert variant="danger">Failed to load notices.</Alert> : null}

      <Row className="g-3 mb-4">
        <Col xl={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <p className="text-muted mb-2 fs-13">Total Notices</p>
              <h4 className="mb-1">{stats.total}</h4>
              <p className="text-muted mb-0 fs-12">All communication posts</p>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <p className="text-muted mb-2 fs-13">Published</p>
              <h4 className="mb-1">{stats.published}</h4>
              <p className="text-muted mb-0 fs-12">Currently visible notices</p>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <p className="text-muted mb-2 fs-13">Featured</p>
              <h4 className="mb-1">{stats.featured}</h4>
              <p className="text-muted mb-0 fs-12">Pinned priority posts</p>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <p className="text-muted mb-2 fs-13">High Priority</p>
              <h4 className="mb-1">{stats.urgent}</h4>
              <p className="text-muted mb-0 fs-12">Urgent or high-priority notices</p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card>
        <CardHeader className="border-0">
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <CardTitle as="h4" className="mb-2">
                Notices Directory
              </CardTitle>
              <p className="text-muted mb-0">Manage community announcements, bulletins, and official communication from one workspace.</p>
            </Col>
            <Col lg={2}>
              <Form.Label>Search</Form.Label>
              <Form.Control
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search notices"
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
                    {category === "all" ? "All Categories" : formatNoticeLabel(category)}
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </Col>
            <Col lg={2} className="text-lg-end">
              <Link href="/post/create" className="btn btn-success w-100">
                Create Notice
              </Link>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {feedback ? (
            <Alert variant={feedback.variant} dismissible onClose={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          ) : null}
          {isLoading ? (
            <div className="text-center py-5">Loading notices...</div>
          ) : paginatedNotices.length ? (
            <Row className="g-4">
              {paginatedNotices.map((notice) => (
                <Col xl={4} md={6} key={notice.id}>
                  <Card className="h-100 shadow-sm border-0">
                    <CardBody>
                      <div className="mb-3 rounded overflow-hidden bg-light" style={{ height: 180 }}>
                        {notice.image_url ? (
                          <img src={notice.image_url} alt={notice.title} className="w-100 h-100" style={{ objectFit: "cover" }} />
                        ) : notice.video_url ? (
                          <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                            <div className="fs-1">Video</div>
                            <div className="fs-13">External video attached</div>
                          </div>
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                            No media attached
                          </div>
                        )}
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <Badge bg={getStatusVariant(notice.status)}>{formatNoticeLabel(getNoticeStatus(notice))}</Badge>
                        <Badge bg={getPriorityVariant(notice.priority)}>{formatNoticeLabel(notice.priority || "medium")}</Badge>
                        {notice.is_featured ? <Badge bg="primary">Featured</Badge> : null}
                      </div>
                      <h5 className="mb-2">{notice.title}</h5>
                      <p className="text-muted mb-3">{notice.body.length > 140 ? `${notice.body.slice(0, 140)}...` : notice.body}</p>
                      <div className="d-flex justify-content-between text-muted fs-13 mb-3">
                        <span>{notice.author_name || "Administrator"}</span>
                        <span>{new Date(notice.posted_at || notice.created_at || new Date().toISOString()).toLocaleDateString()}</span>
                      </div>
                      <div className="d-flex justify-content-between text-muted fs-13 mb-3">
                        <span>{notice.communities?.name || "All Communities"}</span>
                        <span>{Number(notice.views_count || 0)} views</span>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <Link href={`/post/details?id=${notice.id}`} className="btn btn-outline-primary btn-sm">
                          View
                        </Link>
                        <Link href={`/post/edit?id=${notice.id}`} className="btn btn-outline-secondary btn-sm">
                          Edit
                        </Link>
                        <Button variant="outline-danger" size="sm" onClick={() => void handleDelete(notice.id, notice.title)} disabled={deleteNotice.isPending}>
                          Delete
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-5 text-muted">No notices match the current filters.</div>
          )}
        </CardBody>
        <CardFooter>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <p className="text-muted mb-0">
              {filteredNotices.length === 0
                ? "No notices available."
                : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filteredNotices.length)} of ${filteredNotices.length} notices`}
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                Previous
              </button>
              <button className="btn btn-outline-secondary btn-sm" disabled={currentPage >= totalPages || filteredNotices.length === 0} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                Next
              </button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default NoticeBoardPage;
