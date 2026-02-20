'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useListServiceRequests } from '@/hooks/useServiceRequests'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Table } from 'react-bootstrap'

type ServiceRequestWithJoins = Database["public"]["Tables"]["service_requests"]["Row"] & {
  services?: Database["public"]["Tables"]["services"]["Row"];
  user_profile?: Database["public"]["Tables"]["profiles"]["Row"];
  units?: Database["public"]["Tables"]["units"]["Row"] & {
    communities?: Database["public"]["Tables"]["communities"]["Row"];
  };
};

const ServiceRequestsTable = () => {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('id')
  
  const { data: serviceRequests = [], isLoading } = useListServiceRequests(serviceId || '')
  const queryClient = useQueryClient()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
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

  // Real-time subscription for service requests updates for this specific service
  useEffect(() => {
    if (!serviceId) return;
    
    console.log('🔄 Setting up real-time subscription for service requests (service:', serviceId, ')');
    
    const channel = supabase
      .channel(`service_requests_${serviceId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'service_requests' 
      }, (payload) => {
        console.log('🔄 Service request change detected for service', serviceId, ':', payload);
        queryClient.invalidateQueries({ queryKey: ['service_requests', serviceId] });
      })
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up real-time subscription for service requests (service:', serviceId, ')');
      supabase.removeChannel(channel);
    };
  }, [serviceId, queryClient]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <div>Loading service requests...</div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="bg-light-subtle d-flex justify-content-between align-items-center">
        <div>
          <CardTitle as={'h5'} className="mb-0">Service Requests ({totalEntries})</CardTitle>
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
          <Button variant="primary" size="sm">
            <IconifyIcon icon="ri:add-line" className="me-1" />
            Add Request
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {totalEntries === 0 ? (
          <div className="text-center py-5">
            <IconifyIcon icon="solar:document-bold" className="fs-48 text-muted mb-3" />
            <h5 className="text-muted mb-2">No service requests found</h5>
            <p className="text-muted">
              {statusFilter === 'all' 
                ? 'Service requests will appear here when users make requests for this service.'
                : `No ${statusFilter.replace('_', ' ')} requests found for this service.`
              }
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="table-nowrap table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Request ID</th>
                  <th>User</th>
                  <th>Unit</th>
                  <th>Requested Date</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((request: any) => (
                  <tr key={request.id}>
                    <td>
                      <span className="text-primary fw-medium">#{String(request.id).slice(0, 8)}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center">
                          <IconifyIcon icon="solar:user-bold-duotone" className="text-primary" />
                        </div>
                        <div>
                          <div className="fw-medium">
                            {request.user_profile?.first_name} {request.user_profile?.last_name}
                          </div>
                          <small className="text-muted">{request.user_profile?.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">
                          Block {request.units?.block}, Unit {request.units?.number}
                        </div>
                        <small className="text-muted">{request.units?.communities?.name}</small>
                      </div>
                    </td>
                    <td>{formatDate(request.created_at)}</td>
                    <td>
                      {request.preferred_date ? formatDate(request.preferred_date) : (
                        <span className="text-muted">Not scheduled</span>
                      )}
                    </td>
                    <td>
                      <Badge bg={`${getStatusVariant(request.status || 'pending')}-subtle`} text={getStatusVariant(request.status || 'pending')} className="fs-12">
                        {(request.status || 'pending').charAt(0).toUpperCase() + (request.status || 'pending').slice(1)}
                      </Badge>
                    </td>
                    <td>
                      <span className="fw-medium">
                        {request.total_amount ? `$${request.total_amount}` : (
                          <span className="text-muted">Not quoted</span>
                        )}
                      </span>
                    </td>
                    <td>
                      <Dropdown>
                        <DropdownToggle
                          as={'a'}
                          className="btn btn-sm btn-outline-light rounded arrow-none fs-16"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <IconifyIcon icon="ri:more-2-fill" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem>
                            <IconifyIcon icon="solar:eye-broken" className="me-1" />
                            View Details
                          </DropdownItem>
                          <DropdownItem>
                            <IconifyIcon icon="solar:pen-bold-duotone" className="me-1" />
                            Edit Status
                          </DropdownItem>
                          <DropdownItem>
                            <IconifyIcon icon="solar:calendar-bold-duotone" className="me-1" />
                            Schedule
                          </DropdownItem>
                          <DropdownItem className="text-danger">
                            <IconifyIcon icon="solar:trash-bin-trash-bold-duotone" className="me-1" />
                            Delete
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
      {totalEntries > 0 && (
        <CardFooter className="border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="text-muted">
                Showing {startIndex + 1} to {endIndex} of {totalEntries} requests
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
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            
            {totalEntries > 0 && (
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
                      style={{ minWidth: '100px' }}
                    >
                      <IconifyIcon icon="solar:arrow-left-linear" className="me-1" />
                      Previous
                    </a>
                  </li>
                  
                  {/* Always show page numbers */}
                  {totalPages <= 5 ? (
                    // Show all pages if 5 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                    ))
                  ) : (
                    // For many pages, show with ellipsis
                    <>
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
                      style={{ minWidth: '80px' }}
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
      )}
    </Card>
  )
}

export default ServiceRequestsTable
