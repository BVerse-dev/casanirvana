"use client";

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Dropdown, Row } from 'react-bootstrap'

import type { AgencyDirectoryItem } from '@/hooks/useAgencyDirectory'
import { useDeleteAgencyDirectory } from '@/hooks/useAgencyDirectory'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAgencyPropertyImage } from '@/utils/avatarMapper'

interface AgencyListProps {
  agencies: AgencyDirectoryItem[]
  isLoading: boolean
  error: Error | null
  searchTerm: string
  onRefresh: () => void
}

const AgencyList = ({ agencies, isLoading, error, searchTerm, onRefresh }: AgencyListProps) => {
  const deleteAgency = useDeleteAgencyDirectory()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const itemsPerPage = 8

  const filteredAgencies = useMemo(
    () =>
      agencies.filter((agency) => {
        const normalizedSearch = searchTerm.trim().toLowerCase()
        const matchesSearch =
          normalizedSearch.length === 0 ||
          agency.name?.toLowerCase().includes(normalizedSearch) ||
          agency.address?.toLowerCase().includes(normalizedSearch) ||
          agency.email?.toLowerCase().includes(normalizedSearch)

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && agency.is_active) ||
          (statusFilter === 'inactive' && !agency.is_active)

        return matchesSearch && matchesStatus
      }),
    [agencies, searchTerm, statusFilter]
  )

  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAgencies = filteredAgencies.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleDeleteAgency = async (agencyId: string) => {
    if (!window.confirm('Are you sure you want to delete this agency?')) return
    try {
      await deleteAgency.mutateAsync(agencyId)
    } catch (deleteError) {
      console.error('Failed to delete agency:', deleteError)
    }
  }

  const handleStatusFilterChange = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleExportCsv = () => {
    const csvContent = [
      ['Agency', 'Email', 'Phone', 'Address', 'Communities', 'Status', 'Created'],
      ...filteredAgencies.map((agency) => [
        agency.name || 'Unnamed Agency',
        agency.email || 'No email',
        agency.phone || 'No phone',
        agency.address || 'No address',
        String(agency.managed_societies || 0),
        agency.is_active ? 'Active' : 'Inactive',
        agency.created_at ? new Date(agency.created_at).toLocaleDateString() : 'Unknown',
      ]),
    ]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `agencies_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body className="text-center py-5">Loading agencies...</Card.Body>
          </Card>
        </Col>
      </Row>
    )
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="text-danger">
                <h5>Error loading agencies</h5>
                <p className="mb-0">{error.message}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <Row>
      <Col xl={12}>
        <Card id="agency-list-filters">
          <Card.Header className="d-flex flex-wrap justify-content-between align-items-center border-bottom">
            <div>
              <Card.Title as={'h4'}>Agency Directory</Card.Title>
              <small className="text-muted">
                Showing {filteredAgencies.length} of {agencies.length} agencies
              </small>
            </div>
            <div className="d-flex gap-2 mt-2 mt-sm-0">
              <Dropdown>
                <Dropdown.Toggle as={'button'} className="btn btn-sm btn-outline-primary rounded">
                  Status: {statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive'}
                  <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item active={statusFilter === 'all'} onClick={() => handleStatusFilterChange('all')}>
                    All
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={statusFilter === 'active'}
                    onClick={() => handleStatusFilterChange('active')}
                  >
                    Active
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={statusFilter === 'inactive'}
                    onClick={() => handleStatusFilterChange('inactive')}
                  >
                    Inactive
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown>
                <Dropdown.Toggle
                  as={'a'}
                  className="btn btn-sm btn-outline-light rounded content-none icons-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Actions <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end">
                  <Dropdown.Item onClick={handleExportCsv}>Download CSV</Dropdown.Item>
                  <Dropdown.Item onClick={handlePrint}>Print</Dropdown.Item>
                  <Dropdown.Item onClick={onRefresh}>Refresh</Dropdown.Item>
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
                            {searchTerm
                              ? `No results match "${searchTerm}"`
                              : statusFilter !== 'all'
                                ? `No ${statusFilter} agencies found`
                                : 'Try creating a new agency'}
                          </p>
                          {!searchTerm && statusFilter === 'all' ? (
                            <Link href="/agency/add" className="btn btn-primary mt-3">
                              <IconifyIcon icon="ri:add-line" className="me-1" /> Add New Agency
                            </Link>
                          ) : (
                            <Button
                              variant="outline-primary"
                              className="mt-3"
                              onClick={() => handleStatusFilterChange('all')}
                            >
                              <IconifyIcon icon="solar:restart-bold-duotone" className="me-1" /> Clear Status Filter
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentAgencies.map((agency) => {
                      const agencyImage = getAgencyPropertyImage(agency)

                      return (
                        <tr key={agency.id}>
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
                              {agency.address
                                ? agency.address.length > 30
                                  ? `${agency.address.substring(0, 30)}...`
                                  : agency.address
                                : 'No address'}
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
                            <span
                              className={`badge bg-${agency.is_active ? 'success' : 'danger'}-subtle text-${agency.is_active ? 'success' : 'danger'} py-1 px-2 fs-13`}
                            >
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
                                <IconifyIcon
                                  icon="solar:trash-bin-minimalistic-2-broken"
                                  className="align-middle fs-18"
                                />
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

          {filteredAgencies.length > itemsPerPage && (
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
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(page)}>
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
