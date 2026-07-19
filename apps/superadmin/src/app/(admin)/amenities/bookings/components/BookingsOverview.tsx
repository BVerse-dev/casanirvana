"use client";

import { useMemo } from "react";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListAmenityBookings } from "@/hooks/useAmenities";
import { useSearchParams } from "next/navigation";
import { Badge, Card, CardBody, CardTitle, Col, ProgressBar, Row } from "react-bootstrap";

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const BookingsOverview = () => {
  const { data: bookings = [] } = useListAmenityBookings();
  const searchParams = useSearchParams();
  const amenityId = searchParams.get("amenityId");

  const scopedBookings = useMemo(
    () => (amenityId ? bookings.filter((booking) => booking.amenity_id === amenityId) : bookings),
    [amenityId, bookings],
  );

  const totalBookings = scopedBookings.length;
  const confirmedBookings = scopedBookings.filter((booking) => booking.status === "confirmed").length;
  const pendingBookings = scopedBookings.filter((booking) => booking.status === "pending").length;
  const cancelledBookings = scopedBookings.filter((booking) => booking.status === "cancelled").length;
  const completedBookings = scopedBookings.filter((booking) => booking.status === "completed").length;

  const totalRevenue = scopedBookings
    .filter((booking) => booking.payment_status === "paid")
    .reduce((sum, booking) => sum + Number(booking.total_amount || booking.amount || 0), 0);

  const pendingRevenue = scopedBookings
    .filter((booking) => booking.payment_status === "pending")
    .reduce((sum, booking) => sum + Number(booking.total_amount || booking.amount || 0), 0);

  const popularAmenities = Object.entries(
    scopedBookings.reduce<Record<string, number>>((accumulator, booking) => {
      const amenityName = booking.amenities?.name || "Unknown Amenity";
      accumulator[amenityName] = (accumulator[amenityName] || 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);

  const statusBreakdown = [
    {
      label: "Confirmed",
      count: confirmedBookings,
      percentage: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0,
      variant: "success",
    },
    {
      label: "Pending",
      count: pendingBookings,
      percentage: totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0,
      variant: "warning",
    },
    {
      label: "Completed",
      count: completedBookings,
      percentage: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      variant: "info",
    },
    {
      label: "Cancelled",
      count: cancelledBookings,
      percentage: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
      variant: "danger",
    },
  ] as const;

  return (
    <Row className="mb-4">
      <Col xl={12}>
        <Card className="border-0 shadow-sm">
          <CardBody className="p-4">
            <Row className="align-items-center g-4">
              <Col lg={7}>
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar-lg bg-primary bg-opacity-10 rounded-circle flex-centered me-3">
                    <IconifyIcon icon="solar:chart-square-bold-duotone" className="fs-24 text-primary" />
                  </div>
                  <div>
                    <CardTitle as="h3" className="mb-1">
                      Bookings Overview
                    </CardTitle>
                    <p className="text-muted mb-0">
                      {amenityId
                        ? "Live operational metrics for the selected amenity."
                        : "Live operational metrics across all amenity bookings."}
                    </p>
                  </div>
                </div>

                <Row className="g-3">
                  {statusBreakdown.map((item) => (
                    <Col md={6} key={item.label}>
                      <div className="border rounded p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">{item.label}</span>
                          <span className="fw-semibold">{item.count}</span>
                        </div>
                        <ProgressBar now={item.percentage} variant={item.variant} className="mb-2" />
                        <small className="text-muted">{item.percentage.toFixed(0)}% of current bookings</small>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>

              <Col lg={5}>
                <div className="border rounded p-4 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h2 className="fw-bold mb-1">{totalBookings}</h2>
                      <p className="text-muted mb-0">Total live booking rows</p>
                    </div>
                    <Badge bg="primary">{amenityId ? "Amenity Scope" : "Portfolio Scope"}</Badge>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Paid Revenue</span>
                    <span className="fw-semibold">{formatMoney(totalRevenue)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Pending Revenue</span>
                    <span className="fw-semibold">{formatMoney(pendingRevenue)}</span>
                  </div>

                  {popularAmenities.length > 0 ? (
                    <div className="bg-light-subtle rounded p-3">
                      <h6 className="mb-2">
                        <IconifyIcon icon="solar:fire-bold" className="me-1" />
                        Most Booked Amenities
                      </h6>
                      {popularAmenities.map(([amenityName, count]) => (
                        <div
                          key={amenityName}
                          className="d-flex align-items-center justify-content-between mb-1"
                        >
                          <span className="text-muted small">{amenityName}</span>
                          <span className="fw-semibold small">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No amenity bookings have been recorded yet.</p>
                  )}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingsOverview;
