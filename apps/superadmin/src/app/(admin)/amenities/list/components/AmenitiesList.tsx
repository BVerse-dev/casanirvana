"use client";

import { useMemo, useState } from "react";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useDeleteAmenity, useListAmenities } from "@/hooks/useAmenities";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";

const PAGE_SIZE = 12;

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

const truncateText = (value?: string | null, maxLength = 92) => {
  if (!value) {
    return "No description available";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

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

const AmenitiesList = () => {
  const { data: amenities = [], isLoading, error } = useListAmenities();
  const deleteAmenity = useDeleteAmenity();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);

  const typeOptions = useMemo(() => {
    return Array.from(
      new Set(
        amenities
          .map((amenity) => amenity.amenity_type || amenity.category || "")
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [amenities]);

  const filteredAmenities = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...amenities]
      .filter((amenity) => {
        const matchesSearch =
          !normalizedSearch ||
          [amenity.name, amenity.description, amenity.communityName, amenity.location]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesType =
          typeFilter === "all" ||
          (typeFilter === "paid" && amenity.is_paid) ||
          (typeFilter === "free" && !amenity.is_paid) ||
          (amenity.amenity_type || amenity.category || "").toLowerCase() === typeFilter.toLowerCase();

        return matchesSearch && matchesType;
      })
      .sort((left, right) => {
        switch (sortBy) {
          case "price":
            return Number(right.price_per_hour || 0) - Number(left.price_per_hour || 0);
          case "capacity":
            return Number(right.capacity || 0) - Number(left.capacity || 0);
          case "updated":
            return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
          case "type":
            return (left.amenity_type || left.category || "").localeCompare(
              right.amenity_type || right.category || "",
            );
          case "name":
          default:
            return left.name.localeCompare(right.name);
        }
      });
  }, [amenities, searchTerm, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAmenities.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * PAGE_SIZE;
  const paginatedAmenities = filteredAmenities.slice(pageStart, pageStart + PAGE_SIZE);

  const handleReset = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setSortBy("name");
    setCurrentPage(1);
  };

  const handleDeleteAmenity = async (amenityId: string, amenityName: string) => {
    if (!window.confirm(`Delete "${amenityName}"? This action cannot be undone.`)) {
      return;
    }

    setFeedback(null);

    try {
      await deleteAmenity.mutateAsync(amenityId);
      setFeedback({
        variant: "success",
        message: `Amenity "${amenityName}" deleted.`,
      });
    } catch (mutationError) {
      console.error("Failed to delete amenity:", mutationError);
      setFeedback({
        variant: "danger",
        message: `Failed to delete "${amenityName}". Remove linked bookings first if this amenity is already in use.`,
      });
    }
  };

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">Loading amenities...</CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Alert variant="danger">Failed to load amenities.</Alert>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="border-bottom">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <CardTitle as="h4" className="mb-0">
                  Amenities Directory
                </CardTitle>
                <small className="text-muted">
                  Showing {filteredAmenities.length} of {amenities.length} amenities
                </small>
              </div>
              <Link href="/amenities/add" className="btn btn-primary btn-sm">
                <IconifyIcon icon="ri:add-line" className="me-1" />
                Add Amenity
              </Link>
            </div>
          </CardHeader>

          <CardBody className="border-bottom bg-light-subtle">
            <Row className="g-3">
              <Col md={5}>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:search-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search amenity, community, location"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  size="sm"
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="paid">Paid Only</option>
                  <option value="free">Free Only</option>
                  {typeOptions.map((option) => (
                    <option value={option.toLowerCase()} key={option}>
                      {formatLabel(option)}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  size="sm"
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="updated">Sort by Updated</option>
                  <option value="price">Sort by Price</option>
                  <option value="capacity">Sort by Capacity</option>
                  <option value="type">Sort by Type</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button variant="outline-secondary" size="sm" className="w-100" onClick={handleReset}>
                  <IconifyIcon icon="ri:refresh-line" className="me-1" />
                  Reset
                </Button>
              </Col>
            </Row>
          </CardBody>

          {feedback ? (
            <Alert
              variant={feedback.variant}
              className="m-3 mb-0"
              dismissible
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          ) : null}

          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold fs-13 py-3">Amenity</th>
                  <th className="fw-semibold fs-13 py-3 text-center">Type</th>
                  <th className="fw-semibold fs-13 py-3 text-center">Capacity</th>
                  <th className="fw-semibold fs-13 py-3 text-center">Pricing</th>
                  <th className="fw-semibold fs-13 py-3 text-center">Booking Policy</th>
                  <th className="fw-semibold fs-13 py-3 text-center">Status</th>
                  <th className="fw-semibold fs-13 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAmenities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No amenities found for the current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedAmenities.map((amenity) => (
                    <tr key={amenity.id}>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-md bg-primary bg-opacity-10 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                            <IconifyIcon
                              icon={getAmenityIcon(amenity.amenity_type || amenity.category)}
                              className="fs-20 text-primary"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/amenities/details/${amenity.id}`}
                              className="text-dark fw-semibold fs-14 text-decoration-none d-block mb-1"
                            >
                              {amenity.name}
                            </Link>
                            <p className="text-muted mb-1 fs-12">{truncateText(amenity.description)}</p>
                            <small className="text-muted">
                              <IconifyIcon icon="ri:map-pin-line" className="me-1" />
                              {amenity.location || amenity.communityName || "Location not set"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <Badge bg="info" className="fs-11 fw-medium">
                            {formatLabel(amenity.amenity_type || amenity.category)}
                          </Badge>
                          <small className="text-muted fs-11">{amenity.communityName || "Community not set"}</small>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="fw-semibold">{amenity.capacity || "Unlimited"}</div>
                        <small className="text-muted fs-11">
                          {amenity.capacity ? "people" : "no cap"}
                        </small>
                      </td>
                      <td className="py-3 text-center">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <Badge
                            bg={amenity.is_paid ? "warning" : "success"}
                            className="fs-11 fw-medium"
                          >
                            {amenity.is_paid ? "Paid" : "Free"}
                          </Badge>
                          <span className="fw-medium fs-12">
                            {amenity.is_paid ? formatMoney(amenity.price_per_hour) : "No charge"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <small className="text-muted">
                            {amenity.advance_booking_days || 0} day(s) notice
                          </small>
                          <small className="text-muted">
                            Max {amenity.max_booking_duration || 0} hour(s)
                          </small>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <Badge
                            bg={amenity.is_active ? "success" : "danger"}
                            className="fs-11 fw-medium"
                          >
                            {amenity.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <small className="text-muted fs-11">
                            Updated {new Date(amenity.updated_at).toLocaleDateString()}
                          </small>
                        </div>
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <Link href={`/amenities/details/${amenity.id}`}>
                            <Button variant="light" size="sm" title="View Details">
                              <IconifyIcon icon="solar:eye-broken" className="fs-14" />
                            </Button>
                          </Link>
                          <Link href={`/amenities/bookings?amenityId=${amenity.id}`}>
                            <Button variant="soft-info" size="sm" title="View Bookings">
                              <IconifyIcon icon="ri:calendar-check-line" className="fs-14" />
                            </Button>
                          </Link>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            title="Delete Amenity"
                            onClick={() => void handleDeleteAmenity(amenity.id, amenity.name)}
                            disabled={deleteAmenity.isPending}
                          >
                            <IconifyIcon icon="solar:trash-bin-trash-broken" className="fs-14" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <CardFooter className="d-flex align-items-center justify-content-between bg-light-subtle py-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <p className="text-muted mb-0 fs-13">
                Showing{" "}
                <span className="fw-semibold text-dark">
                  {filteredAmenities.length === 0 ? 0 : pageStart + 1}
                </span>{" "}
                to{" "}
                <span className="fw-semibold text-dark">
                  {Math.min(pageStart + PAGE_SIZE, filteredAmenities.length)}
                </span>{" "}
                of <span className="fw-semibold text-dark">{filteredAmenities.length}</span> filtered amenities
              </p>
              <div className="d-flex gap-2">
                <Badge bg="success" className="fs-11 fw-medium">
                  {amenities.filter((amenity) => !amenity.is_paid).length} Free
                </Badge>
                <Badge bg="warning" className="fs-11 fw-medium">
                  {amenities.filter((amenity) => amenity.is_paid).length} Paid
                </Badge>
                <Badge bg="primary" className="fs-11 fw-medium">
                  {amenities.filter((amenity) => amenity.is_active).length} Active
                </Badge>
              </div>
            </div>
            {filteredAmenities.length > PAGE_SIZE ? (
              <div className="d-flex align-items-center gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPageSafe <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <span className="small text-muted">
                  Page {currentPageSafe} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPageSafe >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </CardFooter>
        </Card>
      </Col>
    </Row>
  );
};

export default AmenitiesList;
