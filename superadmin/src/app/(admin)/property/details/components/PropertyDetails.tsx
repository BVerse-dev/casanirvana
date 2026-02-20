"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import { useSearchParams } from "next/navigation";
import { useGetUnit } from "@/hooks/useUnits";
import { mapUnitToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Spinner,
  Alert
} from "react-bootstrap";

const PropertyDetails = () => {
  // Get unitId from URL query parameter
  const searchParams = useSearchParams();
  const unitId = searchParams.get('id');
  
  // Fetch unit data if ID is provided
  const { data: unit, isLoading, error } = useGetUnit(unitId || '');
  
  if (!unitId) {
    return (
      <Col xl={9} lg={8}>
        <Alert variant="warning">
          No unit ID provided. Please select a unit from the list or grid view.
        </Alert>
      </Col>
    );
  }
  
  if (isLoading) {
    return (
      <Col xl={9} lg={8}>
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading unit details...</p>
        </div>
      </Col>
    );
  }
  
  if (error || !unit) {
    return (
      <Col xl={9} lg={8}>
        <Alert variant="danger">
          <h5>Error Loading Unit</h5>
          <p>{error?.message || "Unit not found"}</p>
        </Alert>
      </Col>
    );
  }

  return (
    <Col xl={9} lg={8}>
      <Card>
        <CardBody>
          <div className="position-relative">
            <Image
              src={mapUnitToPropertyImage(unit)}
              alt={`Unit ${unit.unit_number || unit.number}`}
              className="img-fluid rounded"
              width={1920}
              height={1080}
              priority
              style={{ width: "100%", height: "400px", objectFit: "cover", objectPosition: "center" }}
            />
            <span className="position-absolute top-0 start-0 p-2">
              <span className={`badge bg-${unit.status === 'vacant' ? 'success' : unit.status === 'occupied' ? 'warning' : 'primary'} text-light px-2 py-1 fs-13`}>
                {unit.status === 'vacant' ? 'Available' : unit.status === 'occupied' ? 'Occupied' : 'Maintenance'}
              </span>
            </span>
          </div>
          <div className="d-flex flex-wrap justify-content-between my-3 gap-2">
            <div>
              <Link href="" className="fs-18 text-dark fw-medium">
                Unit {unit.unit_number || unit.number} - {unit.type?.toUpperCase() || 'Standard Unit'}
              </Link>
              <p className="d-flex align-items-center gap-1 mt-1 mb-0">
                <IconifyIcon
                  icon="solar:map-point-wave-bold-duotone"
                  className="fs-18 text-primary"
                />
                {unit.societies?.address || 'No address available'}
              </p>
            </div>
            <div>
              <ul className="list-inline float-end d-flex gap-1 mb-0 align-items-center">
                <li className="list-inline-item fs-20 dropdown">
                  <Button
                    variant="light"
                    className="avatar-sm d-flex align-items-center justify-content-center text-dark fs-20"
                    data-bs-toggle="modal"
                    data-bs-target="#videocall"
                  >
                    <span>
                      {" "}
                      <IconifyIcon icon="solar:share-bold-duotone" />
                    </span>
                  </Button>
                </li>
                <li className="list-inline-item fs-20 dropdown">
                  <Button
                    variant="light"
                    className="avatar-sm d-flex align-items-center justify-content-center text-danger fs-20"
                    data-bs-toggle="modal"
                    data-bs-target="#voicecall"
                  >
                    <span>
                      {" "}
                      <IconifyIcon icon="solar:heart-angle-bold-duotone" />
                    </span>
                  </Button>
                </li>
                <li className="list-inline-item fs-20 dropdown">
                  <Button
                    variant="light"
                    data-bs-toggle="offcanvas"
                    href="#user-profile"
                    className="avatar-sm icons-center d-flex align-items-center justify-content-center text-warning fs-20"
                  >
                    <span>
                      {" "}
                      <IconifyIcon icon="solar:star-bold-duotone" />
                    </span>
                  </Button>
                </li>
                <Dropdown
                  as={"li"}
                  className="list-inline-item fs-20 d-none d-md-flex"
                >
                  <DropdownToggle
                    as={"a"}
                    className="arrow-none text-dark"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <IconifyIcon icon="ri-more-2-fill" />
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-end">
                    <DropdownItem>
                      <IconifyIcon icon="ri:user-6-line" className=" me-2" />
                      View Profile
                    </DropdownItem>
                    <DropdownItem>
                      <IconifyIcon icon="ri:music-2-line" className=" me-2" />
                      Media, Links and Docs
                    </DropdownItem>
                    <DropdownItem>
                      <IconifyIcon icon="ri:search-2-line" className=" me-2" />
                      Search
                    </DropdownItem>
                    <DropdownItem>
                      <IconifyIcon icon="ri:image-line" className=" me-2" />
                      Wallpaper
                    </DropdownItem>
                    <DropdownItem>
                      <IconifyIcon
                        icon="ri:arrow-right-circle-line"
                        className=" me-2"
                      />
                      More
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </ul>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-sm bg-success-subtle rounded flex-centered">
              <IconifyIcon
                icon="solar:wallet-money-bold-duotone"
                width={24}
                height={24}
                className="fs-24 text-success"
              />
            </div>
            <p className="fw-medium text-dark fs-18 mb-0">
              {currency}{unit.rent_amount || 'N/A'}{unit.rent_amount ? '' : ''}
            </p>
            <span className="text-muted">{unit.rent_amount ? '/month' : ''}</span>
          </div>
          <div className="bg-light-subtle p-2 mt-3 rounded border border-dashed">
            <Row className="align-items-center text-center g-2">
              <Col xl={2} lg={3} md={6} xs={6} className="border-end">
                <p className="text-muted mb-0 fs-15 fw-medium d-flex align-items-center justify-content-center gap-1">
                  <IconifyIcon
                    icon="solar:bed-broken"
                    className="fs-18 text-primary"
                  />{" "}
                  {unit.bedrooms || '2'} Bedroom
                </p>
              </Col>
              <Col xl={2} lg={3} md={6} xs={6} className="border-end">
                <p className="text-muted mb-0 fs-15 fw-medium d-flex align-items-center justify-content-center gap-1">
                  <IconifyIcon
                    icon="solar:bath-broken"
                    className="fs-18 text-primary"
                  />{" "}
                  {unit.bathrooms || unit.bathroom_count || '2'} Bathrooms
                </p>
              </Col>
              <Col xl={2} lg={3} md={6} xs={6} className="border-end">
                <p className="text-muted mb-0 fs-15 fw-medium d-flex align-items-center justify-content-center gap-1">
                  <IconifyIcon
                    icon="solar:scale-broken"
                    className="fs-18 text-primary"
                  />{" "}
                  {unit.area || unit.floor_area || '0'}sqft
                </p>
              </Col>
              <Col xl={2} lg={3} md={6} xs={6} className="border-end">
                <p className="text-muted mb-0 fs-15 fw-medium d-flex align-items-center justify-content-center gap-1">
                  <IconifyIcon
                    icon="solar:double-alt-arrow-up-broken"
                    className="fs-18 text-primary"
                  />{" "}
                  {unit.floor || '1'} Floor
                </p>
              </Col>
              <Col xl={2} lg={3} md={6} xs={6} className="border-end">
                <p className="text-muted mb-0 fs-15 fw-medium d-flex align-items-center justify-content-center gap-1">
                  <span className="badge p-1 bg-light fs-12 text-dark">
                    <IconifyIcon
                      icon="ri:star-fill"
                      className="align-text-top fs-14 text-warning me-1"
                    />{" "}
                    {(unit as any).rating || '4.0'}
                  </span>{" "}
                  Review
                </p>
              </Col>
              <Col xl={2} lg={3} md={6} xs={6}>
                <p className="text-muted mb-0 fs-15 fw-medium d-flex align-items-center justify-content-center gap-1">
                  <IconifyIcon
                    icon="solar:check-circle-broken"
                    className="fs-18 text-primary"
                  />{" "}
                  {unit.status === 'vacant' ? 'Available' : unit.status === 'occupied' ? 'Occupied' : 'Maintenance'}
                </p>
              </Col>
            </Row>
          </div>
          <h5 className="text-dark fw-medium mt-3">Some Facility :</h5>
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <span className="badge bg-light-subtle text-muted border fw-medium fs-13 px-2 py-1">
              Big Swimming pool{" "}
            </span>
            <span className="badge bg-light-subtle text-muted border fw-medium fs-13 px-2 py-1">
              Near Airport{" "}
            </span>
            <span className="badge bg-light-subtle text-muted border fw-medium fs-13 px-2 py-1">
              Big Size Garden{" "}
            </span>
            <span className="badge bg-light-subtle text-muted border fw-medium fs-13 px-2 py-1">
              4 Car Parking{" "}
            </span>
            <span className="badge bg-light-subtle text-muted border fw-medium fs-13 px-2 py-1">
              24/7 Electricity{" "}
            </span>
            <span className="badge bg-light-subtle text-muted border fw-medium fs-13 px-2 py-1">
              Personal Theater{" "}
            </span>
          </div>
          <h5 className="text-dark fw-medium mt-3">Property Details :</h5>
          <p className="mt-2">
            Property refers to any item that an individual or a business holds
            legal title to. This can include tangible items, such as houses,
            cars, or appliances, as well as intangible items that hold potential
            future value, such as stock and bond certificates. Legally, property
            is classified into two categories: personal property and real
            property. This distinction originates from English common law, and
            our contemporary legal system continues to differentiate between
            these two types.
          </p>
          <div className="d-flex align-items-center justify-content-between">
            <Link href="" className="link-primary fw-medium">
              View More Detail <IconifyIcon icon="ri:arrow-right-line" />
            </Link>
            <div>
              <p className="mb-0 d-flex align-items-center gap-1">
                <IconifyIcon
                  icon="solar:calendar-date-broken"
                  className="fs-18 text-primary"
                />{" "}
                10 May 2024
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PropertyDetails;
