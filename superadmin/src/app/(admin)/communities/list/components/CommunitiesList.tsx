"use client";

import { useState, useMemo } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  Col, 
  Row, 
  Button, 
  Badge,
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
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useListCommunities, useDeleteCommunity } from "@/hooks/useCommunities";
import { useListUnits } from "@/hooks/useUnits";
import type { Database } from "@/lib/database.types";
import { mapPropertyUrl, mapSocietyToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";

type Community = Database["public"]["Tables"]["societies"]["Row"];

const CommunitiesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Items per page

  // Fetch communities data from Supabase
  const { data: communitiesData = { data: [], count: 0 }, isLoading, error } = useListCommunities();
  // Extract communities array from the new structure
  const communities = communitiesData?.data || [];
  
  // Fetch units data to get unit counts per community
  const { data: unitsData } = useListUnits({ page: 1, pageSize: 1000 }); // Get all units
  const units = unitsData?.data || [];
  
  // Create a map of community ID to unit count
  const communityUnitCounts = useMemo(() => {
    const counts = new Map<string, number>();
    units.forEach(unit => {
      if (unit.community_id) {
        const count = counts.get(unit.community_id) || 0;
        counts.set(unit.community_id, count + 1);
      }
    });
    return counts;
  }, [units]);
  
  const deleteCommunityMutation = useDeleteCommunity();

  // Loading state
  if (isLoading) {
    return (
      <Row>
        <Col>
          <Card>
            <CardBody className="text-center py-5">
              <div>Loading communities...</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  // Error state
  if (error) {
    return (
      <Row>
        <Col>
          <Card>
            <CardBody className="text-center py-5">
              <div className="text-danger">Error loading communities</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  // Filter and sort communities using real data
  const filteredCommunities = communities
    .filter(community => 
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (community.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (community.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "address":
          comparison = (a.address || '').localeCompare(b.address || '');
          break;
        case "created_at":
          comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCommunities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCommunities = filteredCommunities.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
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

  const handleDeleteClick = (community: Community) => {
    setCommunityToDelete(community);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (communityToDelete) {
      try {
        await deleteCommunityMutation.mutateAsync(communityToDelete.id);
        toast.success("Community deleted successfully");
        setShowDeleteModal(false);
        setCommunityToDelete(null);
      } catch (error) {
        toast.error("Failed to delete community");
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
            <div>
              <CardTitle as={'h4'} className="mb-0">All Communities</CardTitle>
            </div>
            <div className="d-flex gap-2">
              <InputGroup style={{ width: "300px" }}>
                <FormControl
                  type="text"
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="ri:search-line" />
                </Button>
              </InputGroup>
              <Link href="/communities/add">
                <Button variant="primary">
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Community
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="table-responsive">
              <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>
                      <div 
                        className="d-flex align-items-center cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                                                Community Image & Name
                        <IconifyIcon 
                          icon={getSortIcon("name")} 
                          className="ms-1" 
                        />
                      </div>
                    </th>
                    <th>
                      <div 
                        className="d-flex align-items-center cursor-pointer"
                        onClick={() => handleSort("address")}
                      >
                        Address
                        <IconifyIcon 
                          icon={getSortIcon("address")} 
                          className="ms-1" 
                        />
                      </div>
                    </th>
                    <th>Units</th>
                    <th>Contact</th>
                    <th>
                      <div 
                        className="d-flex align-items-center cursor-pointer"
                        onClick={() => handleSort("created_at")}
                      >
                        Created
                        <IconifyIcon 
                          icon={getSortIcon("created_at")} 
                          className="ms-1" 
                        />
                      </div>
                    </th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCommunities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        <IconifyIcon icon="ri:building-line" className="fs-48 text-muted mb-3" />
                        <h5 className="text-muted">No communities found</h5>
                        <p className="text-muted">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    currentCommunities.map((community) => {
                      const unitCount = communityUnitCounts.get(community.id) || 0;
                      return (
                        <tr key={community.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <Image 
                                  src={mapPropertyUrl((community as any).image_url) || mapSocietyToPropertyImage(community.name)} 
                                  alt={community.name}
                                  className="rounded"
                                  style={{ objectFit: "cover" }}
                                  width={60}
                                  height={40}
                                />
                              </div>
                              <div>
                                <Link href={`/communities/details?id=${community.id}`} className="text-dark fw-medium fs-15 text-decoration-none">
                                  {community.name}
                                </Link>
                                <div className="text-muted small">
                                  ID: {community.id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small">
                              <IconifyIcon icon="ri:map-pin-line" className="me-1" />
                              {community.address || 'No address'}
                            </div>
                          </td>
                          <td>
                            <div className="text-center">
                              <div className="fw-medium">{unitCount}</div>
                              <div className="small text-muted">Units</div>
                            </div>
                          </td>
                          <td>
                            <div className="text-center">
                              <div className="fw-medium">{unitCount > 0 ? Math.round((unitCount / unitCount) * 100) : 0}%</div>
                              <div className="small text-muted">Occupied</div>
                            </div>
                          </td>
                          <td>
                            <div className="text-center">
                              <Badge bg="success" className="small">Active</Badge>
                            </div>
                          </td>
                          <td>
                            <div className="text-center">
                              <span className="text-muted small">
                                {community.created_at ? new Date(community.created_at).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link href={`/communities/details?id=${community.id}`}>
                                <Button variant="light" size="sm">
                                  <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                                </Button>
                              </Link>
                              <Link href={`/communities/${community.id}/edit`}>
                                <Button variant="soft-primary" size="sm">
                                  <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                                </Button>
                              </Link>
                              <Button 
                                variant="soft-danger" 
                                size="sm" 
                                onClick={() => handleDeleteClick(community)}
                              >
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
          <CardFooter className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted mb-0">
                Showing {Math.min(startIndex + 1, filteredCommunities.length)}-{Math.min(endIndex, filteredCommunities.length)} of {filteredCommunities.length} communities
                {communities.length !== filteredCommunities.length && ` (filtered from ${communities.length} total)`}
              </p>
            </div>
            {totalPages > 1 && (
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <a 
                      className="page-link" 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.max(1, currentPage - 1));
                      }}
                    >
                      Previous
                    </a>
                  </li>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const showPage = page === 1 || page === totalPages || 
                                  (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (!showPage && page === currentPage - 2) {
                      return (
                        <li key="ellipsis-start" className="page-item disabled">
                          <a className="page-link" href="#">
                            ...
                          </a>
                        </li>
                      );
                    }
                    
                    if (!showPage && page === currentPage + 2) {
                      return (
                        <li key="ellipsis-end" className="page-item disabled">
                          <a className="page-link" href="#">
                            ...
                          </a>
                        </li>
                      );
                    }
                    
                    if (!showPage) return null;
                    
                    return (
                      <li key={`page-${page}`} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                        <a 
                          className="page-link" 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </a>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <a 
                      className="page-link" 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                      }}
                    >
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            )}
          </CardFooter>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <ModalHeader closeButton>
            <h5>Confirm Delete</h5>
          </ModalHeader>
          <ModalBody>
            <Alert variant="warning">
              <IconifyIcon icon="ri:alert-line" className="me-2" />
              Are you sure you want to delete <strong>{communityToDelete?.name}</strong>? 
              This action cannot be undone.
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteConfirm}
              disabled={deleteCommunityMutation.isPending}
            >
              {deleteCommunityMutation.isPending ? (
                <>
                  <IconifyIcon icon="ri:loader-4-line" className="me-1 spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </Col>
    </Row>
  );
};

export default CommunitiesList;
