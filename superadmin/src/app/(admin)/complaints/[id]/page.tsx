"use client";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Button, Tab, Tabs } from "react-bootstrap";
import { useGetComplaint } from "@/hooks/useComplaints";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useState } from "react";
import Link from "next/link";
import ComplaintComments from "../components/ComplaintComments";
import ComplaintActions from "../components/ComplaintActions";

const ComplaintDetailsPage = () => {
  const params = useParams();
  const complaintId = params.id as string;
  const { data: complaint, isLoading, error } = useGetComplaint(complaintId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Debug logging
  console.log('📊 Complaint details page state:', { 
    complaintId,
    isLoading, 
    error: error?.message, 
    complaint: complaint ? { id: complaint.id, subject: complaint.subject } : null
  });

  if (isLoading) {
    return (
      <>
        <PageTitle title="Complaint Details" subName="Complaints Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading complaint details...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error || !complaint) {
    return (
      <>
        <PageTitle title="Complaint Details" subName="Complaints Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                <h5>
                  {error ? "Error Loading Complaint" : "Complaint Not Found"}
                </h5>
                <p className="text-muted mb-3">
                  {error ? `Error: ${error.message}` : `No complaint found with ID: ${complaintId}`}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Link href="/complaints" className="btn btn-primary">
                    <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
                    Back to Complaints
                  </Link>
                  <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                    <IconifyIcon icon="ri:refresh-line" className="me-1" />
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

  const getComplaintType = (complaintType: string) => {
    return complaintType === 'personal' ? 'Personal' : 'Community';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const complaintType = getComplaintType(complaint.category);

  return (
    <>
      <PageTitle title="Complaint Details" subName="Complaints Management" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/complaints" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Complaints
            </Link>
            <div className="d-flex gap-2">
              <Button variant="soft-primary">
                <IconifyIcon icon="ri:edit-line" className="me-1" />
                Edit
              </Button>
              <Button variant="soft-secondary">
                <IconifyIcon icon="ri:download-line" className="me-1" />
                Export PDF
              </Button>
              {complaint.status === "pending" && (
                <>
                  <Button variant="warning">
                    <IconifyIcon icon="ri:play-line" className="me-1" />
                    Start Progress
                  </Button>
                  <Button variant="success">
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Mark as Resolved
                  </Button>
                </>
              )}
              {complaint.status === "in_progress" && (
                <Button variant="success">
                  <IconifyIcon icon="ri:check-line" className="me-1" />
                  Mark as Resolved
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Main Complaint Information */}
        <Col xl={8}>
          <Card className="mb-4">
            <CardHeader className="border-bottom">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <CardTitle as="h4" className="mb-1">
                    {complaint.subject}
                  </CardTitle>
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <Badge className={`py-1 px-2 fs-13 ${getStatusBadgeClass(complaint.status)}`}>
                      {complaint.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={`py-1 px-2 fs-13 ${getPriorityBadgeClass(complaint.priority)}`}>
                      {complaint.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <Badge className="bg-info-subtle text-info py-1 px-2 fs-13">
                      {complaint.category}
                    </Badge>
                    <Badge className="bg-primary-subtle text-primary py-1 px-2 fs-13">
                      {getComplaintType(complaint.complaint_type)}
                    </Badge>
                  </div>
                </div>
                <div className="text-muted fs-13">
                  <div>ID: #{complaint.id}</div>
                  <div>Filed: {formatDate(complaint.created_at)}</div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Tabs defaultActiveKey="details" className="mb-3">
                <Tab eventKey="details" title="Details">
                  <div className="mb-4">
                    <h6 className="mb-2">Description</h6>
                    <p className="text-muted mb-0 lh-base">
                      {complaint.details || 'No details available'}
                    </p>
                  </div>

                  {/* Attachments Section */}
                  {complaint.images && complaint.images.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Attachments ({complaint.images.length})</h6>
                      <Row className="g-3">
                        {complaint.images.map((image, index) => (
                          <Col md={3} key={index}>
                            <div 
                              className="border rounded overflow-hidden cursor-pointer"
                              onClick={() => setSelectedImage(image)}
                              style={{ height: "120px" }}
                            >
                              <img
                                src={image}
                                alt={`Attachment ${index + 1}`}
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {/* Resolution Notes */}
                  {complaint.resolution_notes && (
                    <div className="mb-4">
                      <h6 className="mb-2">Resolution Notes</h6>
                      <div className="p-3 bg-success-subtle rounded">
                        <p className="mb-0 text-success-emphasis">
                          {complaint.resolution_notes}
                        </p>
                        {complaint.resolved_by_profile && (
                          <small className="text-muted">
                            Resolved by: {(complaint.resolved_by_profile as any)?.first_name || 'N/A'} {(complaint.resolved_by_profile as any)?.last_name || ''}
                          </small>
                        )}
                        {complaint.resolved_by_profile_id && !complaint.resolved_by_profile && (
                          <small className="text-muted">
                            Resolved by: {complaint.resolved_by_profile_id.substring(0, 8)}...
                          </small>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div>
                    <h6 className="mb-3">Timeline</h6>
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-marker bg-primary"></div>
                        <div className="timeline-content">
                          <h6 className="mb-1">Complaint Filed</h6>
                          <small className="text-muted">{formatDate(complaint.created_at)}</small>
                        </div>
                      </div>
                      {complaint.updated_at !== complaint.created_at && (
                        <div className="timeline-item">
                          <div className="timeline-marker bg-warning"></div>
                          <div className="timeline-content">
                            <h6 className="mb-1">Last Updated</h6>
                            <small className="text-muted">{formatDate(complaint.updated_at)}</small>
                          </div>
                        </div>
                      )}
                      {complaint.status === "resolved" && (
                        <div className="timeline-item">
                          <div className="timeline-marker bg-success"></div>
                          <div className="timeline-content">
                            <h6 className="mb-1">Resolved</h6>
                            <small className="text-muted">{formatDate(complaint.updated_at)}</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Tab>
                
                <Tab eventKey="comments" title="Comments">
                  <ComplaintComments complaintId={complaintId} />
                </Tab>
                
                <Tab eventKey="actions" title="Actions">
                  <ComplaintActions complaint={complaint} />
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xl={4}>
          {/* Resident Information */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="ri:user-line" className="me-2" />
                Resident Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center mb-3">
                <div className="avatar-lg bg-primary bg-opacity-10 rounded flex-centered me-3">
                  <IconifyIcon icon="ri:user-fill" className="fs-24 text-primary" />
                </div>
                <div>
                  <h6 className="mb-1">
                    {(complaint.created_by_profile as any)?.first_name || 'N/A'} {(complaint.created_by_profile as any)?.last_name || ''}
                    {!complaint.created_by_profile && complaint.created_by_profile_id && (
                      <small className="text-muted d-block">ID: {complaint.created_by_profile_id.substring(0, 8)}...</small>
                    )}
                    {!complaint.created_by_profile && !complaint.created_by_profile_id && complaint.raised_by && (
                      <small className="text-muted d-block">ID: {complaint.raised_by.substring(0, 8)}...</small>
                    )}
                  </h6>
                  <p className="text-muted mb-0 fs-13">Resident</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted">Unit</small>
                    <div className="fw-medium">{(complaint.units as any)?.number || complaint.unit_id?.substring(0, 8) + '...' || 'N/A'}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Block</small>
                    <div className="fw-medium">{(complaint.units as any)?.block || 'N/A'}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Community</small>
                  <div className="fw-medium">{(complaint.units as any)?.communities?.name || 'N/A'}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-2">
                {complaint.status === "pending" && (
                  <>
                    <Button variant="success" size="sm">
                      <IconifyIcon icon="ri:check-line" className="me-1" />
                      Mark as Resolved
                    </Button>
                    <Button variant="warning" size="sm">
                      <IconifyIcon icon="ri:play-line" className="me-1" />
                      Start Progress
                    </Button>
                  </>
                )}
                {complaint.status === "in_progress" && (
                  <Button variant="success" size="sm">
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Mark as Resolved
                  </Button>
                )}
                <Button variant="outline-primary" size="sm">
                  <IconifyIcon icon="ri:phone-line" className="me-1" />
                  Contact Resident
                </Button>
                <Button variant="outline-info" size="sm">
                  <IconifyIcon icon="ri:mail-line" className="me-1" />
                  Send Email
                </Button>
                <Button variant="outline-warning" size="sm">
                  <IconifyIcon icon="ri:calendar-line" className="me-1" />
                  Schedule Visit
                </Button>
                <Button variant="outline-danger" size="sm">
                  <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                  Escalate Issue
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Complaint Statistics */}
          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                Related Statistics
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="row g-3 text-center">
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-primary">12</h5>
                    <small className="text-muted">Total Complaints</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-success">8</h5>
                    <small className="text-muted">Resolved</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-warning">3</h5>
                    <small className="text-muted">In Progress</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-danger">1</h5>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Attachment Preview</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedImage(null)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={selectedImage} 
                  alt="Attachment Preview" 
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComplaintDetailsPage;
