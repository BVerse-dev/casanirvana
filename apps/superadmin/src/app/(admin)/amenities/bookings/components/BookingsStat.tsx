"use client";

import { useMemo } from "react";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListAmenityBookings } from "@/hooks/useAmenities";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, CardTitle, Col, Row } from "react-bootstrap";

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

type BookingStatCardProps = {
  title: string;
  amount: string;
  helper: string;
  icon: string;
};

const BookingStatCard = ({ title, amount, helper, icon }: BookingStatCardProps) => (
  <Card>
    <CardBody>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <CardTitle as="h4" className="mb-2">
            {title}
          </CardTitle>
          <p className="text-dark fw-semibold fs-22 mb-1">{amount}</p>
          <p className="text-muted mb-0 fs-13">{helper}</p>
        </div>
        <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered">
          <IconifyIcon icon={icon} width={28} height={28} className="fs-28 text-primary" />
        </div>
      </div>
    </CardBody>
  </Card>
);

const BookingsStat = () => {
  const { data: bookings = [] } = useListAmenityBookings();
  const searchParams = useSearchParams();
  const amenityId = searchParams.get("amenityId");

  const scopedBookings = useMemo(
    () => (amenityId ? bookings.filter((booking) => booking.amenity_id === amenityId) : bookings),
    [amenityId, bookings],
  );

  const confirmed = scopedBookings.filter((booking) => booking.status === "confirmed").length;
  const pending = scopedBookings.filter((booking) => booking.status === "pending").length;
  const completedRevenue = scopedBookings
    .filter((booking) => booking.payment_status === "paid")
    .reduce((sum, booking) => sum + Number(booking.total_amount || booking.amount || 0), 0);
  const uniqueResidents = new Set(
    scopedBookings.map((booking) => booking.user_id).filter(Boolean),
  ).size;

  const statCards: BookingStatCardProps[] = [
    {
      title: "Total Bookings",
      amount: String(scopedBookings.length),
      helper: amenityId ? "Scoped to selected amenity" : "Across all amenities",
      icon: "ri:calendar-line",
    },
    {
      title: "Confirmed",
      amount: String(confirmed),
      helper: `${pending} still awaiting action`,
      icon: "ri:calendar-check-line",
    },
    {
      title: "Paid Revenue",
      amount: formatMoney(completedRevenue),
      helper: "Captured from paid bookings",
      icon: "ri:wallet-3-line",
    },
    {
      title: "Residents",
      amount: String(uniqueResidents),
      helper: "Unique booking residents",
      icon: "ri:user-line",
    },
  ];

  return (
    <Row className="mb-4">
      {statCards.map((item) => (
        <Col md={6} xl={3} key={item.title}>
          <BookingStatCard {...item} />
        </Col>
      ))}
    </Row>
  );
};

export default BookingsStat;
