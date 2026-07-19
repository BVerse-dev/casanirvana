"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGetAmenity } from "@/hooks/useAmenities";
import { Badge, Card, CardBody, Col, Row } from "react-bootstrap";

type AmenityDetailsBannerProps = {
  amenityId: string;
};

const formatLabel = (value?: string | null) => {
  if (!value) {
    return "General";
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

const getAmenityIcon = (type?: string | null) => {
  switch ((type || "").toLowerCase()) {
    case "recreation":
      return "ri:game-line";
    case "fitness":
      return "ri:run-line";
    case "sports":
      return "ri:football-line";
    case "event space":
      return "ri:calendar-event-line";
    case "educational":
      return "ri:book-open-line";
    case "utility":
      return "ri:tools-line";
    default:
      return "ri:building-line";
  }
};

const AmenityDetailsBanner = ({ amenityId }: AmenityDetailsBannerProps) => {
  const { data: amenity, isLoading } = useGetAmenity(amenityId);

  if (isLoading) {
    return (
      <Row className="mb-4">
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-4">Loading amenity details...</CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  if (!amenity) {
    return null;
  }

  const operatingHours = `${amenity.availability_start || "N/A"} - ${amenity.availability_end || "N/A"}`;

  return (
    <Row className="mb-4">
      <Col xl={12}>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                <div className="avatar-lg bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon
                    icon={getAmenityIcon(amenity.amenity_type || amenity.category)}
                    className="fs-24 text-primary"
                  />
                </div>
                <div>
                  <h3 className="mb-2">{amenity.name}</h3>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <Badge bg={amenity.is_active ? "success" : "danger"}>
                      {amenity.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge bg="info">{formatLabel(amenity.amenity_type || amenity.category)}</Badge>
                    <Badge bg={amenity.is_paid ? "warning" : "success"}>
                      {amenity.is_paid ? formatMoney(amenity.price_per_hour) : "Free"}
                    </Badge>
                  </div>
                  <p className="text-muted mb-0">
                    {amenity.communityName || "Community not set"} · {amenity.location || "Location not set"}
                  </p>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-3 text-sm-end">
                <div>
                  <small className="text-muted d-block">Operating Hours</small>
                  <span className="fw-semibold">{operatingHours}</span>
                </div>
                <div>
                  <small className="text-muted d-block">Capacity</small>
                  <span className="fw-semibold">{amenity.capacity || "Unlimited"}</span>
                </div>
                <div>
                  <small className="text-muted d-block">Advance Notice</small>
                  <span className="fw-semibold">{amenity.advance_booking_days || 0} day(s)</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AmenityDetailsBanner;
