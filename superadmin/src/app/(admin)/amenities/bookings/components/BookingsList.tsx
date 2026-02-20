"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  Button,
  Card,
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
import { useListAmenityBookings } from "@/hooks/useAmenities";
import { useRouter } from "next/navigation";

const BookingsList = () => {
  const { data: bookings = [], isLoading } = useListAmenityBookings();
  const router = useRouter();

  const handleViewBooking = (bookingId: string) => {
    router.push(`/amenities/bookings/${bookingId}`);
  };

  const handleApproveBooking = (bookingId: string) => {
    // TODO: Implement approve booking functionality
    console.log("Approve booking:", bookingId);
  };

  const handleRejectBooking = (bookingId: string) => {
    // TODO: Implement reject booking functionality
    console.log("Reject booking:", bookingId);
  };

  const handleEditBooking = (bookingId: string) => {
    // TODO: Implement edit booking functionality
    console.log("Edit booking:", bookingId);
  };

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <div className="text-center p-4">Loading bookings...</div>
          </Card>
        </Col>
      </Row>
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

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
            <div>
              <CardTitle as={"h4"} className="mb-0">
                All Amenity Bookings
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
                  <th>Amenity</th>
                  <th>Resident</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, idx) => (
                  <tr 
                    key={idx} 
                    className="cursor-pointer"
                    onClick={() => handleViewBooking(booking.id)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck2"
                        />
                        <label className="form-check-label" htmlFor="customCheck2">
                          &nbsp;
                        </label>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered">
                          <IconifyIcon
                            icon="ri:calendar-line"
                            className="fs-18 text-primary"
                          />
                        </div>
                        <div>
                          <div className="text-dark fw-medium fs-15">
                            {(booking.amenities as any)?.name || "Unknown Amenity"}
                          </div>
                          <small className="text-muted">
                            {(booking.amenities as any)?.description || "No description"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">
                          {(booking.user_profile as any)?.first_name}{" "}
                          {(booking.user_profile as any)?.last_name}
                        </div>
                        <small className="text-muted">
                          {(booking.user_profile as any)?.email}
                        </small>
                      </div>
                    </td>
                    <td>{formatDate(booking.booking_date)}</td>
                    <td>
                      <div>
                        <div>{formatTime(booking.start_time)}</div>
                        <small className="text-muted">
                          to {formatTime(booking.end_time)}
                        </small>
                      </div>
                    </td>
                    <td>
                      {(() => {
                        const start = new Date(`2024-01-01 ${booking.start_time}`);
                        const end = new Date(`2024-01-01 ${booking.end_time}`);
                        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        return `${hours}h`;
                      })()}
                    </td>
                    <td>${booking.total_amount}</td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          booking.status
                        )} py-1 px-2 fs-13`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          booking.payment_status
                        )} py-1 px-2 fs-13`}
                      >
                        {booking.payment_status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="btn-icon d-flex align-items-center justify-content-center" 
                          title="View Details" 
                          style={{ width: "32px", height: "32px" }} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBooking(booking.id);
                          }}
                        >
                          <IconifyIcon
                            icon="solar:eye-broken"
                            className="fs-14"
                          />
                        </Button>
                        <Button 
                          variant={booking.status === "pending" ? "soft-success" : "outline-success"} 
                          size="sm" 
                          className="btn-icon d-flex align-items-center justify-content-center" 
                          title={booking.status === "pending" ? "Approve Booking" : "Approved"}
                          disabled={booking.status !== "pending"}
                          style={{ width: "32px", height: "32px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveBooking(booking.id);
                          }}
                        >
                          <IconifyIcon
                            icon="ri:check-line"
                            className="fs-14"
                          />
                        </Button>
                        <Button 
                          variant={booking.status === "pending" ? "soft-danger" : "outline-danger"} 
                          size="sm" 
                          className="btn-icon d-flex align-items-center justify-content-center" 
                          title={booking.status === "pending" ? "Reject Booking" : booking.status === "cancelled" ? "Cancelled" : "Cancel Booking"}
                          disabled={booking.status === "cancelled"}
                          style={{ width: "32px", height: "32px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectBooking(booking.id);
                          }}
                        >
                          <IconifyIcon
                            icon="ri:close-line"
                            className="fs-14"
                          />
                        </Button>
                        <Button 
                          variant="soft-primary" 
                          size="sm" 
                          className="btn-icon d-flex align-items-center justify-content-center" 
                          title="Edit Booking" 
                          style={{ width: "32px", height: "32px" }} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBooking(booking.id);
                          }}
                        >
                          <IconifyIcon
                            icon="solar:pen-2-broken"
                            className="fs-14"
                          />
                        </Button>
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
                Showing <span className="fw-semibold">{bookings.length}</span> of{" "}
                <span className="fw-semibold">{bookings.length}</span> results
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
  );
};

export default BookingsList;
