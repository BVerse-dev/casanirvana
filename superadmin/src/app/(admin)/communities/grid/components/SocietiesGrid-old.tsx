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
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormControl,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListSocieties, useDeleteSociety } from "@/hooks/useCommunities";
import { useListUnits } from "@/hooks/useUnits";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";

type Society = {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

const CommunityCard = ({ society, unitCount, onDelete }: { 
  society: Society; 
  unitCount: number; 
  onDelete: (id: string) => void;
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="position-relative">
        <div className="bg-light-subtle" style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconifyIcon icon="ri:building-3-line" className="fs-48 text-muted" />
        </div>
        <span className="position-absolute top-0 end-0 p-2">
          <Dropdown>
            <DropdownToggle
              variant="light"
              size="sm"
              className="btn-icon rounded-circle"
            >
              <IconifyIcon icon="ri:more-2-line" />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem as={Link} href={`/societies/details?id=${society.id}`}>
                <IconifyIcon icon="ri:eye-line" className="me-1" />
                View Details
              </DropdownItem>
              <DropdownItem as={Link} href={`/societies/edit?id=${society.id}`}>
                <IconifyIcon icon="ri:edit-line" className="me-1" />
                Edit Society
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem 
                className="text-danger"
                onClick={() => onDelete(society.id)}
              >
                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                Delete Society
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </span>
      </div>
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h6 className="mb-1">
              <Link href={`/societies/details?id=${society.id}`} className="text-decoration-none">
                {society.name}
              </Link>
            </h6>
            <p className="text-muted small mb-2">
              <IconifyIcon icon="ri:map-pin-line" className="me-1" />
              {society.address || "Address not provided"}
            </p>
          </div>
          <Badge bg="success" className="small">Active</Badge>
        </div>
        
        <div className="mb-3">
          <p className="text-muted small mb-0">
            {society.description || "No description available"}
          </p>
        </div>

        <Row className="g-2 text-center">
          <Col xs={6}>
            <div className="border-end">
              <h6 className="mb-0">{unitCount}</h6>
              <small className="text-muted">Units</small>
            </div>
          </Col>
          <Col xs={6}>
            <h6 className="mb-0">
              {new Date(society.created_at).getFullYear()}
            </h6>
            <small className="text-muted">Established</small>
          </Col>
        </Row>

        <div className="mt-3 d-flex gap-2">
          <Button 
            as={Link} 
            href={`/societies/details?id=${society.id}`}
            variant="primary" 
            size="sm" 
            className="flex-grow-1"
          >
            <IconifyIcon icon="ri:eye-line" className="me-1" />
            View Details
          </Button>
          <Button 
            as={Link} 
            href={`/property/list?society=${society.id}`}
            variant="outline-primary" 
            size="sm"
          >
            <IconifyIcon icon="ri:community-line" className="me-1" />
            Units
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

const SocietiesGrid = () => {
  const { data: societies, isLoading, error } = useListSocieties();
  const { data: unitsResponse } = useListUnits();
  const units = unitsResponse?.data || [];
  const deleteApartment = useDeleteSociety();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [societyToDelete, setSocietyToDelete] = useState<string | null>(null);

  // Filter and sort societies
  const filteredSocieties = societies?.data?.filter((society: any) =>
    society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedSocieties = [...filteredSocieties].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created_at":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "units":
        const unitsA = units?.filter(u => u.society_id === a.id).length || 0;
        const unitsB = units?.filter(u => u.society_id === b.id).length || 0;
        return unitsB - unitsA;
      default:
        return 0;
    }
  });

  const getUnitCount = (societyId: string) => {
    return units?.filter(unit => unit.society_id === societyId).length || 0;
  };

  const handleDeleteClick = (societyId: string) => {
    setSocietyToDelete(societyId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (societyToDelete) {
      try {
        await deleteApartment.mutateAsync(societyToDelete);
        toast.success("Society deleted successfully");
        setShowDeleteModal(false);
        setSocietyToDelete(null);
      } catch (error) {
        console.error("Error deleting society:", error);
        toast.error("Failed to delete society");
      }
    }
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
          <CardTitle as="h5">Societies Grid View</CardTitle>
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
              href="/societies/list" 
              variant="outline-secondary" 
              size="sm"
            >
              <IconifyIcon icon="ri:list-check-3" className="me-1" />
              List View
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
                  placeholder="Search societies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="ri:search-line" />
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="created_at">Sort by Date Created</option>
                <option value="units">Sort by Unit Count</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <span className="text-muted">
                {sortedSocieties.length} societies found
              </span>
            </Col>
          </Row>

          {/* Societies Grid */}
          {isLoading ? (
            <Row>
              {[...Array(6)].map((_, index) => (
                <Col xl={4} md={6} key={index} className="mb-4">
                  <Card>
                    <div className="placeholder-glow">
                      <div className="placeholder" style={{ height: "200px" }}></div>
                    </div>
                    <CardBody>
                      <div className="placeholder-glow">
                        <h6 className="placeholder col-8"></h6>
                        <p className="placeholder col-6"></p>
                        <div className="placeholder col-12"></div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
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
            <Row>
              {sortedSocieties.map((society) => (
                <Col xl={4} md={6} key={society.id} className="mb-4">
                  <CommunityCard 
                    society={society} 
                    unitCount={getUnitCount(society.id)}
                    onDelete={handleDeleteClick}
                  />
                </Col>
              ))}
            </Row>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <ModalHeader closeButton>
          <h5>Confirm Delete</h5>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this society? This action cannot be undone.</p>
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

export default SocietiesGrid;
