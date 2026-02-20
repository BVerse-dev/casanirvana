"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListUnits } from "@/hooks/useUnits";
import { Database } from "@/lib/database.types";
import { mapUnitToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardFooter, Col, Row } from "react-bootstrap";
import { useMemo } from "react";
import { UnitsFilterState } from "./UnitsFilter";

type Unit = Database["public"]["Tables"]["units"]["Row"] & {
  communities?: Database["public"]["Tables"]["communities"]["Row"] | { name: string };
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  // Additional fields for display purposes
  unit_number?: string;
  type?: string;
  area?: number;
  floor?: number;
  status?: string;
  rent_amount?: number;
  maintenance_amount?: number;
  images?: string[];
};

interface UnitsDataProps {
  filters: UnitsFilterState;
}

const UnitsCard = ({ unit }: { unit: Unit }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "occupied":
        return "success";
      case "vacant":
        return "primary";
      case "maintenance":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getUnitTypeIcon = (type: string) => {
    switch (type) {
      case "1bhk":
        return "solar:home-broken";
      case "2bhk":
        return "solar:home-2-broken";
      case "3bhk":
        return "solar:buildings-3-broken";
      case "4bhk":
        return "solar:buildings-broken";
      default:
        return "solar:home-broken";
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="position-relative">
        <Image
          src={mapUnitToPropertyImage(unit)}
          alt="unit"
          className="img-fluid rounded-top"
          width={400}
          height={250}
        />
        <span className="position-absolute top-0 start-0 p-1">
          <button
            type="button"
            className="btn bg-warning-subtle avatar-sm d-inline-flex align-items-center justify-content-center fs-20 rounded text-warning"
          >
            <span>
              <IconifyIcon icon="solar:bookmark-broken" />
            </span>
          </button>
        </span>
        <span className="position-absolute top-0 end-0 p-1">
          <span
            className={`badge bg-${getStatusVariant(unit.status || "")} text-white fs-13`}
          >
            {unit.status ? unit.status.charAt(0).toUpperCase() + unit.status.slice(1) : 'Unknown'}
          </span>
        </span>
      </div>
      <CardBody>
        <div className="d-flex align-items-center gap-2">
          <div className="avatar bg-light rounded flex-centered">
            <IconifyIcon
              icon={getUnitTypeIcon(unit.type || "")}
              width={24}
              height={24}
              className="fs-24 text-primary"
            />
          </div>
          <div>
            <Link
              href={`/property/details?id=${unit.id}`}
              className="text-dark fw-medium fs-16"
            >
              Unit {unit.unit_number || unit.number}
            </Link>
            <p className="text-muted mb-0">{unit.communities?.name}</p>
          </div>
        </div>
        <Row className="mt-2 g-2">
          <Col lg={6} xs={6}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:home-broken"
                  className="align-middle"
                />
              </span>
              &nbsp;
              {unit.type?.toUpperCase()}
            </span>
          </Col>
          <Col lg={6} xs={6}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:scale-broken"
                  className="align-middle"
                />
              </span>
              &nbsp;
              {unit.area} sq ft
            </span>
          </Col>
          <Col lg={6} xs={6}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:double-alt-arrow-up-broken"
                  className="align-middle"
                />
              </span>
              &nbsp; Floor {unit.floor}
            </span>
          </Col>
          <Col lg={6} xs={6}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:users-group-rounded-broken"
                  className="align-middle"
                />
              </span>
              &nbsp;
              {unit.status}
            </span>
          </Col>
        </Row>
      </CardBody>
      <CardFooter className="bg-light-subtle d-flex justify-content-between align-items-center border-top">
        {unit.status === "vacant" ? (
          <p className="fw-medium text-success fs-16 mb-0">Available</p>
        ) : (
          <p className="fw-medium text-dark fs-16 mb-0">
            ${unit.rent_amount || "N/A"}/month
          </p>
        )}
        <div>
          <Link
            href={`/property/details?id=${unit.id}`}
            className="link-primary fw-medium"
          >
            View Details{" "}
            <IconifyIcon icon="ri:arrow-right-line" className="align-middle" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

const UnitsData = ({ filters }: UnitsDataProps) => {
  const { data: unitsResponse, isLoading, error } = useListUnits({
    communityId: filters.communityId,
    pageSize: 100 // Get more units for better filtering
  });
  const allUnits = unitsResponse?.data || [];

  // Apply client-side filtering
  const filteredUnits = useMemo(() => {
    let filtered = [...allUnits];

    // Filter by unit type
    if (filters.unitType) {
      filtered = filtered.filter(unit => unit.type === filters.unitType);
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(unit => unit.status === filters.status);
    }

    // Filter by rent range
    if (filters.rentRange) {
      filtered = filtered.filter(unit => {
        const rent = unit.rent_amount || 0;
        return rent >= filters.rentRange[0] && rent <= filters.rentRange[1];
      });
    }

    // Filter by area range
    if (filters.minArea) {
      filtered = filtered.filter(unit => (unit.area || 0) >= filters.minArea!);
    }
    if (filters.maxArea) {
      filtered = filtered.filter(unit => (unit.area || 0) <= filters.maxArea!);
    }

    // Filter by floor range
    if (filters.minFloor) {
      filtered = filtered.filter(unit => (unit.floor || 0) >= filters.minFloor!);
    }
    if (filters.maxFloor) {
      filtered = filtered.filter(unit => (unit.floor || 0) <= filters.maxFloor!);
    }

    return filtered;
  }, [allUnits, filters]);

  if (isLoading) {
    return (
      <Col xl={9} lg={12}>
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Col>
    );
  }

  if (error) {
    return (
      <Col xl={9} lg={12}>
        <div className="alert alert-danger" role="alert">
          Error loading units: {error.message}
        </div>
      </Col>
    );
  }

  return (
    <Col xl={9} lg={12}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          Showing {filteredUnits.length} of {allUnits.length} units
        </h5>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Sort by:</span>
          <select className="form-select form-select-sm" style={{ width: 'auto' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rent-low">Rent: Low to High</option>
            <option value="rent-high">Rent: High to Low</option>
            <option value="area-small">Area: Small to Large</option>
            <option value="area-large">Area: Large to Small</option>
          </select>
        </div>
      </div>
      
      {filteredUnits.length === 0 ? (
        <div className="text-center py-5">
          <IconifyIcon icon="solar:home-broken" className="fs-48 text-muted mb-3" />
          <h5 className="text-muted">No units found</h5>
          <p className="text-muted">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <Row>
          {filteredUnits.map((unit) => (
            <Col lg={4} md={6} key={unit.id}>
              <UnitsCard unit={unit as Unit} />
            </Col>
          ))}
        </Row>
      )}
      
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

export default UnitsData;
