"use client";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";
import { useListComplaints } from "@/hooks/useComplaints";
import ComplaintGridCard from "./components/ComplaintGridCard";

const ComplaintsPage = () => {
  const { data: complaints = [], isLoading, error } = useListComplaints();

  // Debug logging
  console.log('📊 Complaints page state:', { 
    isLoading, 
    error: error?.message, 
    complaintsCount: complaints?.length,
    firstComplaint: complaints?.[0] 
  });

  if (isLoading) {
    return (
      <>
        <PageTitle title="Complaints Management" subName="Community Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading complaints...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageTitle title="Complaints Management" subName="Community Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                Error loading complaints: {error.message}
                <div className="mt-3">
                  <Button variant="primary" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-success-subtle text-success";
      case "in_progress":
        return "bg-warning-subtle text-warning";
      case "pending":
        return "bg-danger-subtle text-danger";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-danger-subtle text-danger";
      case "medium":
        return "bg-warning-subtle text-warning";
      case "low":
        return "bg-success-subtle text-success";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <PageTitle title="Complaints Management" subName="Community Management" />
      
      {/* Dashboard Components */}
      <ComplaintGridCard />
      
      {/* Complaints Table */}
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={"h4"} className="mb-0">
                  All Complaints ({complaints?.length || 0})
                </CardTitle>
              </div>
              <Dropdown>
                <DropdownToggle
                  as={"a"}
                  className="btn btn-sm btn-outline-light rounded content-none icons-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  This Month{" "}
                  <IconifyIcon
                    className="ms-1"
                    width={16}
                    height={16}
                    icon="ri:arrow-down-s-line"
                  />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem>Download</DropdownItem>
                  <DropdownItem>Export</DropdownItem>
                  <DropdownItem>Import</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </CardHeader>
            <div className="table-responsive">
              <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck1"
                        />
                        <label className="form-check-label" htmlFor="customCheck1" />
                      </div>
                    </th>
                    <th>Complaint Details</th>
                    <th>Resident</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`complaint-check-${complaint.id}`}
                          />
                          <label className="form-check-label" htmlFor={`complaint-check-${complaint.id}`}>
                            &nbsp;
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-start gap-3">
                          <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered">
                            <IconifyIcon
                              icon="ri:feedback-line"
                              className="fs-18 text-primary"
                            />
                          </div>
                          <div className="flex-grow-1">
                            <Link 
                              href={`/complaints/${complaint.id}`}
                              className="text-decoration-none"
                            >
                              <h6 className="mb-1 text-dark hover-primary">
                                {complaint.subject}
                              </h6>
                              <p className="text-muted mb-0 fs-13 hover-primary">
                                {complaint.details ? complaint.details.substring(0, 80) + '...' : 'No details available'}
                              </p>
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">
                            {(complaint.created_by_profile as any)?.first_name || 'N/A'}{" "}
                            {(complaint.created_by_profile as any)?.last_name || ''}
                          </div>
                          <small className="text-muted">
                            Unit: {(complaint.units as any)?.number || complaint.unit_id?.substring(0, 8) || 'N/A'}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${complaint.complaint_type === 'personal' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'} py-1 px-2 fs-13`}>
                          {complaint.complaint_type === 'personal' ? 'Personal' : 'Community'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info py-1 px-2 fs-13">
                          {complaint.category}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getPriorityBadgeClass(
                            complaint.priority
                          )} py-1 px-2 fs-13`}
                        >
                          {complaint.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusBadgeClass(
                            complaint.status
                          )} py-1 px-2 fs-13`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td>{formatDate(complaint.created_at)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/complaints/${complaint.id}`}>
                            <Button 
                              variant="light" 
                              size="sm"
                              className="d-flex align-items-center"
                            >
                              <IconifyIcon
                                icon="solar:eye-broken"
                                className="align-middle fs-18"
                              />
                            </Button>
                          </Link>
                          <Button variant="soft-primary" size="sm">
                            <IconifyIcon
                              icon="solar:pen-2-broken"
                              className="align-middle fs-18"
                            />
                          </Button>
                          {complaint.status === "pending" && (
                            <Button variant="soft-success" size="sm">
                              <IconifyIcon
                                icon="ri:check-line"
                                className="align-middle fs-18"
                              />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CardFooter className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted mb-0">
                  Showing{" "}
                  <span className="fw-semibold">{complaints.length}</span> of{" "}
                  <span className="fw-semibold">{complaints.length}</span> results
                </p>
              </div>
              <div>
                <ul className="pagination pagination-sm mb-0">
                  <li key="prev" className="page-item disabled">
                    <a className="page-link" href="#" tabIndex={-1}>
                      Previous
                    </a>
                  </li>
                  <li key="page-1" className="page-item active">
                    <a className="page-link" href="#">
                      1
                    </a>
                  </li>
                  <li key="page-2" className="page-item">
                    <a className="page-link" href="#">
                      2
                    </a>
                  </li>
                  <li key="page-3" className="page-item">
                    <a className="page-link" href="#">
                      3
                    </a>
                  </li>
                  <li key="next" className="page-item">
                    <a className="page-link" href="#">
                      Next
                    </a>
                  </li>
                </ul>
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ComplaintsPage;
