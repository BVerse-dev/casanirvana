"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardTitle, Col, Row } from "react-bootstrap";
import { useListAmenityBookings } from "@/hooks/useAmenities";

type BookingStatType = {
  amount: string;
  change: string;
  icon: string;
  title: string;
  variant: "success" | "danger";
};

const BookingStatCard = ({
  amount,
  change,
  icon,
  title,
  variant,
}: BookingStatType) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <CardTitle as={"h4"} className="mb-2 ">
              {title}
            </CardTitle>
            <p className="text-muted fw-medium fs-22 mb-0">{amount}</p>
          </div>
          <div>
            <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered">
              <IconifyIcon
                icon={icon}
                width={32}
                height={32}
                className="fs-32 text-primary "
              />
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between mt-3">
          <p className="mb-0">
            <span className={`text-${variant} fw-medium mb-0`}>
              {variant == "success" ? (
                <IconifyIcon icon="ri:arrow-up-line" />
              ) : (
                <IconifyIcon icon="ri:arrow-down-line" />
              )}
              {change}%
            </span>{" "}
            vs last month
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

const BookingsStat = () => {
  const { data: bookings = [] } = useListAmenityBookings();

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

  const bookingStatData: BookingStatType[] = [
    {
      amount: totalBookings.toString(),
      change: "15.2",
      icon: "ri:calendar-line",
      title: "Total Bookings",
      variant: "success",
    },
    {
      amount: confirmedBookings.toString(),
      change: "12.5",
      icon: "ri:calendar-check-line",
      title: "Confirmed",
      variant: "success",
    },
    {
      amount: pendingBookings.toString(),
      change: "8.3",
      icon: "ri:time-line",
      title: "Pending",
      variant: "danger",
    },
    {
      amount: cancelledBookings.toString(),
      change: "3.1",
      icon: "ri:calendar-close-line",
      title: "Cancelled",
      variant: "danger",
    },
  ];

  return (
    <Row>
      {bookingStatData.map((item, idx) => (
        <Col md={6} xl={3} key={idx}>
          <BookingStatCard {...item} />
        </Col>
      ))}
    </Row>
  );
};

export default BookingsStat;
