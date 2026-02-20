// filepath: /Users/andromeda/casa-nirvana/apps/casa-nirvana-admin/superadmin/src/app/(admin)/societies/grid/components/SocietiesGrid.tsx
"use client";

import { useState } from "react";
import { Button, Card, CardBody, CardFooter, Col, Row, Form, InputGroup } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { societiesDummyData, SocietyDummyData } from "@/assets/data/communities-dummy";
import Link from "next/link";
import { toast } from "react-hot-toast";

const CommunityCard = ({ society }: { society: SocietyDummyData }) => {
  const occupancyRate = Math.round((society.occupiedUnits / society.totalUnits) * 100);
  
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      toast.success("Society deleted successfully");
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="position-relative">
        <div className="bg-light-subtle d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
          <IconifyIcon icon={society.icon} className="fs-48 text-primary" />
        </div>
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
          <span className={`badge bg-${society.variant} text-white fs-13`}>
            {society.status.charAt(0).toUpperCase() + society.status.slice(1)}
          </span>
        </span>
      </div>
      <CardBody>
        <div className="d-flex align-items-center gap-2">
          <div className="avatar bg-light rounded flex-centered">
            <IconifyIcon
              icon={society.icon}
              width={24}
              height={24}
              className="fs-24 text-primary"
            />
          </div>
          <div>
            <Link href={`/societies/details?id=${society.id}`} className="text-dark fw-medium fs-16">
              {society.name}
            </Link>
            <p className="text-muted mb-0">{society.address}</p>
          </div>
        </div>
        <Row className="mt-2 g-2">
          <Col lg={6} xs={6}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon icon="solar:home-2-broken" className="align-middle" />
              </span>
              &nbsp;
              {society.totalUnits} Units
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
              {occupancyRate}% Occupied
            </span>
          </Col>
          <Col lg={6} xs={6}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:star-bold"
                  className="align-middle"
                />
              </span>
              &nbsp;
              {society.rating}/5
            </span>
          </Col>
          <Col lg={6} xs={6}>
            <span className="badge bg-light-subtle text-muted border fs-12">
              <span className="fs-16">
                <IconifyIcon
                  icon="solar:calendar-broken"
                  className="align-middle"
                />
              </span>
              &nbsp;
              {society.establishedYear}
            </span>
          </Col>
        </Row>
        <div className="mt-2">
          <div className="text-muted small">Amenities:</div>
          <div className="d-flex flex-wrap gap-1 mt-1">
            {society.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="badge bg-primary-subtle text-primary small">
                {amenity}
              </span>
            ))}
            {society.amenities.length > 3 && (
              <span className="badge bg-secondary-subtle text-secondary small">
                +{society.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="bg-light-subtle d-flex justify-content-between align-items-center border-top">
        <p className="fw-medium text-dark fs-16 mb-0">
          ${society.maintenanceCharges.toLocaleString()}/month
        </p>
        <div className="d-flex gap-1">
          <Button 
            variant="light" 
            size="sm"
            title="Edit Society"
          >
            <IconifyIcon icon="solar:pen-bold-duotone" />
          </Button>
          <Button 
            variant="light" 
            size="sm"
            title="Delete Society"
            onClick={() => handleDelete(society.id, society.name)}
          >
            <IconifyIcon icon="solar:trash-bin-minimalistic-bold-duotone" />
          </Button>
          <Link href={`/societies/details?id=${society.id}`} className="btn btn-light btn-sm">
            <IconifyIcon icon="solar:eye-bold-duotone" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

const SocietiesGrid = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Filter and sort societies
  const filteredSocieties = societiesDummyData
    .filter(society => 
      society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.area.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "units":
          return b.totalUnits - a.totalUnits;
        case "rating":
          return b.rating - a.rating;
        case "year":
          return b.establishedYear - a.establishedYear;
        default:
          return 0;
      }
    });

  return (
    <Col xl={9} lg={12}>
      {/* Search and Filter Controls */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search societies by name, address, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary">
              <IconifyIcon icon="solar:magnifer-broken" />
            </Button>
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="units">Sort by Unit Count</option>
            <option value="rating">Sort by Rating</option>
            <option value="year">Sort by Established Year</option>
          </Form.Select>
        </Col>
        <Col md={3} className="text-end">
          <span className="text-muted">
            {filteredSocieties.length} societies found
          </span>
        </Col>
      </Row>

      {/* Societies Grid */}
      {filteredSocieties.length === 0 ? (
        <div className="text-center py-5">
          <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-48 text-muted mb-3" />
          <h5 className="text-muted mb-2">No Societies Found</h5>
          <p className="text-muted mb-3">
            {searchTerm ? "No societies match your search criteria." : "Get started by adding your first society."}
          </p>
          <Button as={Link} href="/societies/add" variant="primary">
            <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
            Add New Society
          </Button>
        </div>
      ) : (
        <>
          <Row>
            {filteredSocieties.map((society) => (
              <Col lg={4} md={6} key={society.id} className="mb-4">
                <CommunityCard society={society} />
              </Col>
            ))}
          </Row>
          
          {/* Pagination */}
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
        </>
      )}
    </Col>
  );
};

export default SocietiesGrid;
