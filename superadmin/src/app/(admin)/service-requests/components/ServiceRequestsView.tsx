"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListServiceRequests } from "@/hooks/useServiceRequests";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";
import ServiceRequestsStats from "./ServiceRequestsStats";
import ServiceRequestsTable from "./ServiceRequestsTable";

const ServiceRequestsView = () => {
  const { data: serviceRequests = [], isLoading, isError } = useListServiceRequests();
  const queryClient = useQueryClient();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter data based on status
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return serviceRequests;
    return serviceRequests.filter(request => request.status === statusFilter);
  }, [serviceRequests, statusFilter]);

  // Pagination calculations
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentData = filteredData.slice(startIndex, endIndex) as any[];

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, entriesPerPage]);

  // Real-time subscription for service requests updates
  useEffect(() => {
    const channel = supabase
      .channel('public:service_requests')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'service_requests' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['service_requests'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading service requests...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error loading service requests</h4>
        <p>There was an error loading the service requests. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <>
      <ServiceRequestsStats serviceRequests={filteredData} />
      
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={"h4"}>All Service Requests</CardTitle>
              </div>
              <div className="d-flex gap-2">
                <Dropdown>
                  <DropdownToggle
                    as={"a"}
                    className="btn btn-sm btn-outline-primary"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <IconifyIcon icon="solar:filter-broken" className="me-1" />
                    Filter by Status
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => setStatusFilter('all')}>All Requests</DropdownItem>
                    <DropdownItem onClick={() => setStatusFilter('pending')}>Pending</DropdownItem>
                    <DropdownItem onClick={() => setStatusFilter('in_progress')}>In Progress</DropdownItem>
                    <DropdownItem onClick={() => setStatusFilter('completed')}>Completed</DropdownItem>
                    <DropdownItem onClick={() => setStatusFilter('cancelled')}>Cancelled</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Link href="/services" className="btn btn-sm btn-primary">
                  <IconifyIcon icon="ri:settings-3-line" className="me-1" />
                  Manage Services
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <ServiceRequestsTable serviceRequests={currentData} />
            </CardBody>
            <CardFooter className="border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-muted">
                    {totalEntries === 0
                      ? "Showing 0 of 0 service requests"
                      : `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} service requests`}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">Show:</span>
                    <Dropdown>
                      <DropdownToggle
                        as={"a"}
                        className="btn btn-sm btn-outline-secondary"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ minWidth: '80px' }}
                      >
                        {entriesPerPage} entries
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem onClick={() => setEntriesPerPage(5)}>5 entries</DropdownItem>
                        <DropdownItem onClick={() => setEntriesPerPage(10)}>10 entries</DropdownItem>
                        <DropdownItem onClick={() => setEntriesPerPage(15)}>15 entries</DropdownItem>
                        <DropdownItem onClick={() => setEntriesPerPage(20)}>20 entries</DropdownItem>
                        <DropdownItem onClick={() => setEntriesPerPage(50)}>50 entries</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                
                {totalPages > 1 && (
                  <nav aria-label="Service requests pagination">
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <a 
                          className="page-link d-flex align-items-center" 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          title="Previous page"
                        >
                          <IconifyIcon icon="solar:arrow-left-linear" className="me-1" />
                          Previous
                        </a>
                      </li>
                      
                      {/* Show first page if we're not on first few pages */}
                      {currentPage > 3 && (
                        <>
                          <li className="page-item">
                            <a 
                              className="page-link" 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(1);
                              }}
                            >
                              1
                            </a>
                          </li>
                          {currentPage > 4 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                        </>
                      )}
                      
                      {/* Show page numbers around current page */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(pageNum => {
                          return pageNum >= Math.max(1, currentPage - 2) && 
                                 pageNum <= Math.min(totalPages, currentPage + 2);
                        })
                        .map((pageNum) => (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <a 
                              className="page-link" 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                            >
                              {pageNum}
                            </a>
                          </li>
                        ))}
                      
                      {/* Show last page if we're not on last few pages */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                          <li className="page-item">
                            <a 
                              className="page-link" 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(totalPages);
                              }}
                            >
                              {totalPages}
                            </a>
                          </li>
                        </>
                      )}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <a 
                          className="page-link d-flex align-items-center" 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          title="Next page"
                        >
                          Next
                          <IconifyIcon icon="solar:arrow-right-linear" className="ms-1" />
                        </a>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ServiceRequestsView;
