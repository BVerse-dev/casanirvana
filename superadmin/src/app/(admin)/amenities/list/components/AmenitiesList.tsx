"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Badge,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useListAmenities } from "@/hooks/useAmenities";
import { useState } from "react";

const AmenitiesList = () => {
  const { data: amenities = [], isLoading } = useListAmenities();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Filter and sort amenities
  const filteredAmenities = amenities
    .filter(amenity => {
      const matchesSearch = amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           amenity.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || 
                         (filterType === "paid" && amenity.is_paid) ||
                         (filterType === "free" && !amenity.is_paid) ||
                         amenity.amenity_type?.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return (a.price_per_hour || 0) - (b.price_per_hour || 0);
        case "capacity":
          return (a.capacity || 0) - (b.capacity || 0);
        case "type":
          return (a.amenity_type || "").localeCompare(b.amenity_type || "");
        default:
          return 0;
      }
    });

  const getAmenityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
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

  const getStatusBadge = (amenity: any) => {
    if (!amenity.is_active) {
      return <Badge bg="danger" className="fs-11 fw-medium">Inactive</Badge>;
    }
    return <Badge bg="success" className="fs-11 fw-medium">Active</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      "Recreation": "info",
      "Fitness": "success", 
      "Sports": "primary",
      "Event Space": "warning",
      "Educational": "secondary",
      "Utility": "dark"
    };
    return <Badge bg={colors[type] || "light"} className="fs-11 fw-medium">{type}</Badge>;
  };

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2">Loading amenities...</div>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <CardTitle as={"h4"} className="mb-0">
                  All Amenities List
                </CardTitle>
                <small className="text-muted">
                  Showing {filteredAmenities.length} of {amenities.length} amenities
                </small>
              </div>
              <div className="d-flex gap-2">
                <Link href="/amenities/add" className="btn btn-primary btn-sm">
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Amenity
                </Link>
                <Dropdown>
                  <DropdownToggle
                    as={"a"}
                    className="btn btn-sm btn-outline-light rounded content-none icons-center"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Export{" "}
                    <IconifyIcon
                      className="ms-1"
                      width={16}
                      height={16}
                      icon="ri:arrow-down-s-line"
                    />
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-end">
                    <DropdownItem>
                      <IconifyIcon icon="ri:download-line" className="me-2" />
                      Download PDF
                    </DropdownItem>
                    <DropdownItem>
                      <IconifyIcon icon="ri:file-excel-line" className="me-2" />
                      Export to Excel
                    </DropdownItem>
                    <DropdownItem>
                      <IconifyIcon icon="ri:printer-line" className="me-2" />
                      Print List
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </CardHeader>

          {/* Search and Filter Controls */}
          <div className="p-3 border-bottom bg-light-subtle">
            <Row className="g-3">
              <Col md={4}>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:search-line" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search amenities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select 
                  size="sm" 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="paid">Paid Only</option>
                  <option value="free">Free Only</option>
                  <option value="recreation">Recreation</option>
                  <option value="fitness">Fitness</option>
                  <option value="sports">Sports</option>
                  <option value="event space">Event Space</option>
                  <option value="educational">Educational</option>
                  <option value="utility">Utility</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select 
                  size="sm" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="capacity">Sort by Capacity</option>
                  <option value="type">Sort by Type</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <div className="d-flex gap-1">
                  <Button variant="outline-secondary" size="sm" onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setSortBy("name");
                  }}>
                    <IconifyIcon icon="ri:refresh-line" />
                  </Button>
                  <Button variant="outline-primary" size="sm">
                    <IconifyIcon icon="ri:filter-line" />
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "40px" }} className="border-0 py-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="customCheck1"
                      />
                      <label className="form-check-label" htmlFor="customCheck1" />
                    </div>
                  </th>
                  <th className="border-0 fw-semibold fs-13 py-3" style={{ minWidth: "300px" }}>Amenity Details</th>
                  <th className="border-0 fw-semibold fs-13 text-center py-3" style={{ width: "140px" }}>Type</th>
                  <th className="border-0 fw-semibold fs-13 text-center py-3" style={{ width: "100px" }}>Capacity</th>
                  <th className="border-0 fw-semibold fs-13 text-center py-3" style={{ width: "120px" }}>Pricing</th>
                  <th className="border-0 fw-semibold fs-13 text-center py-3" style={{ width: "160px" }}>Booking Info</th>
                  <th className="border-0 fw-semibold fs-13 text-center py-3" style={{ width: "140px" }}>Status</th>
                  <th className="border-0 fw-semibold fs-13 text-center py-3" style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAmenities.map((amenity, idx) => (
                  <tr key={amenity.id} className="border-bottom">
                    <td className="py-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`customCheck${idx + 2}`}
                        />
                        <label className="form-check-label" htmlFor={`customCheck${idx + 2}`}>
                          &nbsp;
                        </label>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-md bg-primary bg-opacity-10 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                          <IconifyIcon
                            icon={getAmenityIcon(amenity.amenity_type || "")}
                            className="fs-20 text-primary"
                          />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <Link 
                            href={`/amenities/details/${amenity.id}`} 
                            className="text-dark fw-semibold fs-14 text-decoration-none amenity-name-link d-block mb-1"
                          >
                            {amenity.name}
                          </Link>
                          <p className="text-muted mb-1 fs-12 text-truncate-2" style={{ maxWidth: "280px" }}>
                            {amenity.description}
                          </p>
                          <div className="d-flex align-items-center text-muted fs-11">
                            <IconifyIcon icon="ri:time-line" className="me-1 fs-11" />
                            <span>{amenity.availability_start} - {amenity.availability_end}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex flex-column align-items-center gap-1">
                        {getTypeBadge(amenity.amenity_type || "General")}
                        <small className="text-muted fs-11">
                          {(amenity.societies as any)?.name || "N/A"}
                        </small>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex flex-column align-items-center">
                        <span className="fw-semibold fs-15 text-dark mb-1">
                          {amenity.capacity || "∞"}
                        </span>
                        <small className="text-muted fs-10 text-uppercase fw-medium">
                          {amenity.capacity ? "people" : "unlimited"}
                        </small>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex flex-column align-items-center gap-1">
                        <span
                          className={`badge bg-${
                            amenity.is_paid ? "warning" : "success"
                          }-subtle text-${
                            amenity.is_paid ? "warning" : "success"
                          } py-1 px-2 fs-11 fw-medium`}
                        >
                          {amenity.is_paid ? "PAID" : "FREE"}
                        </span>
                        <span className="fw-medium fs-12 text-dark">
                          {amenity.is_paid ? `$${amenity.price_per_hour}/hr` : "No charge"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex flex-column align-items-center gap-1">
                        <div className="d-flex align-items-center text-muted fs-11 mb-1">
                          <IconifyIcon icon="ri:calendar-line" className="me-1 fs-11" />
                          <span>{amenity.advance_booking_hours || 24}h ahead</span>
                        </div>
                        <div className="d-flex align-items-center text-muted fs-11">
                          <IconifyIcon icon="ri:repeat-line" className="me-1 fs-11" />
                          <span>{amenity.booking_limit_per_day || "∞"}/day</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex flex-column align-items-center gap-2">
                        {getStatusBadge(amenity)}
                        <small className="text-muted fs-10 text-uppercase fw-medium">
                          {new Date(amenity.updated_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </small>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <Link href={`/amenities/details/${amenity.id}`}>
                          <Button variant="light" size="sm" className="btn-icon d-flex align-items-center justify-content-center" title="View Details" style={{ width: "32px", height: "32px" }}>
                            <IconifyIcon
                              icon="solar:eye-broken"
                              className="fs-14"
                            />
                          </Button>
                        </Link>
                        <Button variant="soft-primary" size="sm" className="btn-icon d-flex align-items-center justify-content-center" title="Edit Amenity" style={{ width: "32px", height: "32px" }}>
                          <IconifyIcon
                            icon="solar:pen-2-broken"
                            className="fs-14"
                          />
                        </Button>
                        <Button variant="soft-info" size="sm" className="btn-icon d-flex align-items-center justify-content-center" title="View Bookings" style={{ width: "32px", height: "32px" }}>
                          <IconifyIcon
                            icon="ri:calendar-check-line"
                            className="fs-14"
                          />
                        </Button>
                        <Button variant="soft-danger" size="sm" className="btn-icon d-flex align-items-center justify-content-center" title="Delete" style={{ width: "32px", height: "32px" }}>
                          <IconifyIcon
                            icon="solar:trash-bin-trash-broken"
                            className="fs-14"
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredAmenities.length === 0 && (
              <div className="text-center py-5">
                <div className="avatar-xl bg-light rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:building-line" className="fs-24 text-muted" />
                </div>
                <h5 className="text-dark mb-2 fs-16">No amenities found</h5>
                <p className="text-muted mb-4 fs-13" style={{ maxWidth: "400px", margin: "0 auto" }}>
                  {searchTerm || filterType !== "all" 
                    ? "Try adjusting your search or filter criteria to find what you're looking for" 
                    : "Get started by adding your first amenity to the system"}
                </p>
                {searchTerm || filterType !== "all" ? (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="px-3"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                    }}
                  >
                    <IconifyIcon icon="ri:refresh-line" className="me-1" />
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/amenities/add" className="btn btn-primary btn-sm">
                    <IconifyIcon icon="ri:add-line" className="me-1" />
                    Add First Amenity
                  </Link>
                )}
              </div>
            )}
          </div>
          <CardFooter className="d-flex align-items-center justify-content-between bg-light-subtle py-3">
            <div className="d-flex align-items-center gap-3">
              <p className="text-muted mb-0 fs-13">
                Showing <span className="fw-semibold text-dark">{filteredAmenities.length}</span> of{" "}
                <span className="fw-semibold text-dark">{amenities.length}</span> amenities
              </p>
              <div className="d-flex gap-2">
                <Badge bg="success" className="fs-11 fw-medium">
                  {amenities.filter(a => !a.is_paid).length} Free
                </Badge>
                <Badge bg="warning" className="fs-11 fw-medium">
                  {amenities.filter(a => a.is_paid).length} Paid
                </Badge>
                <Badge bg="primary" className="fs-11 fw-medium">
                  {amenities.filter(a => a.is_active).length} Active
                </Badge>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted fs-12">View per page:</small>
              <Form.Select size="sm" style={{ width: "80px" }} className="fs-12">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </Form.Select>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <a className="page-link fs-12" href="#" tabIndex={-1}>
                    <IconifyIcon icon="ri:arrow-left-s-line" />
                  </a>
                </li>
                <li className="page-item active">
                  <a className="page-link fs-12" href="#">1</a>
                </li>
                <li className="page-item">
                  <a className="page-link fs-12" href="#">2</a>
                </li>
                <li className="page-item">
                  <a className="page-link fs-12" href="#">3</a>
                </li>
                <li className="page-item">
                  <a className="page-link fs-12" href="#">
                    <IconifyIcon icon="ri:arrow-right-s-line" />
                  </a>
                </li>
              </ul>
            </div>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  );
};

export default AmenitiesList;
