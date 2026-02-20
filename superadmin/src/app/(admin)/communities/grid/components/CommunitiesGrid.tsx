"use client";

import { useState, useMemo } from "react";
import { Button, Card, CardBody, CardFooter, Col, Row, Form, InputGroup, Pagination } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useListCommunities, useDeleteCommunity } from "@/hooks/useCommunities";
import { useListUnits } from "@/hooks/useUnits";
import type { Database } from "@/lib/database.types";
import { mapPropertyUrl, mapSocietyToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import type { CommunityFilters } from "./CommunitiesFilter";

type Community = Database["public"]["Tables"]["societies"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];

type CommunityWithStats = Community & {
  unitCount: number;
  occupiedUnits: number;
  occupancyRate: number;
};

interface CommunitiesGridProps {
  filters: CommunityFilters;
}

const CommunityCard = ({ 
  community, 
  onDelete,
  unitCount = 0,
  occupiedUnits = 0,
  occupancyRate = 0
}: { 
  community: Community; 
  onDelete: (id: string) => void;
  unitCount?: number;
  occupiedUnits?: number;
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
          <span className="badge bg-success">Active</span>
        </div>
      </div>
      
      <CardBody>
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="flex-grow-1">
            <h5 className="card-title mb-1">
              <Link href={`/communities/details?id=${community.id}`} className="text-decoration-none">
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
                {unitCount > 0 ? 
                  `${Math.round(occupancyRate * 100)}%` : 
                  '--'}
              </div>
              <small className="text-muted">Occupancy</small>
            </div>
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="bg-transparent">
        <div className="d-flex gap-2">
          <Link href={`/communities/details?id=${community.id}`} className="btn btn-outline-primary btn-sm flex-fill">
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

const CommunitiesGrid = ({ filters }: CommunitiesGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Show 9 communities per page
  
  // Fetch communities data from Supabase with pagination and filters
  const { 
    data: communitiesData = { data: [], count: 0, page: 1, pageSize: itemsPerPage, totalPages: 1 }, 
    isLoading, 
    error 
  } = useListCommunities({ 
    page: currentPage, 
    pageSize: itemsPerPage,
    filters: filters // Pass filters to the hook
  });
  
  // Extract data from the paginated response
  const { data: communities = [], count: totalCount = 0, totalPages } = communitiesData;
  
  // Fetch ALL units data to calculate occupancy (use large page size to get all units)
  // Note: Using pageSize: 1000 to ensure we get all units for statistics calculation
  // Current DB has 316 units, so 1000 is more than sufficient
  const { data: allUnitsResponse, isLoading: unitsLoading } = useListUnits({ 
    pageSize: 1000 // Large enough to get all units for accurate statistics
  });
  const allUnits = allUnitsResponse?.data || [];
  
  // Calculate unit counts and occupancy rates for each community
  const communitiesWithStats = useMemo(() => {
    if (!communities || !allUnits) return [];
    
    return communities.map(community => {
      // Find units belonging to this community
      const communityUnits = allUnits.filter(unit => unit.community_id === community.id);
      const unitCount = communityUnits.length;
      
      // Count occupied units (units with status 'occupied' are considered occupied)
      const occupiedUnits = communityUnits.filter(unit => unit.status === 'occupied').length;
      
      // Calculate occupancy rate (prevent division by zero)
      const occupancyRate = unitCount > 0 ? occupiedUnits / unitCount : 0;
      
      return {
        ...community,
        unitCount,
        occupiedUnits,
        occupancyRate
      };
    });
  }, [communities, allUnits]);

  const deleteCommunityMutation = useDeleteCommunity();

  // Loading state
  if (isLoading || unitsLoading) {
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

  // Filter communities when search term is provided
  const filteredCommunities = searchTerm ? communitiesWithStats.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (community.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : communitiesWithStats;

  // Pagination calculations (always show controls)
  const localTotalPages = Math.ceil((searchTerm ? filteredCommunities.length : totalCount || 0) / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCommunities = searchTerm
    ? filteredCommunities.slice(startIndex, endIndex)
    : communitiesWithStats.slice(startIndex, endIndex);

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

  // Handle page change
  const handlePageChange = (page: number) => {
    window.scrollTo(0, 0); // Scroll to top on page change
    setCurrentPage(page);
  };

  // Calculate display counts for pagination text
  const totalItems = searchTerm ? filteredCommunities.length : (totalCount || 0);

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
                  onClick={() => setViewMode("grid")}
                >
                  <IconifyIcon icon="ri:grid-line" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setViewMode("list")}
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
                  <Col xl={4} lg={6} key={community.id} className="mb-4">
                    <CommunityCard 
                      community={community} 
                      onDelete={handleDelete}
                      unitCount={community.unitCount}
                      occupiedUnits={community.occupiedUnits}
                      occupancyRate={community.occupancyRate}
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
