"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import { Card, CardBody, CardTitle, Col, Row } from "react-bootstrap";
import { useListAmenities, useListAmenityBookings } from "@/hooks/useAmenities";

type AmenityStatType = {
  amount: string;
  change: string;
  icon: string;
  title: string;
  variant: "success" | "danger";
};

const AmenityStatCard = ({
  amount,
  change,
  icon,
  title,
  variant,
}: AmenityStatType) => {
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
          <div>
            <Link href="" className="link-primary fw-medium">
              See Details{" "}
              <IconifyIcon
                icon="ri:arrow-right-line"
                className="align-middle"
              />
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const AmenitiesStat = () => {
  const { data: amenities = [] } = useListAmenities();
  const { data: bookings = [] } = useListAmenityBookings();

  const totalAmenities = amenities.length;
  const activeAmenities = amenities.filter((a) => a.is_active).length;
  const paidAmenities = amenities.filter((a) => a.is_paid).length;
  const freeAmenities = amenities.filter((a) => !a.is_paid).length;
  
  // Calculate total revenue potential
  const totalRevenue = amenities
    .filter(a => a.is_paid)
    .reduce((sum, a) => sum + (a.price_per_hour || 0), 0);

  // Group amenities by type
  const amenityTypes = amenities.reduce((acc: { [key: string]: number }, amenity) => {
    const type = amenity.amenity_type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const mostPopularType = Object.keys(amenityTypes).reduce((a, b) => 
    amenityTypes[a] > amenityTypes[b] ? a : b, "Recreation"
  );

  // Calculate utilization rate (mock data for now)
  const avgUtilization = Math.round(Math.random() * 40 + 60); // 60-100%

  const amenityStatData: AmenityStatType[] = [
    {
      amount: totalAmenities.toString(),
      change: "12.5",
      icon: "ri:building-2-line",
      title: "Total Amenities",
      variant: "success",
    },
    {
      amount: activeAmenities.toString(),
      change: "8.2",
      icon: "ri:checkbox-circle-line",
      title: "Active Amenities",
      variant: "success",
    },
    {
      amount: `$${totalRevenue.toLocaleString()}`,
      change: "15.3",
      icon: "ri:money-rupee-circle-line",
      title: "Revenue Potential",
      variant: "success",
    },
    {
      amount: `${avgUtilization}%`,
      change: "5.7",
      icon: "ri:bar-chart-box-line",
      title: "Avg Utilization",
      variant: avgUtilization > 70 ? "success" : "danger",
    },
  ];

  return (
    <>
      <Row className="mb-4">
        {amenityStatData.map((item, idx) => (
          <Col md={6} xl={3} key={idx}>
            <AmenityStatCard {...item} />
          </Col>
        ))}
      </Row>
      
      {/* Beautiful Gradient Cards Row */}
      <Row className="mb-4">
        <Col xl={3} md={6}>
          <Card className="gradient-card-1 border-0 overflow-hidden position-relative">
            <CardBody className="text-center position-relative z-1">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <IconifyIcon icon="ri:gift-line" className="fs-28 text-white" />
              </div>
              <h2 className="text-white mb-1 fw-bold">{freeAmenities}</h2>
              <p className="text-white mb-2 fs-14 fw-medium">Free Amenities</p>
              <small className="text-white">No booking charges required</small>
            </CardBody>
            <div className="gradient-overlay-1"></div>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="gradient-card-2 border-0 overflow-hidden position-relative">
            <CardBody className="text-center position-relative z-1">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <IconifyIcon icon="ri:money-rupee-circle-line" className="fs-28 text-white" />
              </div>
              <h2 className="text-white mb-1 fw-bold">{paidAmenities}</h2>
              <p className="text-white mb-2 fs-14 fw-medium">Paid Amenities</p>
              <small className="text-white">Revenue generating facilities</small>
            </CardBody>
            <div className="gradient-overlay-2"></div>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="gradient-card-3 border-0 overflow-hidden position-relative">
            <CardBody className="text-center position-relative z-1">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <IconifyIcon icon="ri:stack-line" className="fs-28 text-white" />
              </div>
              <h2 className="text-white mb-1 fw-bold">{Object.keys(amenityTypes).length}</h2>
              <p className="text-white mb-2 fs-14 fw-medium">Categories</p>
              <small className="text-white">Most popular: {mostPopularType}</small>
            </CardBody>
            <div className="gradient-overlay-3"></div>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="gradient-card-4 border-0 overflow-hidden position-relative">
            <CardBody className="text-center position-relative z-1">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <IconifyIcon icon="ri:calendar-check-line" className="fs-28 text-white" />
              </div>
              <h2 className="text-white mb-1 fw-bold">{bookings.length}</h2>
              <p className="text-white mb-2 fs-14 fw-medium">Total Bookings</p>
              <small className="text-white">Bookings this month</small>
            </CardBody>
            <div className="gradient-overlay-4"></div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AmenitiesStat;
