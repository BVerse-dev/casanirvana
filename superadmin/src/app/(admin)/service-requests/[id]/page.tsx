"use client";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Button, Tab, Tabs } from "react-bootstrap";
import { useGetServiceRequest } from "@/hooks/useServiceRequests";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useState } from "react";
import Link from "next/link";

const ServiceRequestDetailsPage = () => {
  const params = useParams();
  const requestId = params.id as string;
  const { data: serviceRequest, isLoading, error } = useGetServiceRequest(requestId);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Service Request Details" subName="Service Requests Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading service request details...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error || !serviceRequest) {
    return (
      <>
        <PageTitle title="Service Request Details" subName="Service Requests Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                {error ? "Error loading service request" : "Service request not found"}
                <div className="mt-3">
                  <Link href="/service-requests" className="btn btn-primary">
                    Back to Service Requests
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
        return "bg-info-subtle text-info";
      case "cancelled":
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <>
      <PageTitle title="Service Request Details" subName="Service Requests Management" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/service-requests" 
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
              Back to Service Requests
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
              {serviceRequest.status === "pending" && (
                <>
                  <Button variant="warning">
                    <IconifyIcon icon="ri:play-line" className="me-1" />
                    Start Service
                  </Button>
                  <Button variant="success">
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Mark as Completed
                  </Button>
                </>
              )}
              {serviceRequest.status === "in_progress" && (
                <Button variant="success">
                  <IconifyIcon icon="ri:check-line" className="me-1" />
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Main Service Request Information */}
        <Col xl={8}>
          <Card className="mb-4">
            <CardHeader className="border-bottom">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <CardTitle as="h4" className="mb-1">
                    {serviceRequest.services?.name}
                  </CardTitle>
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <Badge className={`py-1 px-2 fs-13 ${getStatusBadgeClass(serviceRequest.status)}`}>
                      {serviceRequest.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className="bg-info-subtle text-info py-1 px-2 fs-13">
                      {serviceRequest.services?.category}
                    </Badge>
                    <Badge className="bg-primary-subtle text-primary py-1 px-2 fs-13">
                      {formatCurrency(serviceRequest.total_amount)}
                    </Badge>
                  </div>
                </div>
                <div className="text-muted fs-13">
                  <div>ID: #{serviceRequest.id}</div>
                  <div>Requested: {formatDate(serviceRequest.created_at)}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardBody>
              <Tabs defaultActiveKey="details" className="mb-3">
                <Tab eventKey="details" title="Details">
                  <div className="mb-4">
                    <h6 className="mb-2">Service Details</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <small className="text-muted">Service Name</small>
                        <div className="fw-medium">{serviceRequest.services?.name}</div>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Category</small>
                        <div className="fw-medium text-capitalize">{serviceRequest.services?.category}</div>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Preferred Date</small>
                        <div className="fw-medium">
                          {serviceRequest.preferred_date ? new Date(serviceRequest.preferred_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }) : 'Not specified'}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Total Amount</small>
                        <div className="fw-medium text-success">{formatCurrency(serviceRequest.total_amount)}</div>
                      </div>
                    </div>
                  </div>

                  {serviceRequest.description && (
                    <div className="mb-4">
                      <h6 className="mb-2">Service Instructions</h6>
                      <div className="p-3 bg-light rounded">
                        <p className="mb-0 text-muted">
                          {serviceRequest.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Service Description */}
                  {serviceRequest.services?.description && (
                    <div className="mb-4">
                      <h6 className="mb-2">Service Description</h6>
                      <p className="text-muted mb-0 lh-base">
                        {serviceRequest.services.description}
                      </p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div>
                    <h6 className="mb-3">Timeline</h6>
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-marker bg-primary"></div>
                        <div className="timeline-content">
                          <h6 className="mb-1">Service Request Created</h6>
                          <small className="text-muted">{formatDate(serviceRequest.created_at)}</small>
                        </div>
                      </div>
                      {serviceRequest.updated_at !== serviceRequest.created_at && (
                        <div className="timeline-item">
                          <div className="timeline-marker bg-warning"></div>
                          <div className="timeline-content">
                            <h6 className="mb-1">Last Updated</h6>
                            <small className="text-muted">{formatDate(serviceRequest.updated_at)}</small>
                          </div>
                        </div>
                      )}
                      {serviceRequest.status === "completed" && (
                        <div className="timeline-item">
                          <div className="timeline-marker bg-success"></div>
                          <div className="timeline-content">
                            <h6 className="mb-1">Service Completed</h6>
                            <small className="text-muted">{formatDate(serviceRequest.updated_at)}</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Tab>
                
                <Tab eventKey="history" title="Service History">
                  <div className="text-center p-4">
                    <IconifyIcon icon="ri:history-line" className="fs-48 text-muted mb-3" />
                    <p className="text-muted">Service history will be displayed here</p>
                  </div>
                </Tab>
                
                <Tab eventKey="actions" title="Actions">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="border rounded p-3">
                        <h6 className="mb-3">Status Management</h6>
                        <div className="d-grid gap-2">
                          {serviceRequest.status === "pending" && (
                            <>
                              <Button variant="warning" size="sm">
                                <IconifyIcon icon="ri:play-line" className="me-1" />
                                Start Service
                              </Button>
                              <Button variant="success" size="sm">
                                <IconifyIcon icon="ri:check-line" className="me-1" />
                                Mark as Completed
                              </Button>
                              <Button variant="danger" size="sm">
                                <IconifyIcon icon="ri:close-line" className="me-1" />
                                Cancel Service
                              </Button>
                            </>
                          )}
                          {serviceRequest.status === "in_progress" && (
                            <>
                              <Button variant="success" size="sm">
                                <IconifyIcon icon="ri:check-line" className="me-1" />
                                Mark as Completed
                              </Button>
                              <Button variant="secondary" size="sm">
                                <IconifyIcon icon="ri:pause-line" className="me-1" />
                                Pause Service
                              </Button>
                            </>
                          )}
                          {serviceRequest.status === "completed" && (
                            <Button variant="warning" size="sm">
                              <IconifyIcon icon="ri:restart-line" className="me-1" />
                              Reopen Service
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="border rounded p-3">
                        <h6 className="mb-3">Communication</h6>
                        <div className="d-grid gap-2">
                          <Button variant="outline-primary" size="sm">
                            <IconifyIcon icon="ri:phone-line" className="me-1" />
                            Contact Resident
                          </Button>
                          <Button variant="outline-info" size="sm">
                            <IconifyIcon icon="ri:mail-line" className="me-1" />
                            Send Email
                          </Button>
                          <Button variant="outline-warning" size="sm">
                            <IconifyIcon icon="ri:message-line" className="me-1" />
                            Send SMS
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    {serviceRequest.user_profile?.first_name} {serviceRequest.user_profile?.last_name}
                  </h6>
                  <p className="text-muted mb-0 fs-13">Resident</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted">Unit</small>
                    <div className="fw-medium">{serviceRequest.units?.number}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Block</small>
                    <div className="fw-medium">{serviceRequest.units?.block}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Community</small>
                  <div className="fw-medium">{serviceRequest.units?.communities?.name}</div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Email</small>
                  <div className="fw-medium">{serviceRequest.user_profile?.email}</div>
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
                {serviceRequest.status === "pending" && (
                  <>
                    <Button variant="success" size="sm">
                      <IconifyIcon icon="ri:check-line" className="me-1" />
                      Mark as Completed
                    </Button>
                    <Button variant="warning" size="sm">
                      <IconifyIcon icon="ri:play-line" className="me-1" />
                      Start Service
                    </Button>
                  </>
                )}
                {serviceRequest.status === "in_progress" && (
                  <Button variant="success" size="sm">
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Mark as Completed
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
                  Reschedule Service
                </Button>
                <Button variant="outline-danger" size="sm">
                  <IconifyIcon icon="ri:close-line" className="me-1" />
                  Cancel Service
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Service Statistics */}
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
                    <h5 className="mb-1 text-primary">8</h5>
                    <small className="text-muted">Total Requests</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-success">5</h5>
                    <small className="text-muted">Completed</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-warning">2</h5>
                    <small className="text-muted">In Progress</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-2">
                    <h5 className="mb-1 text-info">1</h5>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ServiceRequestDetailsPage;
