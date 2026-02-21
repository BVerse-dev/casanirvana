"use client";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Button, Tab, Tabs } from "react-bootstrap";
import { useGetAmenityBooking, useUpdateAmenityBooking } from "@/hooks/useAmenities";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

const AmenityBookingDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const { data: booking, isLoading, error } = useGetAmenityBooking(bookingId);
  const updateAmenityBooking = useUpdateAmenityBooking();
  const [activeTab, setActiveTab] = useState("details");

  if (isLoading) {
    return (
      <>
        <PageTitle title="Booking Details" subName="Amenity Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4">Loading booking details...</div>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <PageTitle title="Booking Details" subName="Amenity Management" />
        <Row>
          <Col xl={12}>
            <Card>
              <div className="text-center p-4 text-danger">
                {error ? "Error loading booking" : "Booking not found"}
                <div className="mt-3">
                  <Link href="/amenities/bookings" className="btn btn-primary">
                    Back to Bookings
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
      case "confirmed":
        return "bg-success-subtle text-success";
      case "pending":
        return "bg-warning-subtle text-warning";
      case "cancelled":
        return "bg-danger-subtle text-danger";
      case "completed":
        return "bg-info-subtle text-info";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-subtle text-success";
      case "pending":
        return "bg-warning-subtle text-warning";
      case "failed":
        return "bg-danger-subtle text-danger";
      case "refunded":
        return "bg-info-subtle text-info";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = () => {
    if (!booking.start_time || !booking.end_time) return 'N/A';
    const start = new Date(`2024-01-01 ${booking.start_time}`);
    const end = new Date(`2024-01-01 ${booking.end_time}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const handleApprove = async () => {
    try {
      await updateAmenityBooking.mutateAsync({
        id: booking.id,
        updates: {
          status: 'confirmed',
          payment_status: booking.total_amount > 0 ? booking.payment_status : 'paid',
        },
      });
      toast.success('Booking approved');
    } catch (mutationError) {
      console.error('Failed to approve booking:', mutationError);
      toast.error('Failed to approve booking');
    }
  };

  const handleReject = async () => {
    try {
      await updateAmenityBooking.mutateAsync({
        id: booking.id,
        updates: {
          status: 'cancelled',
          payment_status: booking.payment_status === 'paid' ? 'refunded' : booking.payment_status,
        },
      });
      toast.success('Booking rejected');
    } catch (mutationError) {
      console.error('Failed to reject booking:', mutationError);
      toast.error('Failed to reject booking');
    }
  };

  return (
    <>
      <PageTitle title="Amenity Booking Details" subName="Amenity Management" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/amenities/bookings" 
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
              Back to Bookings
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
                      icon="ri:calendar-line"
                      className="fs-24 text-primary"
                    />
                  </div>
                  <div>
                    <h4 className="mb-1">{booking.amenities?.name || "Amenity Booking"}</h4>
                    <p className="text-muted mb-0">Booking ID: #{booking.id}</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {booking.status === "pending" && (
                    <>
                      <Button variant="success" size="sm" onClick={handleApprove} disabled={updateAmenityBooking.isPending}>
                        <IconifyIcon icon="ri:check-line" className="me-1" />
                        Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={handleReject} disabled={updateAmenityBooking.isPending}>
                        <IconifyIcon icon="ri:close-line" className="me-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="primary" size="sm" onClick={() => router.push('/amenities/bookings')}>
                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                    Back to Bookings
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
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon="ri:calendar-check-line" className="fs-20 text-white" />
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
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Payment</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    {booking.payment_status.toUpperCase()}
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
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Duration</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">{calculateDuration()}</h6>
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
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">Amount</h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    ${booking.total_amount}
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
                <Tab eventKey="details" title="Booking Details">
                  <div className="tab-content mt-3">
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Booking Information</h6>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Date:</label>
                            <p className="mb-0 fw-medium">{formatDate(booking.booking_date)}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Time:</label>
                            <p className="mb-0 fw-medium">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Duration:</label>
                            <p className="mb-0 fw-medium">{calculateDuration()}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Status:</label>
                            <p className="mb-0">
                              <Badge className={`${getStatusBadgeClass(booking.status)} fs-12`}>
                                {booking.status.toUpperCase()}
                              </Badge>
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Payment Information</h6>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Total Amount:</label>
                            <p className="mb-0 fw-medium text-success fs-18">
                              ${booking.total_amount}
                            </p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label text-muted">Payment Status:</label>
                            <p className="mb-0">
                              <Badge className={`${getPaymentBadgeClass(booking.payment_status)} fs-12`}>
                                {booking.payment_status.toUpperCase()}
                              </Badge>
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {booking.notes && (
                      <div className="mb-4">
                        <h6 className="fw-semibold mb-3">Notes</h6>
                        <p className="text-muted mb-0">{booking.notes}</p>
                      </div>
                    )}

                    {booking.special_requests && (
                      <div className="mb-4">
                        <h6 className="fw-semibold mb-3">Special Requests</h6>
                        <p className="text-muted mb-0">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>
                </Tab>
                <Tab eventKey="timeline" title="Timeline">
                  <div className="tab-content mt-3">
                    <div className="timeline-container">
                      <div className="timeline-item">
                        <div className="timeline-marker bg-primary"></div>
                        <div className="timeline-content">
                          <h6 className="mb-1">Booking Created</h6>
                          <p className="text-muted mb-1">Booking request submitted</p>
                          <small className="text-muted">{formatDateTime(booking.created_at)}</small>
                        </div>
                      </div>
                      {booking.status !== "pending" && (
                        <div className="timeline-item">
                          <div className={`timeline-marker ${booking.status === "confirmed" ? "bg-success" : "bg-danger"}`}></div>
                          <div className="timeline-content">
                            <h6 className="mb-1">
                              Booking {booking.status === "confirmed" ? "Approved" : "Cancelled"}
                            </h6>
                            <p className="text-muted mb-1">
                              Status updated to {booking.status}
                            </p>
                            <small className="text-muted">{formatDateTime(booking.updated_at)}</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </CardHeader>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xl={4}>
          {/* Amenity Info */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Amenity Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="avatar-md rounded-circle bg-primary bg-opacity-10 flex-centered">
                  <IconifyIcon icon="ri:building-line" className="fs-20 text-primary" />
                </div>
                <div>
                  <h6 className="mb-1">{booking.amenities?.name || "Unknown Amenity"}</h6>
                  <p className="text-muted mb-0 fs-13">{booking.amenities?.amenity_type || "General"}</p>
                </div>
              </div>
              
              {booking.amenities?.description && (
                <div className="border-top pt-3">
                  <p className="text-muted mb-0 fs-13">{booking.amenities.description}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Resident Info */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Resident Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="avatar-md rounded-circle bg-success bg-opacity-10 flex-centered">
                  <IconifyIcon icon="ri:user-line" className="fs-20 text-success" />
                </div>
                <div>
                  <h6 className="mb-1">
                    {booking.user_profile?.first_name} {booking.user_profile?.last_name}
                  </h6>
                  <p className="text-muted mb-0 fs-13">{booking.user_profile?.email}</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phone:</span>
                  <span className="fw-medium">{booking.user_profile?.phone || "N/A"}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          {booking.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle as="h5" className="mb-0">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="d-grid gap-2">
                  <Button variant="success" size="sm" onClick={handleApprove} disabled={updateAmenityBooking.isPending}>
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    Approve Booking
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleReject} disabled={updateAmenityBooking.isPending}>
                    <IconifyIcon icon="ri:close-line" className="me-1" />
                    Reject Booking
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => router.push('/amenities/bookings')}>
                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                    Back to Bookings
                  </Button>
                  <Button variant="info" size="sm">
                    <IconifyIcon icon="ri:message-3-line" className="me-1" />
                    Send Message
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>

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

export default AmenityBookingDetailsPage; 
