"use client";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Button, Tab, Tabs } from "react-bootstrap";
import { useGetMaintenanceRequest, useUpdateMaintenanceRequest } from "@/hooks/useMaintenanceRequests";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const MaintenanceRequestDetailsPage = () => {
  const params = useParams();
  const requestId = params.id as string;
  const { data: request, isLoading, error } = useGetMaintenanceRequest(requestId);
  const updateMaintenanceRequest = useUpdateMaintenanceRequest(requestId);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Maintenance Request Details" subName="Maintenance Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading maintenance request details...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error || !request) {
    return (
      <>
        <PageTitle title="Maintenance Request Details" subName="Maintenance Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                {error ? "Error loading maintenance request" : "Maintenance request not found"}
                <div className="mt-3">
                  <Link href="/maintenance-requests" className="btn btn-primary">
                    Back to Maintenance Requests
                  </Link>
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
      case "completed":
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const attachments = Array.isArray(request.images)
    ? request.images.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  // Handle status updates
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateMaintenanceRequest.mutateAsync({
        status: newStatus,
        updated_at: new Date().toISOString(),
        // Add completion fields when closing request
        ...(newStatus === 'completed' && {
          resolved_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        }),
        // Clear completion fields if reopening
        ...(newStatus !== 'completed' && {
          resolved_at: null,
          completed_at: null,
        })
      });
    } catch (error) {
      console.error('Error updating maintenance request status:', error);
    }
  };

  // Handle resolve/reopen toggle
  const handleToggleResolve = async () => {
    const currentStatus = request?.status || 'pending';
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await handleStatusUpdate(newStatus);
  };

  return (
    <>
      <PageTitle title="Maintenance Request Details" subName="Maintenance Management" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/maintenance-requests" 
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
              Back to Maintenance Requests
            </Link>
          </div>
        </Col>
      </Row>
      
      {/* Header Section */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-lg bg-primary bg-opacity-10 rounded flex-centered">
                    <IconifyIcon
                      icon="ri:tools-line"
                      className="fs-24 text-primary"
                    />
                  </div>
                  <div>
                    <h4 className="mb-1">{request.title}</h4>
                    <p className="text-muted mb-0">Request ID: #{request.id}</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Link href="/maintenance-requests" className="btn btn-outline-secondary">
                    <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
                    Back to List
                  </Link>
                  <Button variant="primary">
                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                    Edit Request
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Status Cards */}
      <Row className="mb-4">
        <Col xl={3} lg={6}>
          <Card 
            className="border-0 h-100"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Status</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    {(request.status || 'pending').replace('_', ' ').toUpperCase()}
                  </h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:time-line" className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card 
            className="border-0 h-100"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Priority</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    {(request.priority || 'medium').toUpperCase()}
                  </h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:flag-line" className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card 
            className="border-0 h-100"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Type</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">{request.request_type || 'General'}</h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:tools-line" className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card 
            className="border-0 h-100"
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Estimated Cost</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    {request.estimated_cost ? `₹${request.estimated_cost.toLocaleString()}` : "TBD"}
                  </h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:money-dollar-circle-line" className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col xl={8}>
          <Card>
            <CardHeader>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || "details")}
                className="nav-tabs-custom"
              >
                <Tab eventKey="details" title="Request Details">
                  <div className="tab-content mt-3">
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Description</h6>
                      <p className="text-muted mb-0">{request.description}</p>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Request Information</h6>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Request Type:</label>
                            <p className="mb-0 fw-medium">{request.request_type}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Priority Level:</label>
                            <p className="mb-0">
                              <Badge className={`${getPriorityBadgeClass(request.priority)} fs-12`}>
                                {request.priority.toUpperCase()}
                              </Badge>
                            </p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Date Requested:</label>
                            <p className="mb-0 fw-medium">{request.created_at ? formatDate(request.created_at) : "N/A"}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Last Updated:</label>
                            <p className="mb-0 fw-medium">{request.updated_at ? formatDate(request.updated_at) : "N/A"}</p>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Cost Information</h6>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Estimated Cost:</label>
                            <p className="mb-0 fw-medium text-success">
                              {request.estimated_cost ? `₹${request.estimated_cost.toLocaleString()}` : "To be determined"}
                            </p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Payment Status:</label>
                            <p className="mb-0">
                              <Badge className="bg-warning-subtle text-warning fs-12">
                                Pending Approval
                              </Badge>
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="timeline" title="Timeline">
                  <div className="tab-content mt-3">
                    <div className="timeline-container">
                      <div className="timeline-item">
                        <div className="timeline-marker bg-primary"></div>
                        <div className="timeline-content">
                          <h6 className="mb-1">Request Submitted</h6>
                          <p className="text-muted mb-1">Initial maintenance request submitted by resident</p>
                          <small className="text-muted">{request.created_at ? formatDate(request.created_at) : "N/A"}</small>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-marker bg-warning"></div>
                        <div className="timeline-content">
                          <h6 className="mb-1">Under Review</h6>
                          <p className="text-muted mb-1">Request is being reviewed by maintenance team</p>
                          <small className="text-muted">{request.updated_at ? formatDate(request.updated_at) : "N/A"}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="attachments" title={`Attachments (${attachments.length})`}>
                  <div className="tab-content mt-3">
                    {attachments.length > 0 ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0 fw-semibold">Uploaded Attachments</h6>
                          <small className="text-muted">{attachments.length} file(s)</small>
                        </div>
                        <Row className="g-3">
                          {attachments.map((attachmentUrl, index) => (
                            <Col md={4} sm={6} key={`${attachmentUrl}-${index}`}>
                              <div className="border rounded overflow-hidden bg-light">
                                <button
                                  type="button"
                                  className="w-100 border-0 p-0 bg-transparent"
                                  onClick={() => setSelectedAttachment(attachmentUrl)}
                                  style={{ height: 160, cursor: "zoom-in" }}
                                >
                                  <img
                                    src={attachmentUrl}
                                    alt={`Maintenance attachment ${index + 1}`}
                                    className="w-100 h-100 object-fit-cover"
                                  />
                                </button>
                                <div className="d-flex justify-content-between align-items-center p-2 border-top">
                                  <small className="text-muted">Attachment {index + 1}</small>
                                  <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-primary py-0 px-2"
                                  >
                                    Open
                                  </a>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <IconifyIcon icon="ri:file-list-3-line" className="fs-48 text-muted mb-3" />
                        <h6 className="text-muted">No attachments available</h6>
                        <p className="text-muted mb-0">Files and images related to this request will appear here</p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </CardHeader>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xl={4}>
          {/* Requester Info */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Requester Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="avatar-md rounded-circle bg-primary bg-opacity-10 flex-centered">
                  {(() => {
                    const avatarImage = mapAvatarUrl(request.requester_profile?.avatar_url);
                    return avatarImage ? (
                      <Image
                        src={avatarImage}
                        alt={request.requester_profile.full_name || "User"}
                        width={50}
                        height={50}
                        className="avatar-md rounded-circle"
                      />
                    ) : (
                      <IconifyIcon icon="ri:user-line" className="fs-20 text-primary" />
                    );
                  })()}
                </div>
                <div>
                  <h6 className="mb-1">{request.requester_profile?.full_name || "Unknown User"}</h6>
                  <p className="text-muted mb-0 fs-13">{request.requester_profile?.email || "N/A"}</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phone:</span>
                  <span className="fw-medium">{request.requester_profile?.phone || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Unit:</span>
                  <span className="fw-medium">{request.unit?.unit_number || request.unit?.number || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Block:</span>
                  <span className="fw-medium">{request.unit?.block || "N/A"}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={updateMaintenanceRequest.isPending || request?.status === 'in_progress'}
                >
                  <IconifyIcon icon="ri:check-line" className="me-1" />
                  {updateMaintenanceRequest.isPending ? 'Updating...' : 'Mark as In Progress'}
                </Button>
                <Button 
                  variant={request?.status === 'completed' ? 'warning' : 'success'} 
                  size="sm"
                  onClick={handleToggleResolve}
                  disabled={updateMaintenanceRequest.isPending}
                >
                  <IconifyIcon icon={request?.status === 'completed' ? 'ri:refresh-line' : 'ri:check-double-line'} className="me-1" />
                  {updateMaintenanceRequest.isPending 
                    ? 'Updating...' 
                    : (request?.status === 'completed' ? 'Reopen Request' : 'Mark as Completed')
                  }
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Status History
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="status-history">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="avatar-xs bg-danger bg-opacity-10 rounded-circle flex-centered">
                    <IconifyIcon icon="ri:time-line" className="fs-12 text-danger" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fs-13">Pending</h6>
                    <p className="text-muted mb-0 fs-12">{request.created_at ? formatDate(request.created_at) : "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {selectedAttachment && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setSelectedAttachment(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Attachment Preview</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAttachment(null)}
                />
              </div>
              <div className="modal-body text-center">
                <img src={selectedAttachment} alt="Maintenance attachment preview" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .timeline-container {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline-container::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e9ecef;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        
        .timeline-marker {
          position: absolute;
          left: -25px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #fff;
          z-index: 1;
        }
        
        .timeline-content {
          padding-left: 15px;
        }
      `}</style>
    </>
  );
};

export default MaintenanceRequestDetailsPage;
