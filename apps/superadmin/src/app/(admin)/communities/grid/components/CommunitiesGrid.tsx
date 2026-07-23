"use client";

import { useState, useMemo } from "react";
import { Button, Card, CardBody, CardFooter, Col, Row, Form, InputGroup, Pagination } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  useListCommunities,
  useDeleteCommunity,
  type CommunityRecord,
} from "@/hooks/useCommunities";
import { mapPropertyUrl, mapSocietyToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import type { CommunityFilters } from "./CommunitiesFilter";

type Community = CommunityRecord;

interface CommunitiesGridProps {
  filters: CommunityFilters;
  viewMode: "grid" | "list";
  onViewModeChange: (view: "grid" | "list") => void;
}

const CommunityCard = ({ 
  community, 
  onDelete,
  unitCount = 0,
  occupancyRate = 0
}: { 
  community: Community; 
  onDelete: (id: string) => void;
  unitCount?: number;
  occupancyRate?: number;
}) => {
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      onDelete(id);
    }
  };

  // Get property image - try image_url field first, then fallback to name mapping
  const propertyImageUrl = mapPropertyUrl((community as any).image_url) || mapSocietyToPropertyImage(community.name);

  return (
    <Card className="overflow-hidden h-100">
      <div className="position-relative">
        <Image 
          src={propertyImageUrl} 
          alt={community.name}
          className="card-img-top"
          style={{ height: "200px", objectFit: "cover" }}
          width={400}
          height={200}
        />
        <div className="position-absolute top-0 end-0 m-3">
          <span className={`badge bg-${community.status === "inactive" ? "secondary" : "success"}`}>
            {community.status ? community.status.replace(/_/g, " ") : "unknown"}
          </span>
        </div>
      </div>
      
      <CardBody>
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="flex-grow-1">
            <h5 className="card-title mb-1">
              <Link href={`/communities/${community.id}`} className="text-decoration-none">
                {community.name}
              </Link>
            </h5>
            <p className="text-muted small mb-1">
              <IconifyIcon icon="ri:map-pin-line" className="me-1" />
              {community.address || 'No address'}
            </p>
            {/* Show agency information */}
            {(community as any).agencies && (
              <p className="text-muted small mb-2">
                <IconifyIcon icon="ri:building-2-line" className="me-1" />
                Managed by {(community as any).agencies.name}
              </p>
            )}
          </div>
        </div>

        <div className="row g-2 text-center mt-3">
          <div className="col-6">
            <div className="border rounded p-2">
              <div className="h6 mb-0 text-primary">
                {unitCount > 0 ? unitCount : '--'}
              </div>
              <small className="text-muted">Units</small>
            </div>
          </div>
          <div className="col-6">
            <div className="border rounded p-2">
              <div className="h6 mb-0 text-success">
                {unitCount > 0 ? `${occupancyRate}%` : "--"}
              </div>
              <small className="text-muted">Occupancy</small>
            </div>
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="bg-transparent">
        <div className="d-flex gap-2">
          <Link href={`/communities/${community.id}`} className="btn btn-outline-primary btn-sm flex-fill">
            <IconifyIcon icon="ri:eye-line" className="me-1" />
            View
          </Link>
          <Link href={`/communities/${community.id}/edit`} className="btn btn-outline-secondary btn-sm flex-fill">
            <IconifyIcon icon="ri:edit-line" className="me-1" />
            Edit
          </Link>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => handleDelete(community.id, community.name)}
          >
            <IconifyIcon icon="ri:delete-bin-line" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const CommunitiesGrid = ({ filters, viewMode, onViewModeChange }: CommunitiesGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Show 9 communities per page
  
  const { 
    data: communitiesData = { data: [], count: 0, page: 1, pageSize: 1000, totalPages: 1 },
    isLoading, 
    error 
  } = useListCommunities({ 
    page: 1,
    pageSize: 1000,
    filters,
    search: searchTerm,
  });
  
  const { data: communities = [], count: totalCount = 0, totalPages } = communitiesData;

  const deleteCommunityMutation = useDeleteCommunity();

  // Loading state
  if (isLoading) {
    return (
      <Col xl={9}>
        <Card>
          <CardBody className="text-center py-5">
            <div className="d-flex flex-column align-items-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div>Loading communities...</div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  // Error state
  if (error) {
    return (
      <Col xl={9}>
        <Card>
          <CardBody className="text-center py-5">
            <div className="text-danger">Error loading communities</div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  const filteredCommunities = communities;
  const localTotalPages = Math.ceil((filteredCommunities.length || 0) / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCommunities = filteredCommunities.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCommunityMutation.mutateAsync(id);
      toast.success("Community deleted successfully");
    } catch (error) {
      toast.error("Failed to delete community");
      console.error("Delete error:", error);
    }
  };

  const totalItems = filteredCommunities.length || totalCount;

  return (
    <Col xl={9}>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-0">All Communities</h5>
              {/* Show active filters */}
              {(filters.location || filters.status || filters.communityType) && (
                <div className="mt-2">
                  <small className="text-muted">Active filters: </small>
                  {filters.location && <span className="badge bg-light text-dark me-1">Location: {filters.location}</span>}
                  {filters.status && <span className="badge bg-light text-dark me-1">Status: {filters.status}</span>}
                  {filters.communityType && <span className="badge bg-light text-dark me-1">Type: {filters.communityType}</span>}
                </div>
              )}
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <InputGroup style={{ width: "250px" }}>
                <Form.Control
                  type="text"
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="ri:search-line" />
                </Button>
              </InputGroup>
              
              <div className="btn-group" role="group">
                <Button
                  variant={viewMode === "grid" ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                >
                  <IconifyIcon icon="ri:grid-line" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                >
                  <IconifyIcon icon="ri:list-check" />
                </Button>
              </div>
              
              <Link href="/communities/add" className="btn btn-primary btn-sm">
                <IconifyIcon icon="ri:add-line" className="me-1" />
                Add Community
              </Link>
            </div>
          </div>

          {/* Communities Grid */}
          {(searchTerm && filteredCommunities.length === 0) ? (
            <div className="text-center py-5">
              <IconifyIcon icon="ri:building-line" className="fs-48 text-muted mb-3" />
              <h5 className="text-muted">No communities found</h5>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <Row>
                {currentCommunities.map((community) => (
                  <Col
                    xl={viewMode === "grid" ? 4 : 12}
                    lg={viewMode === "grid" ? 6 : 12}
                    key={community.id}
                    className="mb-4"
                  >
                    <CommunityCard 
                      community={community} 
                      onDelete={handleDelete}
                      unitCount={community.unit_count || 0}
                      occupancyRate={community.occupancy_rate || 0}
                    />
                  </Col>
                ))}
              </Row>

              {/* Pagination - always show controls */}
              <div className="d-flex align-items-center justify-content-between mt-4">
                <div>
                  <p className="text-muted mb-0">
                    {totalItems > 0 ? (
                      <>Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} communities</>
                    ) : (
                      <>No communities found</>
                    )}
                    {searchTerm && totalItems > 0 && ` (filtered from ${totalCount} total)`}
                  </p>
                </div>
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
                    {[...Array(localTotalPages)].map((_, index) => {
                      const page = index + 1;
                      const showPage = true; // Always show all page numbers
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
                    <li className={`page-item ${currentPage === localTotalPages ? 'disabled' : ''}`}>
                      <a 
                        className="page-link" 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(Math.min(localTotalPages, currentPage + 1));
                        }}
                      >
                        Next
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default CommunitiesGrid;
