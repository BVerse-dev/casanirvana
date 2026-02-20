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

  // Filter and sort societies
  const filteredSocieties = societies?.filter(society =>
    society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedSocieties = [...filteredSocieties].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "address":
        comparison = (a.address || "").localeCompare(b.address || "");
        break;
      case "created_at":
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "units":
        const unitsA = units?.filter(u => u.society_id === a.id).length || 0;
        const unitsB = units?.filter(u => u.society_id === b.id).length || 0;
        comparison = unitsA - unitsB;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getUnitCount = (societyId: string) => {
    return units?.filter(unit => unit.society_id === societyId).length || 0;
  };

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

  const handleDeleteClick = (society: Society) => {
    setSocietyToDelete(society);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (societyToDelete) {
      try {
        await deleteApartment.mutateAsync(societyToDelete.id);
        toast.success("Society deleted successfully");
        setShowDeleteModal(false);
        setSocietyToDelete(null);
      } catch (error) {
        console.error("Error deleting society:", error);
        toast.error("Failed to delete society");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (error) {
    return (
      <Alert variant="danger">
        <IconifyIcon icon="ri:error-warning-line" className="me-2" />
        Error loading societies: {error.message}
      </Alert>
    );
  }

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
            <Col md={6}>
              <InputGroup>
                <FormControl
                  type="text"
                  placeholder="Search societies by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="ri:search-line" />
                </Button>
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <span className="text-muted">
                Showing {sortedSocieties.length} of {societies?.length || 0} societies
              </span>
            </Col>
          </Row>

          {/* Societies Table */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading societies...</p>
            </div>
          ) : sortedSocieties.length === 0 ? (
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
                      Address{" "}
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
                      onClick={() => handleSort("created_at")}
                    >
                      Created{" "}
                      <IconifyIcon icon={getSortIcon("created_at")} className="small" />
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSocieties.map((society) => (
                    <tr key={society.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-light rounded me-2 d-flex align-items-center justify-content-center">
                            <IconifyIcon icon="ri:building-3-line" className="text-muted" />
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
                            {society.description && (
                              <p className="text-muted small mb-0">
                                {society.description.length > 50 
                                  ? `${society.description.substring(0, 50)}...` 
                                  : society.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-muted">
                          <IconifyIcon icon="ri:map-pin-line" className="me-1" />
                          {society.address || "Not provided"}
                        </div>
                      </td>
                      <td>
                        <Badge bg="info" className="small">
                          {getUnitCount(society.id)} Units
                        </Badge>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {formatDate(society.created_at)}
                        </span>
                      </td>
                      <td>
                        <Badge bg="success" className="small">Active</Badge>
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
            disabled={deleteApartment.isPending}
          >
            {deleteApartment.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                Delete Society
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SocietiesList;
