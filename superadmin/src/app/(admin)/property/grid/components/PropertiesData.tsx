"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListUnits } from "@/hooks/useUnits";
import { useListCommunities } from "@/hooks/useCommunities";
import { Database } from "@/lib/database.types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardFooter, Col, Row } from "react-bootstrap";

type Unit = Database["public"]["Tables"]["units"]["Row"] & {
  societies?: Database["public"]["Tables"]["communities"]["Row"];
};

const UnitsCard = ({ unit }: { unit: Unit }) => {
  // Default values for demo purposes - these should come from your unit data
  const image = "/images/default-unit.jpg"; // You'll need to add a default image or get from unit data
  const save = false;
  const variant = "success";
  const type = unit.status || "Available";
  const icon = "solar:home-broken";
  const name = unit.unit_number;
  const location = unit.communities?.name || "Unknown Community";
  const beds = unit.bedrooms || 0;
  const bath = unit.bathrooms || 0;
  const ft = unit.area_sqft || 0;
  const flor = unit.floor || 0;
  const price = unit.rent_amount || 0;

  return (
    <Card className="overflow-hidden">
      <div className="position-relative">
        {/* <Image src={image} alt="properties" className="img-fluid rounded-top" /> */}
        <div className="bg-light-subtle" style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconifyIcon icon="solar:home-broken" className="fs-48 text-muted" />
        </div>
        <span className="position-absolute top-0 start-0 p-1">
          {save ? (
            <button
              type="button"
              className="btn btn-warning avatar-sm d-inline-flex align-items-center justify-content-center fs-20 rounded text-light "
            >
              {" "}
              <span>
                {" "}
                <IconifyIcon icon="solar:bookmark-broken" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="btn bg-warning-subtle avatar-sm d-inline-flex align-items-center justify-content-center fs-20 rounded text-warning"
            >
              <span>
                <IconifyIcon icon="solar:bookmark-broken" />
              </span>
            </button>
          )}
        </span>
        <span className="position-absolute top-0 end-0 p-1">
          <span className={`badge bg-${variant} text-white fs-13`}>{type}</span>
        </span>
      </div>
      <CardBody>
        <div className="d-flex align-items-center gap-2">
          <div className="avatar bg-light rounded flex-centered">
            <IconifyIcon
              icon={icon}
              width={24}
              height={24}
              className="fs-24 text-primary"
            />
          </div>
          <div>
            <Link href={`/property/details/${unit.id}`} className="text-dark fw-medium fs-16">
              Unit {name}
            </Link>
            <p className="text-muted mb-0">{location}</p>
          </div>
        </div>
        <Row className="mt-2 g-2">
          <Col lg={4} xs={4}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon icon="solar:bed-broken" className="align-middle" />
              </span>
              &nbsp;
              {beds} Beds
            </span>
          </Col>
          <Col lg={4} xs={4}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:bath-broken"
                  className="align-middle"
                />
              </span>
              &nbsp;
              {bath} Bath
            </span>
          </Col>
          <Col lg={4} xs={4}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:scale-broken"
                  className="align-middle"
                />
              </span>
              &nbsp;
              {ft}ft
            </span>
          </Col>
          <Col lg={4} xs={4}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:double-alt-arrow-up-broken"
                  className="align-middle"
                />
              </span>
              &nbsp;
              {flor} Floor
            </span>
          </Col>
        </Row>
      </CardBody>
      <CardFooter className="bg-light-subtle d-flex justify-content-between align-items-center border-top">
        {type == "Sold" ? (
          <p className="fw-medium text-muted text-decoration-line-through fs-16 mb-0">
            ${price}.00{" "}
          </p>
        ) : (
          <p className="fw-medium text-dark fs-16 mb-0">${price}.00 </p>
        )}
        <div>
          <Link href={`/property/details/${unit.id}`} className="link-primary fw-medium">
            More Details{" "}
            <IconifyIcon icon="ri:arrow-right-line" className="align-middle" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

const PropertiesData = () => {
  const { data: unitsResponse, isLoading } = useListUnits();
  const units = unitsResponse?.data || [];

  if (isLoading) {
    return <div>Loading units...</div>;
  }

  return (
    <Col xl={9} lg={12}>
      <Row>
        {units.map((unit, idx) => (
          <Col lg={4} md={6} key={idx}>
            <UnitsCard unit={unit as any} />
          </Col>
        ))}
      </Row>
      <div className="p-3 border-top">
        <nav aria-label="Page navigation example">
          <ul className="pagination justify-content-end mb-0">
            <li className="page-item">
              <Link className="page-link" href="">
                Previous
              </Link>
            </li>
            <li className="page-item active">
              <Link className="page-link" href="">
                1
              </Link>
            </li>
            <li className="page-item">
              <Link className="page-link" href="">
                2
              </Link>
            </li>
            <li className="page-item">
              <Link className="page-link" href="">
                3
              </Link>
            </li>
            <li className="page-item">
              <Link className="page-link" href="">
                Next
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </Col>
  );
};

export default PropertiesData;
