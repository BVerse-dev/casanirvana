"use client";

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useListAgenciesDirectory, useDeleteAgencyDirectory } from '@/hooks/useAgencyDirectory'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { getAgencyPropertyImage } from '@/utils/avatarMapper'

// Import individual components directly
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface AgencyListProps {
  searchTerm?: string;
}

const AgencyList = ({ searchTerm: externalSearchTerm }: AgencyListProps) => {
  const { data: agenciesData = [], isLoading } = useListAgenciesDirectory();
  const deleteAgency = useDeleteAgencyDirectory();
  const [currentPage, setCurrentPage] = useState(1);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const itemsPerPage = 8; // Show 8 agencies per page

  // Use external search term if provided, otherwise use internal
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  // Apply filters to agencies
  const agencies = agenciesData.filter(agency => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      agency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && agency.is_active) ||
      (statusFilter === 'inactive' && !agency.is_active);

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(agencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgencies = agencies.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDeleteAgency = async (agencyId: string) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      try {
        await deleteAgency.mutateAsync(agencyId);
        // The list will automatically refresh due to React Query cache invalidation
      } catch (error) {
        console.error('Failed to delete agency:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading agencies...</div>;
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <Card.Header className="d-flex flex-wrap justify-content-between align-items-center border-bottom">
            <div>
              <Card.Title as={'h4'}>All Agency List</Card.Title>
            </div>
            <div className="d-flex gap-2 mt-2 mt-sm-0">
              <div className="position-relative" style={{ minWidth: '200px' }}>
                <input 
                  type="search" 
                  className="form-control" 
                  placeholder="Search agencies..."
                  value={searchTerm}
                  onChange={(e) => {
                    setInternalSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
                <IconifyIcon icon="solar:magnifer-broken" className="search-widget-icon" />
              </div>

              <Dropdown>
                <Dropdown.Toggle
                  as={'button'}
                  className="btn btn-sm btn-outline-primary rounded">
                  Status: {statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive'} <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => {
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }} active={statusFilter === 'all'}>All</Dropdown.Item>
                  <Dropdown.Item onClick={() => {
                    setStatusFilter('active');
                    setCurrentPage(1);
                  }} active={statusFilter === 'active'}>Active</Dropdown.Item>
                  <Dropdown.Item onClick={() => {
                    setStatusFilter('inactive');
                    setCurrentPage(1);
                  }} active={statusFilter === 'inactive'}>Inactive</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown>
                <Dropdown.Toggle
                  as={'a'}
                  className="btn btn-sm btn-outline-light rounded content-none icons-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  Export <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end">
                  <Dropdown.Item>Download CSV</Dropdown.Item>
                  <Dropdown.Item>Export PDF</Dropdown.Item>
                  <Dropdown.Item>Print</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Agency Photo & Name</th>
                    <th>Contact Info</th>
                    <th>Address</th>
                    <th>Communities</th>
                    <th>Date Created</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAgencies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        <div className="d-flex flex-column align-items-center">
                          <IconifyIcon icon="solar:file-searching-bold-duotone" className="fs-48 text-muted mb-2" />
                          <h5 className="text-muted">No agencies found</h5>
                          <p className="text-muted mb-0">
                            {searchTerm ? `No results match "${searchTerm}"` : statusFilter !== 'all' ? `No ${statusFilter} agencies found` : 'Try creating a new agency'}
                          </p>
                          {!searchTerm && statusFilter === 'all' && (
                            <Link href="/agency/add" className="btn btn-primary mt-3">
                              <IconifyIcon icon="ri:add-line" className="me-1" /> Add New Agency
                            </Link>
                          )}
                          {(searchTerm || statusFilter !== 'all') && (
                            <Button variant="outline-primary" className="mt-3" onClick={() => {
                              setInternalSearchTerm('');
                              setStatusFilter('all');
                            }}>
                              <IconifyIcon icon="solar:restart-bold-duotone" className="me-1" /> Clear Filters
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentAgencies.map((agency: any, idx: number) => {
                      // Get property image for agency using static import (same as details page)
                      const agencyImage = getAgencyPropertyImage(agency);
                      
                      return (
                        <tr key={agency.id || idx}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                <Image 
                                  src={agencyImage} 
                                  alt="agency" 
                                  width={50} 
                                  height={50} 
                                  className="avatar-md rounded border border-light border-3" 
                                />
                              </div>
                              <div>
                                <Link href={`/agency/details?id=${agency.id}`} className="text-dark fw-medium fs-15">
                                  {agency.name || 'Unnamed Agency'}
                                </Link>
                                <p className="text-muted mb-0 small">
                                  {agency.license_number || 'No license'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <p className="mb-1 fw-medium">{agency.phone || 'No phone'}</p>
                              <p className="text-muted mb-0 small">{agency.email || 'No email'}</p>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">
                              {agency.address ? (agency.address.length > 30 ? agency.address.substring(0, 30) + '...' : agency.address) : 'No address'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-medium">{agency.managed_societies || 0}</span>
                              <span className="text-muted small">Communities</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">
                              {agency.created_at ? new Date(agency.created_at).toLocaleDateString() : 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${agency.is_active ? 'success' : 'danger'}-subtle text-${agency.is_active ? 'success' : 'danger'} py-1 px-2 fs-13`}>
                              {agency.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link href={`/agency/details?id=${agency.id}`}>
                                <Button variant="light" size="sm" title="View Details">
                                  <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                                </Button>
                              </Link>
                              <Link href={`/agency/manage?tab=profiles&agencyId=${agency.id}`}>
                                <Button variant="soft-primary" size="sm" title="Manage Agency">
                                  <IconifyIcon icon="solar:settings-bold-duotone" className="align-middle fs-18" />
                                </Button>
                              </Link>
                              <Button 
                                variant="soft-danger" 
                                size="sm" 
                                title="Delete Agency"
                                onClick={() => handleDeleteAgency(agency.id)}
                              >
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Card.Footer>
              <nav aria-label="Agency pagination">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </Card.Footer>
          )}
        </Card>
      </Col>
    </Row>
  )
}

export default AgencyList
