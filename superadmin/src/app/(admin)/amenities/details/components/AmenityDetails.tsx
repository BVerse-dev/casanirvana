"use client";

import { useMemo } from "react";

import { useGetAmenity, useListAmenityBookings } from "@/hooks/useAmenities";
import Link from "next/link";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";

type AmenityDetailsProps = {
  amenityId: string;
};

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

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

const formatBookingWindow = (date?: string | null, start?: string | null, end?: string | null) => {
  if (!date) {
    return "Schedule not set";
  }

  return `${new Date(date).toLocaleDateString()} · ${start || "?"} - ${end || "?"}`;
};

const AmenityDetails = ({ amenityId }: AmenityDetailsProps) => {
  const { data: amenity, isLoading } = useGetAmenity(amenityId);
  const { data: bookings = [] } = useListAmenityBookings();

  const amenityBookings = useMemo(
    () => bookings.filter((booking) => booking.amenity_id === amenityId),
    [amenityId, bookings],
  );

  const bookingSummary = useMemo(() => {
    const total = amenityBookings.length;
    const pending = amenityBookings.filter((booking) => booking.status === "pending").length;
    const confirmed = amenityBookings.filter((booking) => booking.status === "confirmed").length;
    const completed = amenityBookings.filter((booking) => booking.status === "completed").length;
    const cancelled = amenityBookings.filter((booking) => booking.status === "cancelled").length;
    const paidRevenue = amenityBookings
      .filter((booking) => booking.payment_status === "paid")
      .reduce((sum, booking) => sum + Number(booking.total_amount || booking.amount || 0), 0);
    const uniqueResidents = new Set(
      amenityBookings.map((booking) => booking.user_id).filter(Boolean),
    ).size;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      paidRevenue,
      uniqueResidents,
    };
  }, [amenityBookings]);

  const recentBookings = useMemo(() => amenityBookings.slice(0, 5), [amenityBookings]);

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">Loading amenity details...</CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  if (!amenity) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5 text-danger">Amenity not found.</CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  const ruleLines = (amenity.rules || amenity.rules_and_regulations || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Row className="g-4">
      <Col xl={8}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle as="h4" className="mb-0">
              Amenity Overview
            </CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-muted mb-4">{amenity.description || "No description provided."}</p>

            <Row className="g-3">
              <Col md={6}>
                <div className="border rounded p-3 h-100">
                  <h6 className="text-muted text-uppercase mb-2">Operations</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Status</span>
                    <span className="fw-semibold">{amenity.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Location</span>
                    <span className="fw-semibold">{amenity.location || "N/A"}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Operating Hours</span>
                    <span className="fw-semibold">
                      {amenity.availability_start || "N/A"} - {amenity.availability_end || "N/A"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Maintenance</span>
                    <span className="fw-semibold">{formatLabel(amenity.maintenance_frequency)}</span>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="border rounded p-3 h-100">
                  <h6 className="text-muted text-uppercase mb-2">Booking Policy</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Pricing</span>
                    <span className="fw-semibold">
                      {amenity.is_paid ? formatMoney(amenity.price_per_hour) : "Free"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Advance Notice</span>
                    <span className="fw-semibold">{amenity.advance_booking_days || 0} day(s)</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Max Duration</span>
                    <span className="fw-semibold">{amenity.max_booking_duration || 0} hour(s)</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Capacity</span>
                    <span className="fw-semibold">{amenity.capacity || "Unlimited"}</span>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="g-3 mt-1">
              <Col md={6}>
                <div className="border rounded p-3 h-100">
                  <h6 className="text-muted text-uppercase mb-2">Contact</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Contact Person</span>
                    <span className="fw-semibold">{amenity.contact_person || "N/A"}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Phone</span>
                    <span className="fw-semibold">{amenity.contact_number || "N/A"}</span>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="border rounded p-3 h-100">
                  <h6 className="text-muted text-uppercase mb-2">Lifecycle</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Created</span>
                    <span className="fw-semibold">{formatDateTime(amenity.created_at)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Updated</span>
                    <span className="fw-semibold">{formatDateTime(amenity.updated_at)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Community</span>
                    <span className="fw-semibold">{amenity.communityName || "N/A"}</span>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="mt-4">
              <h6 className="text-muted text-uppercase mb-2">Rules & Guidelines</h6>
              {ruleLines.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {ruleLines.map((rule) => (
                    <div className="d-flex align-items-start gap-2" key={rule}>
                      <Badge bg="warning" className="mt-1">
                        <span className="visually-hidden">Rule</span>
                      </Badge>
                      <span className="text-muted">{rule}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No explicit rules have been configured for this amenity.</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4" className="mb-0">
              Recent Booking Activity
            </CardTitle>
            <Link href={`/amenities/bookings?amenityId=${amenity.id}`}>
              <Button variant="outline-primary" size="sm">
                View All Bookings
              </Button>
            </Link>
          </CardHeader>
          <CardBody>
            {recentBookings.length === 0 ? (
              <p className="text-muted mb-0">No bookings have been recorded for this amenity yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="d-flex justify-content-between align-items-start border rounded p-3"
                  >
                    <div>
                      <h6 className="mb-1">
                        {(booking.user_profile?.first_name || "Resident")}{" "}
                        {booking.user_profile?.last_name || ""}
                      </h6>
                      <p className="text-muted mb-1">
                        {formatBookingWindow(booking.booking_date, booking.start_time, booking.end_time)}
                      </p>
                      <small className="text-muted">
                        Payment: {formatLabel(booking.payment_status)} · {formatMoney(booking.total_amount)}
                      </small>
                    </div>
                    <div className="text-end">
                      <Badge
                        bg={
                          booking.status === "confirmed"
                            ? "success"
                            : booking.status === "pending"
                              ? "warning"
                              : booking.status === "completed"
                                ? "info"
                                : "danger"
                        }
                      >
                        {formatLabel(booking.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </Col>

      <Col xl={4}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle as="h5" className="mb-0">
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Total Bookings</span>
                <span className="fw-semibold">{bookingSummary.total}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Pending</span>
                <span className="fw-semibold">{bookingSummary.pending}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Confirmed</span>
                <span className="fw-semibold">{bookingSummary.confirmed}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Completed</span>
                <span className="fw-semibold">{bookingSummary.completed}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Cancelled</span>
                <span className="fw-semibold">{bookingSummary.cancelled}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Unique Residents</span>
                <span className="fw-semibold">{bookingSummary.uniqueResidents}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-3">
                <span className="text-muted">Paid Revenue</span>
                <span className="fw-semibold">{formatMoney(bookingSummary.paidRevenue)}</span>
              </div>
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
            <Link href={`/amenities/bookings?amenityId=${amenity.id}`}>
              <Button variant="primary" className="w-100">
                View Amenity Bookings
              </Button>
            </Link>
            <Link href="/amenities/list">
              <Button variant="outline-secondary" className="w-100">
                Back to Amenities
              </Button>
            </Link>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AmenityDetails;
