"use client";

import { useMemo, useState } from "react";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import type { CreateAmenityBookingData } from "@/hooks/useAmenities";
import { useListAmenityBookings, useUpdateAmenityBooking } from "@/hooks/useAmenities";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";

const PAGE_SIZE = 15;

const formatLabel = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString();
};

const formatTime = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }

  return new Date(`2000-01-01T${value}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeClass = (status?: string | null) => {
  switch (status) {
    case "confirmed":
      return "bg-success-subtle text-success";
    case "pending":
      return "bg-warning-subtle text-warning";
    case "completed":
      return "bg-info-subtle text-info";
    case "cancelled":
      return "bg-danger-subtle text-danger";
    default:
      return "bg-secondary-subtle text-secondary";
  }
};

const BookingsList = () => {
  const { data: bookings = [], isLoading, error } = useListAmenityBookings();
  const updateAmenityBooking = useUpdateAmenityBooking();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scopedAmenityId = searchParams.get("amenityId");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const amenityScopeMatch = !scopedAmenityId || booking.amenity_id === scopedAmenityId;
      const statusMatch = statusFilter === "all" || booking.status === statusFilter;
      const residentName = `${booking.user_profile?.first_name || ""} ${booking.user_profile?.last_name || ""}`.trim();
      const haystack = [
        booking.amenities?.name,
        booking.amenities?.description,
        residentName,
        booking.user_profile?.email,
      ]
        .join(" ")
        .toLowerCase();
      const searchMatch = !normalizedSearch || haystack.includes(normalizedSearch);

      return amenityScopeMatch && statusMatch && searchMatch;
    });
  }, [bookings, scopedAmenityId, searchTerm, statusFilter]);

  const currentAmenityName =
    scopedAmenityId &&
    filteredBookings.find((booking) => booking.amenity_id === scopedAmenityId)?.amenities?.name;

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * PAGE_SIZE;
  const paginatedBookings = filteredBookings.slice(pageStart, pageStart + PAGE_SIZE);

  const handleStatusMutation = async (
    bookingId: string,
    updates: {
      status: "confirmed" | "cancelled" | "completed";
      payment_status?: CreateAmenityBookingData["payment_status"];
    },
    successMessage: string,
  ) => {
    setFeedback(null);

    try {
      await updateAmenityBooking.mutateAsync({
        id: bookingId,
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

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">Loading bookings...</CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Alert variant="danger">Failed to load amenity bookings.</Alert>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="border-bottom">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <CardTitle as="h4" className="mb-0">
                  Amenity Bookings Queue
                </CardTitle>
                <small className="text-muted">
                  {scopedAmenityId && currentAmenityName
                    ? `Scoped to ${currentAmenityName}`
                    : "Across all amenities"}
                </small>
              </div>
              {scopedAmenityId ? (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => router.push("/amenities/bookings")}
                >
                  <IconifyIcon icon="ri:close-line" className="me-1" />
                  Clear Amenity Scope
                </Button>
              ) : null}
            </div>
          </CardHeader>

          <CardBody className="border-bottom bg-light-subtle">
            <Row className="g-3">
              <Col md={6}>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:search-line" />
                  </InputGroup.Text>
                  <Form.Control
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search amenity, resident, email"
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  size="sm"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button variant="outline-secondary" size="sm" className="w-100" onClick={handleReset}>
                  <IconifyIcon icon="ri:refresh-line" className="me-1" />
                  Reset Filters
                </Button>
              </Col>
            </Row>
          </CardBody>

          {feedback ? (
            <Alert
              variant={feedback.variant}
              className="m-3 mb-0"
              dismissible
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          ) : null}

          <div className="table-responsive">
            <table className="table align-middle text-nowrap table-hover table-centered mb-0">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Amenity</th>
                  <th>Resident</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      No amenity bookings found for the current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => {
                    const residentName = `${booking.user_profile?.first_name || ""} ${
                      booking.user_profile?.last_name || ""
                    }`.trim() || "Unknown Resident";

                    return (
                      <tr key={booking.id}>
                        <td>
                          <div>
                            <Link
                              className="text-decoration-none fw-semibold"
                              href={`/amenities/bookings/${booking.id}`}
                            >
                              {booking.amenities?.name || "Unknown Amenity"}
                            </Link>
                            <div className="text-muted fs-12">
                              {booking.amenities?.amenity_type
                                ? formatLabel(booking.amenities.amenity_type)
                                : "Amenity"}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{residentName}</div>
                            <small className="text-muted">{booking.user_profile?.email || "No email"}</small>
                          </div>
                        </td>
                        <td>{formatDate(booking.booking_date)}</td>
                        <td>
                          <div>
                            <div>{formatTime(booking.start_time)}</div>
                            <small className="text-muted">to {formatTime(booking.end_time)}</small>
                          </div>
                        </td>
                        <td>{formatMoney(booking.total_amount || booking.amount)}</td>
                        <td>
                          <Badge className={getStatusBadgeClass(booking.status)}>
                            {formatLabel(booking.status)}
                          </Badge>
                        </td>
                        <td>
                          <Badge className={getStatusBadgeClass(booking.payment_status)}>
                            {formatLabel(booking.payment_status)}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <Link href={`/amenities/bookings/${booking.id}`}>
                              <Button variant="light" size="sm" title="View Details">
                                <IconifyIcon icon="solar:eye-broken" className="fs-14" />
                              </Button>
                            </Link>
                            {booking.status === "pending" ? (
                              <>
                                <Button
                                  variant="soft-success"
                                  size="sm"
                                  title="Approve Booking"
                                  disabled={updateAmenityBooking.isPending}
                                  onClick={() =>
                                    void handleStatusMutation(
                                      booking.id,
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
                                >
                                  <IconifyIcon icon="ri:check-line" className="fs-14" />
                                </Button>
                                <Button
                                  variant="soft-danger"
                                  size="sm"
                                  title="Reject Booking"
                                  disabled={updateAmenityBooking.isPending}
                                  onClick={() =>
                                    void handleStatusMutation(
                                      booking.id,
                                      {
                                        status: "cancelled",
                                        payment_status:
                                          booking.payment_status === "paid" ? "refunded" : booking.payment_status,
                                      },
                                      "Booking cancelled.",
                                    )
                                  }
                                >
                                  <IconifyIcon icon="ri:close-line" className="fs-14" />
                                </Button>
                              </>
                            ) : null}
                            {booking.status === "confirmed" ? (
                              <Button
                                variant="soft-primary"
                                size="sm"
                                title="Mark Completed"
                                disabled={updateAmenityBooking.isPending}
                                onClick={() =>
                                  void handleStatusMutation(
                                    booking.id,
                                    { status: "completed" },
                                    "Booking marked as completed.",
                                  )
                                }
                              >
                                <IconifyIcon icon="ri:checkbox-circle-line" className="fs-14" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <CardFooter className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <p className="text-muted mb-0">
              Showing{" "}
              <span className="fw-semibold">{filteredBookings.length === 0 ? 0 : pageStart + 1}</span> to{" "}
              <span className="fw-semibold">
                {Math.min(pageStart + PAGE_SIZE, filteredBookings.length)}
              </span>{" "}
              of <span className="fw-semibold">{filteredBookings.length}</span> results
            </p>
            {filteredBookings.length > PAGE_SIZE ? (
              <div className="d-flex align-items-center gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPageSafe <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <span className="small text-muted">
                  Page {currentPageSafe} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPageSafe >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </CardFooter>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingsList;
