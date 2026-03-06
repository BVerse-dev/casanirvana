"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListAmenityBookings, useListAmenities } from "@/hooks/useAmenities";
import { Card, CardBody, CardTitle, Col, Row } from "react-bootstrap";

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

type AmenityStatCardProps = {
  title: string;
  amount: string;
  helper: string;
  icon: string;
};

const AmenityStatCard = ({ title, amount, helper, icon }: AmenityStatCardProps) => (
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

const AmenitiesStat = () => {
  const { data: amenities = [] } = useListAmenities();
  const { data: bookings = [] } = useListAmenityBookings();

  const totalAmenities = amenities.length;
  const activeAmenities = amenities.filter((amenity) => amenity.is_active).length;
  const paidAmenities = amenities.filter((amenity) => amenity.is_paid).length;
  const completedRevenue = bookings
    .filter((booking) => booking.payment_status === "paid")
    .reduce((sum, booking) => sum + Number(booking.total_amount || booking.amount || 0), 0);
  const uniqueCommunities = new Set(
    amenities.map((amenity) => amenity.community_id).filter(Boolean),
  ).size;
  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed",
  ).length;

  const statCards: AmenityStatCardProps[] = [
    {
      title: "Total Amenities",
      amount: String(totalAmenities),
      helper: `${activeAmenities} currently active`,
      icon: "ri:building-2-line",
    },
    {
      title: "Paid Amenities",
      amount: String(paidAmenities),
      helper: `${totalAmenities - paidAmenities} free amenities`,
      icon: "ri:money-dollar-circle-line",
    },
    {
      title: "Completed Revenue",
      amount: formatMoney(completedRevenue),
      helper: "Captured from paid bookings",
      icon: "ri:wallet-3-line",
    },
    {
      title: "Upcoming Bookings",
      amount: String(upcomingBookings),
      helper: `${uniqueCommunities} communities represented`,
      icon: "ri:calendar-check-line",
    },
  ];

  return (
    <Row className="mb-4">
      {statCards.map((item) => (
        <Col md={6} xl={3} key={item.title}>
          <AmenityStatCard {...item} />
        </Col>
      ))}
    </Row>
  );
};

export default AmenitiesStat;
