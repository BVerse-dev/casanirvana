"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { type JoinRequest, type JoinRequestStatus, useListJoinRequests, useUpdateJoinRequest } from "@/hooks/useJoinRequests";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "react-bootstrap";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 20;
const statuses: Array<{ value: "" | JoinRequestStatus; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "pending_manual_review", label: "Manual review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusVariant = (status: JoinRequestStatus) => status === "approved" ? "success" : status === "rejected" ? "danger" : status === "pending_manual_review" ? "info" : "warning";
const statusLabel = (status: JoinRequestStatus) => status === "pending_manual_review" ? "Manual review" : `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";

const JoinRequestsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") || "";
  const rawStatus = searchParams.get("status");
  const status = statuses.some((item) => item.value === rawStatus) && rawStatus ? rawStatus as JoinRequestStatus : undefined;
  const [searchInput, setSearchInput] = useState(search);
  const [selected, setSelected] = useState<JoinRequest | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [notes, setNotes] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const query = useListJoinRequests({ page, pageSize: PAGE_SIZE, search, status });
  const pendingQuery = useListJoinRequests({ page: 1, pageSize: 1, status: "pending" });
  const manualReviewQuery = useListJoinRequests({ page: 1, pageSize: 1, status: "pending_manual_review" });
  const approvedQuery = useListJoinRequests({ page: 1, pageSize: 1, status: "approved" });
  const rejectedQuery = useListJoinRequests({ page: 1, pageSize: 1, status: "rejected" });
  const updateRequest = useUpdateJoinRequest();
  const payload = query.data;
  const statusCards = [
    { title: "Pending", value: pendingQuery.data?.count || 0, icon: "solar:clock-circle-bold-duotone", color: "warning" },
    { title: "Manual Review", value: manualReviewQuery.data?.count || 0, icon: "solar:document-text-bold-duotone", color: "info" },
    { title: "Approved", value: approvedQuery.data?.count || 0, icon: "solar:check-circle-bold-duotone", color: "success" },
    { title: "Rejected", value: rejectedQuery.data?.count || 0, icon: "solar:close-circle-bold-duotone", color: "danger" },
  ];

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.replace(`/communities/join-requests?${params.toString()}`, { scroll: false });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateQuery({ search: searchInput.trim() || null, page: null });
  };

  const openDetails = (request: JoinRequest) => {
    setSelected(request);
    setNotes(request.review_notes || "");
    setShowDetails(true);
  };

  const openDecision = (request: JoinRequest, nextDecision: "approved" | "rejected") => {
    setSelected(request);
    setDecision(nextDecision);
    setNotes(request.review_notes || "");
    setShowDetails(false);
  };

  const closeDecision = () => {
    setDecision(null);
    setSelected(null);
    setNotes("");
  };

  const confirmDecision = async () => {
    if (!selected || !decision || (decision === "rejected" && !notes.trim())) return;
    if (selected.status !== "pending" && selected.status !== "pending_manual_review") {
      toast.error("This request has already been reviewed");
      closeDecision();
      return;
    }
    try {
      await updateRequest.mutateAsync({ id: selected.id, status: decision, review_notes: notes.trim() || null });
      toast.success(`Join request ${decision}`);
      closeDecision();
    } catch {
      toast.error("The join request could not be updated");
    }
  };

  const requestUnit = (request: JoinRequest) => request.is_manual_entry
    ? request.manual_unit_info || "Manual unit details not provided"
    : [request.unit_block, request.unit_number].filter(Boolean).join("-") || "Unit not recorded";

  return (
    <>
      <Row className="g-3 mb-4">
        {statusCards.map((card) => (
          <Col xl={3} md={6} key={card.title}>
            <Card className="border-0 shadow-sm h-100">
              <CardBody className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">{card.title}</p>
                  <h3 className="mb-0">{card.value}</h3>
                </div>
                <div className={`avatar-lg rounded-circle bg-${card.color}-subtle d-flex align-items-center justify-content-center`}>
                  <IconifyIcon icon={card.icon} className={`fs-24 text-${card.color}`} />
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="border-0 shadow-sm">
      <CardHeader className="border-bottom">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
          <div><h4 className="mb-1">Community onboarding queue</h4><p className="text-muted mb-0">{payload?.count || 0} requests match the current scope and filters.</p></div>
          <div className="d-flex align-items-center gap-2">
            {(search || status) && (
              <Button variant="light" size="sm" onClick={() => { setSearchInput(""); updateQuery({ search: null, status: null, page: null }); }}>
                <IconifyIcon icon="ri:filter-off-line" className="me-1" />
                Clear filters
              </Button>
            )}
            <Badge bg="warning">{pendingQuery.data?.count || 0} pending</Badge>
          </div>
        </div>
        <Form onSubmit={submitSearch} className="row g-2 mt-3" role="search">
          <Col lg={7}><Form.Label visuallyHidden>Search join requests</Form.Label><Form.Control value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search resident, community, unit, phone or email" /></Col>
          <Col sm={7} lg={3}><Form.Label visuallyHidden>Status</Form.Label><Form.Select value={status || ""} onChange={(event) => updateQuery({ status: event.target.value || null, page: null })} aria-label="Filter join requests by status">{statuses.map((item) => <option key={item.value || "all"} value={item.value}>{item.label}</option>)}</Form.Select></Col>
          <Col sm={5} lg={2}><Button type="submit" variant="outline-primary" className="w-100"><IconifyIcon icon="ri:search-line" className="me-1" />Search</Button></Col>
        </Form>
      </CardHeader>
      <CardBody>
        {query.isLoading ? (
          <div className="text-center py-5"><span className="spinner-border text-primary" role="status" /><p className="text-muted mt-3 mb-0">Loading join requests...</p></div>
        ) : query.isError ? (
          <Alert variant="danger" className="text-center">Join requests could not be loaded. Refresh the page or try again.</Alert>
        ) : !payload?.data.length ? (
          <div className="text-center py-5"><IconifyIcon icon="ri:user-add-line" className="fs-48 text-muted mb-3" /><h5>No join requests found</h5><p className="text-muted mb-0">Adjust the search or status filter.</p></div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {payload.data.map((request) => (
              <Card className="border shadow-none mb-0" key={request.id}>
                <CardBody>
                <Row className="align-items-center g-3">
                  <Col xl={3}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-md rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                        <IconifyIcon icon="solar:user-plus-bold-duotone" className="fs-24" />
                      </div>
                      <div><h5 className="mb-1">{request.full_name || "Resident name unavailable"}</h5><p className="text-muted mb-0">{request.email || request.phone || "Contact unavailable"}</p></div>
                    </div>
                  </Col>
                  <Col xl={3}><p className="fw-medium mb-1">{request.community_name || "Community unavailable"}</p><p className="text-muted mb-0">{requestUnit(request)} {request.is_manual_entry && <Badge bg="warning" className="ms-1">Manual entry</Badge>}</p></Col>
                  <Col xl={2}>
                    <Badge bg={statusVariant(request.status)}>{statusLabel(request.status)}</Badge>
                    <small className="text-muted d-block mt-2">Submitted {formatDate(request.created_at)}</small>
                    {request.comments && <small className="text-muted d-block mt-1 text-truncate" title={request.comments}>{request.comments}</small>}
                  </Col>
                  <Col xl={4}><div className="d-flex flex-wrap justify-content-xl-end gap-2"><Button variant="info" size="sm" onClick={() => openDetails(request)}><IconifyIcon icon="ri:eye-line" className="me-1" />View Details</Button>{(request.status === "pending" || request.status === "pending_manual_review") && <><Button variant="success" size="sm" disabled={updateRequest.isPending} onClick={() => openDecision(request, "approved")}><IconifyIcon icon="ri:check-line" className="me-1" />Approve</Button><Button variant="outline-danger" size="sm" disabled={updateRequest.isPending} onClick={() => openDecision(request, "rejected")}><IconifyIcon icon="ri:close-line" className="me-1" />Reject</Button></>}</div></Col>
                </Row>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </CardBody>
      {!query.isLoading && !query.isError && (payload?.totalPages || 0) > 1 && <CardFooter className="d-flex justify-content-between align-items-center"><span className="text-muted">Page {payload?.page} of {payload?.totalPages}</span><div className="d-flex gap-2"><Button variant="light" disabled={page <= 1} onClick={() => updateQuery({ page: String(page - 1) })}>Previous</Button><Button variant="light" disabled={page >= (payload?.totalPages || 1)} onClick={() => updateQuery({ page: String(page + 1) })}>Next</Button></div></CardFooter>}

      <Modal show={showDetails && Boolean(selected)} onHide={() => setShowDetails(false)} centered size="lg"><ModalHeader closeButton><h5 className="mb-0">Join request details</h5></ModalHeader><ModalBody>{selected && <Row className="g-3">{[["Resident", selected.full_name], ["Email", selected.email], ["Phone", selected.phone], ["Community", selected.community_name], ["Unit", requestUnit(selected)], ["Submitted", formatDate(selected.created_at)], ["Message", selected.comments], ["Review notes", selected.review_notes], ["Reviewed by", selected.reviewer_name], ["Reviewed at", selected.reviewed_at ? formatDate(selected.reviewed_at) : null]].map(([title, value]) => <Col md={6} key={String(title)}><small className="text-muted d-block">{title}</small><span>{value || "Not recorded"}</span></Col>)}</Row>}</ModalBody><ModalFooter>{selected && (selected.status === "pending" || selected.status === "pending_manual_review") && <><Button variant="outline-danger" onClick={() => openDecision(selected, "rejected")}>Reject</Button><Button variant="success" onClick={() => openDecision(selected, "approved")}>Approve</Button></>}<Button variant="light" onClick={() => setShowDetails(false)}>Close</Button></ModalFooter></Modal>

      <Modal show={Boolean(decision && selected)} onHide={closeDecision} centered><ModalHeader closeButton><h5 className="mb-0">{decision === "approved" ? "Approve" : "Reject"} join request</h5></ModalHeader><ModalBody><p>Reviewing <strong>{selected?.full_name || "this resident"}</strong> for <strong>{selected?.community_name || "the selected community"}</strong>.</p><Form.Label htmlFor="join-review-notes">Review notes {decision === "rejected" ? "(required)" : "(optional)"}</Form.Label><Form.Control id="join-review-notes" as="textarea" rows={4} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} isInvalid={decision === "rejected" && !notes.trim()} /><Form.Control.Feedback type="invalid">Explain why the request is being rejected.</Form.Control.Feedback></ModalBody><ModalFooter><Button variant="light" onClick={closeDecision}>Cancel</Button><Button variant={decision === "approved" ? "success" : "danger"} disabled={updateRequest.isPending || (decision === "rejected" && !notes.trim())} onClick={confirmDecision}>{updateRequest.isPending ? "Saving..." : decision === "approved" ? "Approve request" : "Reject request"}</Button></ModalFooter></Modal>
      </Card>
    </>
  );
};

export default JoinRequestsList;
