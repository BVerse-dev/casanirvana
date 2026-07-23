"use client";

import avatar1 from "@/assets/images/users/avatar-1.jpg";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGetUnit } from "@/hooks/useUnits";
import { mapUnitToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import Link from "next/link";
import { Alert, Badge, Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, Row, Spinner } from "react-bootstrap";

type UnitDetailsProps = { unitId: string };

const formatMoney = (value: number | null) =>
  value === null ? "Not recorded" : "GH₵" + value.toLocaleString();

const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en-GH", { dateStyle: "medium" }).format(new Date(value)) : "Not recorded";

const UnitDetails = ({ unitId }: UnitDetailsProps) => {
  const { data: unit, isLoading, error } = useGetUnit(unitId);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Unit Overview" subName="Casa Nirvana" />
        <div className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0">Loading unit details...</p>
        </div>
      </>
    );
  }

  if (error || !unit) {
    return (
      <>
        <PageTitle title="Unit Overview" subName="Casa Nirvana" />
        <Alert variant="danger">
          <h5>Error Loading Unit</h5>
          <p className="mb-0">{error?.message || "Unit not found"}</p>
        </Alert>
      </>
    );
  }

  const unitNumber = unit.unit_number || unit.number || "Unnumbered";
  const ownerName =
    unit.profiles?.full_name ||
    [unit.profiles?.first_name, unit.profiles?.last_name].filter(Boolean).join(" ").trim() ||
    "Owner not assigned";
  const ownerEmail = unit.profiles?.email || null;
  const ownerPhone = unit.profiles?.phone || null;
  const locationLabel =
    unit.communities?.address ||
    [unit.communities?.name, unit.communities?.city, unit.communities?.state].filter(Boolean).join(", ") ||
    "Location not recorded";
  const mapQuery = encodeURIComponent(locationLabel === "Location not recorded" ? "Ghana" : locationLabel);
  const amenities = Array.isArray(unit.amenities)
    ? unit.amenities.map((value) => String(value)).filter(Boolean)
    : [];
  const statusLabel =
    unit.status === "vacant" ? "Available" : unit.status === "occupied" ? "Occupied" : unit.status || "Not recorded";
  const statusVariant = unit.status === "vacant" ? "success" : unit.status === "occupied" ? "warning" : "primary";
  const bedrooms = unit.bedrooms === null ? "Not recorded" : String(unit.bedrooms);
  const bathrooms = unit.bathrooms ?? unit.bathroom_count;
  const area = unit.area ?? unit.area_sqft ?? unit.floor_area;

  return (
    <>
      <PageTitle title="Unit Overview" subName="Casa Nirvana" />

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <Link
          href="/units"
          className="btn text-white fw-semibold"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
          }}
        >
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Back to Units
        </Link>
        <Link href={"/units/" + unitId + "/edit"} className="btn btn-primary">
          <IconifyIcon icon="solar:pen-2-bold-duotone" className="me-1" />
          Edit Unit
        </Link>
      </div>

      <Row>
        <Col xl={3} lg={4}>
          <Card>
            <CardHeader className="bg-light-subtle">
              <CardTitle as="h4">Property Owner Details</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <Image
                  src={avatar1}
                  alt=""
                  className="avatar-xl rounded-circle border border-2 border-light mx-auto"
                />
                <div className="mt-2">
                  <p className="fw-medium text-dark fs-16 mb-0">{ownerName}</p>
                  <p className="mb-0">{ownerEmail || ownerPhone ? "Owner" : "No contact assigned"}</p>
                </div>
                <div className="mt-3 text-muted small">
                  <div>{ownerEmail || "No email recorded"}</div>
                  <div>{ownerPhone || "No phone recorded"}</div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="bg-light-subtle">
              <Row className="g-2">
                <Col xs={6}>
                  {ownerPhone ? (
                    <a href={"tel:" + ownerPhone} className="btn btn-primary w-100">
                      <IconifyIcon icon="solar:phone-calling-bold-duotone" className="align-middle fs-18" /> Call
                    </a>
                  ) : (
                    <Button variant="primary" className="w-100" disabled>
                      <IconifyIcon icon="solar:phone-calling-bold-duotone" className="align-middle fs-18" /> Call
                    </Button>
                  )}
                </Col>
                <Col xs={6}>
                  {ownerEmail ? (
                    <a href={"mailto:" + ownerEmail} className="btn btn-success w-100">
                      <IconifyIcon icon="solar:chat-round-dots-bold-duotone" className="align-middle fs-16" /> Message
                    </a>
                  ) : (
                    <Button variant="success" className="w-100" disabled>
                      <IconifyIcon icon="solar:chat-round-dots-bold-duotone" className="align-middle fs-16" /> Message
                    </Button>
                  )}
                </Col>
              </Row>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-light-subtle">
              <CardTitle as="h4">Schedule A Tour</CardTitle>
            </CardHeader>
            <CardBody>
              <Alert variant="info" className="small">
                Tour scheduling is not enabled yet. Contact the assigned owner using the details above.
              </Alert>
              <Form.Control className="mb-3" placeholder="Date" disabled />
              <Form.Control className="mb-3" placeholder="Time" disabled />
              <Form.Control className="mb-3" placeholder="Your full name" disabled />
              <Form.Control className="mb-3" placeholder="Email" disabled />
              <Form.Control as="textarea" rows={4} placeholder="Message" disabled />
            </CardBody>
            <CardFooter className="bg-light-subtle">
              <Button variant="primary" className="w-100" disabled>
                Scheduling Unavailable
              </Button>
            </CardFooter>
          </Card>
        </Col>

        <Col xl={9} lg={8}>
          <Card>
            <CardBody>
              <div className="position-relative">
                <Image
                  src={mapUnitToPropertyImage(unit)}
                  alt={"Unit " + unitNumber}
                  className="img-fluid rounded"
                  width={1920}
                  height={1080}
                  priority
                  style={{ width: "100%", height: 400, objectFit: "cover", objectPosition: "center" }}
                />
                <Badge bg={statusVariant} className="position-absolute top-0 start-0 m-2 px-2 py-1 fs-13">
                  {statusLabel}
                </Badge>
              </div>

              <div className="d-flex flex-wrap justify-content-between my-3 gap-3">
                <div>
                  <div className="fs-18 text-dark fw-medium">
                    Unit {unitNumber} - {unit.type?.replace(/_/g, " ").toUpperCase() || "TYPE NOT RECORDED"}
                  </div>
                  <p className="d-flex align-items-center gap-1 mt-1 mb-0">
                    <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />
                    {locationLabel}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button variant="light" className="avatar-sm d-flex align-items-center justify-content-center fs-20" disabled>
                    <IconifyIcon icon="solar:share-bold-duotone" />
                  </Button>
                  <Button variant="light" className="avatar-sm d-flex align-items-center justify-content-center fs-20" disabled>
                    <IconifyIcon icon="solar:star-bold-duotone" />
                  </Button>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="avatar-sm bg-success-subtle rounded flex-centered">
                  <IconifyIcon icon="solar:wallet-money-bold-duotone" className="fs-24 text-success" />
                </div>
                <p className="fw-medium text-dark fs-18 mb-0">{formatMoney(unit.rent_amount)}</p>
                {unit.rent_amount !== null && <span className="text-muted">/month</span>}
              </div>

              <div className="bg-light-subtle p-2 mt-3 rounded border border-dashed">
                <Row className="align-items-center text-center g-2">
                  {[
                    ["solar:bed-broken", bedrooms + " bedroom"],
                    ["solar:bath-broken", String(bathrooms ?? "Not recorded") + " bathroom"],
                    ["solar:scale-broken", area === null ? "Area not recorded" : String(area) + " sqft"],
                    ["solar:double-alt-arrow-up-broken", unit.floor === null ? "Floor not recorded" : "Floor " + unit.floor],
                    ["solar:buildings-2-bold-duotone", unit.communities?.name || "Community not recorded"],
                    ["solar:check-circle-broken", statusLabel],
                  ].map(([icon, label], index) => (
                    <Col xl={2} md={4} xs={6} className={index < 5 ? "border-end" : ""} key={label}>
                      <p className="text-muted mb-0 fs-15 fw-medium d-flex align-items-center justify-content-center gap-1">
                        <IconifyIcon icon={icon} className="fs-18 text-primary" />
                        {label}
                      </p>
                    </Col>
                  ))}
                </Row>
              </div>

              <h5 className="text-dark fw-medium mt-3">Amenities</h5>
              <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
                {amenities.length ? (
                  amenities.map((amenity) => (
                    <Badge key={amenity} bg="light" text="secondary" className="border fw-medium fs-13 px-2 py-1">
                      {amenity.replace(/_/g, " ")}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted small">No amenities have been recorded for this unit yet.</span>
                )}
              </div>

              <h5 className="text-dark fw-medium mt-3">Unit Details</h5>
              <p className="mt-2">
                {unit.description?.trim() || "No detailed description has been recorded for this unit yet."}
              </p>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <p className="mb-0 d-flex align-items-center gap-1 text-muted">
                  <IconifyIcon icon="solar:calendar-date-broken" className="fs-18 text-primary" />
                  Created {formatDate(unit.created_at)}
                </p>
                <p className="mb-0 d-flex align-items-center gap-1 text-muted">
                  <IconifyIcon icon="solar:refresh-circle-bold-duotone" className="fs-18 text-primary" />
                  Updated {formatDate(unit.updated_at)}
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card>
        <CardHeader className="bg-light-subtle">
          <CardTitle as="h4">Unit Location</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <iframe
            title={"Location of Unit " + unitNumber}
            className="w-100 border-0 rounded-bottom"
            style={{ height: 400 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={"https://maps.google.com/maps?width=1980&height=400&hl=en&q=" + mapQuery + "&t=&z=14&ie=UTF8&iwloc=B&output=embed"}
          />
        </CardBody>
      </Card>
    </>
  );
};

export default UnitDetails;
