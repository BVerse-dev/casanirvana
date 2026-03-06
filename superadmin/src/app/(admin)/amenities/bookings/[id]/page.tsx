"use client";

import { useMemo, useState } from "react";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGetAmenityBooking, useUpdateAmenityBooking } from "@/hooks/useAmenities";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";

const formatLabel = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
};

const formatBookingWindow = (date?: string | null, startTime?: string | null, endTime?: string | null) => {
  if (!date && !startTime && !endTime) {
    return "N/A";
  }

  const dateLabel = date ? new Date(date).toLocaleDateString() : "Unknown date";
  const timeLabel = startTime ? `${startTime}${endTime ? ` - ${endTime}` : ""}` : "Time not set";

  return `${dateLabel} | ${timeLabel}`;
};

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const getBadgeClass = (status?: string | null) => {
  switch (status) {
    case "confirmed":
    case "paid":
      return "bg-success-subtle text-success";
    case "pending":
      return "bg-warning-subtle text-warning";
    case "completed":
      return "bg-info-subtle text-info";
    case "cancelled":
    case "failed":
      return "bg-danger-subtle text-danger";
    case "refunded":
      return "bg-secondary-subtle text-secondary";
    default:
      return "bg-light text-muted";
  }
};

const AmenityBookingDetailsPage = () => {
  const params = useParams();
  const bookingId = params.id as string;
  const { data: booking, isLoading, error } = useGetAmenityBooking(bookingId);
  const updateAmenityBooking = useUpdateAmenityBooking();
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);

  const handleStatusUpdate = async (
    updates: { status: "confirmed" | "cancelled" | "completed"; payment_status?: string },
    successMessage: string,
  ) => {
    if (!booking) {
      return;
    }

    setFeedback(null);

    try {
      await updateAmenityBooking.mutateAsync({
        id: booking.id,
        updates,
      });
      setFeedback({
        variant: "success",
        message: successMessage,
      });
    } catch (mutationError) {
      console.error("Failed to update booking:", mutationError);
      setFeedback({
        variant: "danger",
        message: "Failed to update amenity booking.",
      });
    }
  };

  const timeline = useMemo(() => {
    if (!booking) {
      return [];
    }

    const events = [
      booking.created_at
        ? {
            key: "created",
            title: "Booking Created",
            description: "The resident submitted a new booking request.",
            timestamp: booking.created_at,
            markerClass: "bg-primary",
          }
        : null,
      booking.status !== "pending" && booking.updated_at
        ? {
            key: "status-change",
            title:
              booking.status === "confirmed"
                ? "Booking Confirmed"
                : booking.status === "completed"
                  ? "Booking Completed"
                  : "Booking Cancelled",
            description: `Status changed to ${formatLabel(booking.status)}.`,
            timestamp: booking.updated_at,
            markerClass:
              booking.status === "cancelled"
                ? "bg-danger"
                : booking.status === "completed"
                  ? "bg-info"
                  : "bg-success",
          }
        : null,
    ];

    return events.filter(Boolean) as Array<{
      key: string;
      title: string;
      description: string;
      timestamp: string;
      markerClass: string;
    }>;
  }, [booking]);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Booking Details" subName="Amenity Management" />
        <Card>
          <CardBody className="text-center py-5">Loading booking details...</CardBody>
        </Card>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <PageTitle title="Booking Details" subName="Amenity Management" />
        <Alert variant="danger">
          {error ? "Failed to load booking details." : "Amenity booking not found."}
        </Alert>
        <Link href="/amenities/bookings" className="btn btn-outline-secondary btn-sm">
          Back to Bookings
        </Link>
      </>
    );
  }

  const residentName = `${booking.user_profile?.first_name || ""} ${
    booking.user_profile?.last_name || ""
  }`.trim() || "Unknown Resident";
  const canApprove = booking.status === "pending";
  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const canComplete = booking.status === "confirmed";

  return (
    <>
      <PageTitle title="Amenity Booking Details" subName="Amenity Management" />

      <Row className="mb-3">
        <Col xl={12}>
          <Link href="/amenities/bookings" className="btn btn-outline-secondary btn-sm">
            <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
            Back to Bookings
          </Link>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div className="avatar-lg bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="ri:calendar-line" className="fs-24 text-primary" />
                  </div>
                  <div>
                    <h4 className="mb-2">{booking.amenities?.name || "Amenity Booking"}</h4>
                    <p className="text-muted mb-2">Booking ID: {booking.id}</p>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge className={getBadgeClass(booking.status)}>{formatLabel(booking.status)}</Badge>
                      <Badge className={getBadgeClass(booking.payment_status)}>
                        Payment: {formatLabel(booking.payment_status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {canApprove ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        void handleStatusUpdate(
                          {
                            status: "confirmed",
                            payment_status:
                              Number(booking.total_amount || booking.amount || 0) > 0
                                ? booking.payment_status
                                : "paid",
                          },
                          "Booking approved.",
                        )
                      }
                      disabled={updateAmenityBooking.isPending}
                    >
                      <IconifyIcon icon="ri:check-line" className="me-1" />
                      Approve
                    </Button>
                  ) : null}
                  {canComplete ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        void handleStatusUpdate({ status: "completed" }, "Booking marked as completed.")
                      }
                      disabled={updateAmenityBooking.isPending}
                    >
                      <IconifyIcon icon="ri:checkbox-circle-line" className="me-1" />
                      Mark Completed
                    </Button>
                  ) : null}
                  {canCancel ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        void handleStatusUpdate(
                          {
                            status: "cancelled",
                            payment_status:
                              booking.payment_status === "paid" ? "refunded" : booking.payment_status,
                          },
                          "Booking cancelled.",
                        )
                      }
                      disabled={updateAmenityBooking.isPending}
                    >
                      <IconifyIcon icon="ri:close-line" className="me-1" />
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={8}>
          {feedback ? (
            <Alert
              variant={feedback.variant}
              className="mb-4"
              dismissible
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          ) : null}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Row className="g-3">
                <Col md={6}>
                  <small className="text-muted d-block">Booking Date</small>
                  <span className="fw-semibold">
                    {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "N/A"}
                  </span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Time Window</small>
                  <span className="fw-semibold">{formatBookingWindow(booking.booking_date, booking.start_time, booking.end_time)}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Amount</small>
                  <span className="fw-semibold">{formatMoney(booking.total_amount || booking.amount)}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Created</small>
                  <span className="fw-semibold">{formatDateTime(booking.created_at)}</span>
                </Col>
                {booking.notes ? (
                  <Col md={12}>
                    <small className="text-muted d-block">Resident Notes</small>
                    <span className="fw-semibold">{booking.notes}</span>
                  </Col>
                ) : null}
                {booking.special_requests ? (
                  <Col md={12}>
                    <small className="text-muted d-block">Special Requests</small>
                    <span className="fw-semibold">{booking.special_requests}</span>
                  </Col>
                ) : null}
              </Row>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Timeline
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="timeline">
                {timeline.map((event) => (
                  <div className="timeline-item" key={event.key}>
                    <div className={`timeline-marker ${event.markerClass}`}></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">{event.title}</h6>
                      <p className="text-muted mb-1">{event.description}</p>
                      <small className="text-muted">{formatDateTime(event.timestamp)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Resident Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Resident</span>
                <span className="fw-semibold">{residentName}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Email</span>
                <span className="fw-semibold">{booking.user_profile?.email || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Phone</span>
                <span className="fw-semibold">{booking.user_profile?.phone || "N/A"}</span>
              </div>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Amenity Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Amenity</span>
                <span className="fw-semibold">{booking.amenities?.name || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Type</span>
                <span className="fw-semibold">{formatLabel(booking.amenities?.amenity_type)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Description</span>
                <span className="fw-semibold text-end" style={{ maxWidth: 180 }}>
                  {booking.amenities?.description || "N/A"}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardBody className="d-grid gap-2">
              {booking.amenities?.id ? (
                <Link href={`/amenities/details/${booking.amenities.id}`}>
                  <Button variant="outline-primary" className="w-100">
                    View Amenity
                  </Button>
                </Link>
              ) : null}
              <Link href="/amenities/bookings">
                <Button variant="outline-secondary" className="w-100">
                  Back to Bookings
                </Button>
              </Link>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 28px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 9px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e9ecef;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: -28px;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 3px solid #fff;
          z-index: 1;
        }

        .timeline-content {
          padding-left: 8px;
        }
      `}</style>
    </>
  );
};

export default AmenityBookingDetailsPage;
