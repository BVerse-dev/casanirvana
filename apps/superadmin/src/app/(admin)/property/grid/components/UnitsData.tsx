"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListUnits, type UnitRecord } from "@/hooks/useUnits";
import { mapUnitToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardFooter, Col, Row } from "react-bootstrap";
import { useMemo, useState } from "react";
import { UnitsFilterState } from "./UnitsFilter";

type Unit = UnitRecord;

interface UnitsDataProps {
  filters: UnitsFilterState;
  viewMode: "grid" | "list";
  onViewModeChange: (view: "grid" | "list") => void;
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
              href={`/units/${unit.id}`}
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
            GH₵ {unit.rent_amount?.toLocaleString() || "N/A"}/month
          </p>
        )}
        <div>
          <Link
            href={`/units/${unit.id}`}
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

const UnitsData = ({ filters, viewMode, onViewModeChange }: UnitsDataProps) => {
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { data: unitsResponse, isLoading, error } = useListUnits({
    communityId: filters.communityId,
    pageSize: 200,
  });
  const allUnits = unitsResponse?.data || [];

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

    filtered.sort((left, right) => {
      switch (sortBy) {
        case "oldest":
          return new Date(left.created_at || 0).getTime() - new Date(right.created_at || 0).getTime();
        case "rent-low":
          return (left.rent_amount || 0) - (right.rent_amount || 0);
        case "rent-high":
          return (right.rent_amount || 0) - (left.rent_amount || 0);
        case "area-small":
          return (left.area || left.floor_area || 0) - (right.area || right.floor_area || 0);
        case "area-large":
          return (right.area || right.floor_area || 0) - (left.area || left.floor_area || 0);
        case "newest":
        default:
          return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();
      }
    });

    return filtered;
  }, [allUnits, filters, sortBy]);

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUnits = filteredUnits.slice(startIndex, startIndex + itemsPerPage);

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
          <div className="btn-group" role="group" aria-label="Directory view">
            <button type="button" className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => onViewModeChange("grid")} aria-label="Grid view" aria-pressed={viewMode === "grid"}>
              <IconifyIcon icon="ri:grid-line" />
            </button>
            <button type="button" className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => onViewModeChange("list")} aria-label="List view" aria-pressed={viewMode === "list"}>
              <IconifyIcon icon="ri:list-check" />
            </button>
          </div>
          <span className="text-muted">Sort by:</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setCurrentPage(1);
            }}
          >
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
          {currentUnits.map((unit) => (
            <Col lg={4} md={6} key={unit.id}>
              <UnitsCard unit={unit as Unit} />
            </Col>
          ))}
        </Row>
      )}
      
      <div className="p-3 border-top">
        <div className="d-flex align-items-center justify-content-between">
          <span className="text-muted small">
            Showing {filteredUnits.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUnits.length)} of {filteredUnits.length} units
          </span>
          {totalPages > 1 && (
            <nav aria-label="Units pagination">
              <ul className="pagination justify-content-end mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </Col>
  );
};

export default UnitsData;
