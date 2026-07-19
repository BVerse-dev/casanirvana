"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import { useSearchParams } from "next/navigation";
import { useGetUnit } from "@/hooks/useUnits";
import { mapUnitToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import {
  Button,
  Card,
  CardBody,
  Col,
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

  const amenityList = Array.isArray(unit.amenities)
    ? unit.amenities.map((value) => String(value)).filter(Boolean)
    : [];
  const locationLabel =
    unit.communities?.address ||
    [unit.communities?.name, unit.communities?.city, unit.communities?.state].filter(Boolean).join(", ") ||
    "No address available";
  const detailsText =
    unit.description?.trim() ||
    "This unit does not have a detailed description yet. Core occupancy, pricing, and ownership data are connected above.";

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
              <div className="fs-18 text-dark fw-medium">
                Unit {unit.unit_number || unit.number} - {unit.type?.toUpperCase() || 'Standard Unit'}
              </div>
              <p className="d-flex align-items-center gap-1 mt-1 mb-0">
                <IconifyIcon
                  icon="solar:map-point-wave-bold-duotone"
                  className="fs-18 text-primary"
                />
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
              <span className="text-muted small">Actions will be enabled on the dedicated unit lifecycle screens.</span>
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
                  <IconifyIcon
                    icon="solar:buildings-2-bold-duotone"
                    className="fs-18 text-primary"
                  />{" "}
                  {unit.communities?.name || "Community"}
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
          <h5 className="text-dark fw-medium mt-3">Amenities</h5>
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            {amenityList.length > 0 ? (
              amenityList.map((amenity) => (
                <span key={amenity} className="badge bg-light-subtle text-muted border fw-medium fs-13 px-2 py-1">
                  {amenity.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-muted small">No amenities have been recorded for this unit yet.</span>
            )}
          </div>
          <h5 className="text-dark fw-medium mt-3">Unit Details</h5>
          <p className="mt-2">{detailsText}</p>
          <div className="d-flex align-items-center justify-content-between">
            <p className="mb-0 d-flex align-items-center gap-1 text-muted">
              <IconifyIcon icon="solar:calendar-date-broken" className="fs-18 text-primary" />
              Created {unit.created_at ? new Date(unit.created_at).toLocaleDateString() : "N/A"}
            </p>
            <p className="mb-0 d-flex align-items-center gap-1 text-muted">
              <IconifyIcon icon="solar:refresh-circle-bold-duotone" className="fs-18 text-primary" />
              Updated {unit.updated_at ? new Date(unit.updated_at).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PropertyDetails;
