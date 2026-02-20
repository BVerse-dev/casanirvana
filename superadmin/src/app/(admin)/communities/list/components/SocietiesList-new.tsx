"use client";

import { useState } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  Col, 
  Row, 
  Button, 
  Badge,
  Table,
  Form,
  FormControl,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { societiesDummyData, SocietyDummyData } from "@/assets/data/communities-dummy";
import Link from "next/link";
import { toast } from "react-hot-toast";

const SocietiesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [societyToDelete, setSocietyToDelete] = useState<SocietyDummyData | null>(null);

  // Filter and sort societies using dummy data
  const filteredSocieties = societiesDummyData
    .filter(society => 
      society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.area.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "address":
          comparison = a.address.localeCompare(b.address);
          break;
        case "established":
          comparison = a.establishedYear - b.establishedYear;
          break;
        case "units":
          comparison = a.totalUnits - b.totalUnits;
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "occupancy":
          const occupancyA = (a.occupiedUnits / a.totalUnits) * 100;
          const occupancyB = (b.occupiedUnits / b.totalUnits) * 100;
          comparison = occupancyA - occupancyB;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return "ri:expand-up-down-line";
    }
    return sortOrder === "asc" ? "ri:arrow-up-line" : "ri:arrow-down-line";
  };

  const handleDeleteClick = (society: SocietyDummyData) => {
    setSocietyToDelete(society);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (societyToDelete) {
      toast.success("Society deleted successfully");
      setShowDeleteModal(false);
      setSocietyToDelete(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "success";
      case "under construction": return "warning";
      case "maintenance": return "info";
      default: return "secondary";
    }
  };

  const getOccupancyRate = (society: SocietyDummyData) => {
    return Math.round((society.occupiedUnits / society.totalUnits) * 100);
  };

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">Societies List View</CardTitle>
          <div className="d-flex gap-2">
            <Button 
              as={Link} 
              href="/societies/add" 
              variant="primary" 
              size="sm"
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Society
            </Button>
            <Button 
              as={Link} 
              href="/societies/grid" 
              variant="outline-secondary" 
              size="sm"
            >
              <IconifyIcon icon="ri:grid-line" className="me-1" />
              Grid View
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {/* Search and Filter Controls */}
          <Row className="mb-4">
            <Col md={8}>
              <InputGroup>
                <FormControl
                  type="text"
                  placeholder="Search societies by name, address, or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="ri:search-line" />
                </Button>
              </InputGroup>
            </Col>
            <Col md={4} className="text-end">
              <span className="text-muted">
                Showing {filteredSocieties.length} of {societiesDummyData.length} societies
              </span>
            </Col>
          </Row>

          {/* Societies Table */}
          {filteredSocieties.length === 0 ? (
            <div className="text-center py-5">
              <IconifyIcon icon="ri:building-3-line" className="fs-48 text-muted mb-3" />
              <h5 className="text-muted mb-2">No Societies Found</h5>
              <p className="text-muted mb-3">
                {searchTerm ? "No societies match your search criteria." : "Get started by adding your first society."}
              </p>
              <Button as={Link} href="/societies/add" variant="primary">
                <IconifyIcon icon="ri:add-line" className="me-1" />
                Add New Society
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="table-centered mb-0">
                <thead className="table-light">
                  <tr>
                    <th 
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("name")}
                    >
                      Society Name{" "}
                      <IconifyIcon icon={getSortIcon("name")} className="small" />
                    </th>
                    <th 
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("address")}
                    >
                      Location{" "}
                      <IconifyIcon icon={getSortIcon("address")} className="small" />
                    </th>
                    <th 
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("units")}
                    >
                      Units{" "}
                      <IconifyIcon icon={getSortIcon("units")} className="small" />
                    </th>
                    <th 
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("occupancy")}
                    >
                      Occupancy{" "}
                      <IconifyIcon icon={getSortIcon("occupancy")} className="small" />
                    </th>
                    <th 
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("rating")}
                    >
                      Rating{" "}
                      <IconifyIcon icon={getSortIcon("rating")} className="small" />
                    </th>
                    <th 
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("established")}
                    >
                      Established{" "}
                      <IconifyIcon icon={getSortIcon("established")} className="small" />
                    </th>
                    <th>Status</th>
                    <th>Maintenance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSocieties.map((society) => (
                    <tr key={society.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-light rounded me-2 d-flex align-items-center justify-content-center">
                            <IconifyIcon icon={society.icon} className="text-primary" />
                          </div>
                          <div>
                            <h6 className="mb-1">
                              <Link 
                                href={`/societies/details?id=${society.id}`} 
                                className="text-decoration-none"
                              >
                                {society.name}
                              </Link>
                            </h6>
                            <p className="text-muted small mb-0">
                              {society.type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-muted">
                          <IconifyIcon icon="ri:map-pin-line" className="me-1" />
                          <div className="small">
                            <div>{society.address}</div>
                            <div className="text-muted">{society.area}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-center">
                          <div className="fw-medium">{society.totalUnits}</div>
                          <div className="small text-muted">{society.occupiedUnits} occupied</div>
                        </div>
                      </td>
                      <td>
                        <div className="text-center">
                          <div className="fw-medium">{getOccupancyRate(society)}%</div>
                          <div className="progress" style={{ height: "4px" }}>
                            <div 
                              className="progress-bar bg-primary" 
                              style={{ width: `${getOccupancyRate(society)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon="ri:star-fill" className="text-warning me-1 small" />
                          <span className="fw-medium">{society.rating}</span>
                          <span className="text-muted small">/5</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {society.establishedYear}
                        </span>
                      </td>
                      <td>
                        <Badge 
                          bg={getStatusVariant(society.status)} 
                          className="small"
                        >
                          {society.status.charAt(0).toUpperCase() + society.status.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-muted small">
                          ${society.maintenanceCharges.toLocaleString()}/month
                        </span>
                      </td>
                      <td>
                        <Dropdown>
                          <DropdownToggle
                            variant="light"
                            size="sm"
                            className="btn-icon"
                          >
                            <IconifyIcon icon="ri:more-2-line" />
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem 
                              as={Link} 
                              href={`/societies/details?id=${society.id}`}
                            >
                              <IconifyIcon icon="ri:eye-line" className="me-1" />
                              View Details
                            </DropdownItem>
                            <DropdownItem 
                              as={Link} 
                              href={`/property/list?society=${society.id}`}
                            >
                              <IconifyIcon icon="ri:community-line" className="me-1" />
                              View Units
                            </DropdownItem>
                            <DropdownItem 
                              as={Link} 
                              href={`/societies/edit?id=${society.id}`}
                            >
                              <IconifyIcon icon="ri:edit-line" className="me-1" />
                              Edit Society
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem 
                              className="text-danger"
                              onClick={() => handleDeleteClick(society)}
                            >
                              <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                              Delete Society
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filteredSocieties.length > 0 && (
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
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <ModalHeader closeButton>
          <h5>Confirm Delete</h5>
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to delete <strong>{societyToDelete?.name}</strong>? 
            This action cannot be undone.
          </p>
          <Alert variant="warning" className="mb-0">
            <IconifyIcon icon="ri:warning-line" className="me-2" />
            <strong>Warning:</strong> All associated units and data will also be affected.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
          >
            <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
            Delete Society
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SocietiesList;
