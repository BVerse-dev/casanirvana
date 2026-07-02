'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Card, CardHeader, Col, Row } from 'react-bootstrap'
import ResidentData from './Components/ResidentData'
import ResidentGridCard from './Components/ResidentGridCard'
import { useListResidents } from '@/hooks/useResidents'
import { useState } from 'react'

const GridViewPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  
  const { data: residentResponse, isLoading, error } = useListResidents({ pageSize: 200 })
  const residents = residentResponse?.data || []

  // Filter residents based on search term and status
  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.phone?.includes(searchTerm) ||
      resident.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.societies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && resident.is_active) ||
      (statusFilter === 'inactive' && !resident.is_active)
    
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const ITEMS_PER_PAGE = 9 // 3x3 grid
  const totalPages = Math.ceil(filteredResidents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentResidents = filteredResidents.slice(startIndex, endIndex)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Residents Grid" />
      <ResidentGridCard residents={residents} />
      <Row>
        <Col lg={12}>
          <Card className="bg-body shadow-none">
            <CardHeader className="border-0">
              <Row className="justify-content-between align-items-center">
                <Col lg={6}>
                  <div className="d-flex align-items-center gap-3">
                    <p className="mb-0 text-muted">
                      {filteredResidents.length > 0 ? (
                        <>
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredResidents.length)} of{' '}
                          <span className="text-dark fw-semibold">{filteredResidents.length}</span> Residents
                        </>
                      ) : (
                        <>
                          Showing <span className="text-dark fw-semibold">0</span> Residents
                        </>
                      )}
                      {searchTerm && (
                        <span className="text-muted ms-2">
                          (filtered from {residents.length} total)
                        </span>
                      )}
                    </p>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      <div className="position-relative">
                        <input
                          type="search"
                          className="form-control form-control-sm"
                          placeholder="Search residents..."
                          value={searchTerm}
                          onChange={handleSearch}
                          style={{ width: '200px' }}
                        />
                        <IconifyIcon 
                          icon="solar:magnifer-broken" 
                          className="position-absolute top-50 end-0 translate-middle-y me-2"
                        />
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <IconifyIcon icon="ri:filter-line" className="me-1" /> 
                        Filters
                        {statusFilter !== 'all' && <span className="badge bg-primary ms-1">1</span>}
                      </button>
                      <Link href="/residents/add" className="btn btn-success btn-sm">
                        <IconifyIcon icon="ri-add-line" /> New Resident
                      </Link>
                    </div>
                  </div>
                </Col>
              </Row>
              {showFilters && (
                <Row className="mt-3 pt-3 border-top">
                  <Col lg={12}>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <span className="text-muted">Status Filter:</span>
                      <button 
                        className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleStatusFilter('all')}
                      >
                        All Residents
                      </button>
                      <button 
                        className={`btn btn-sm ${statusFilter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => handleStatusFilter('active')}
                      >
                        Active Only
                      </button>
                      <button 
                        className={`btn btn-sm ${statusFilter === 'inactive' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => handleStatusFilter('inactive')}
                      >
                        Inactive Only
                      </button>
                      {(searchTerm || statusFilter !== 'all') && (
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setCurrentPage(1)
                          }}
                        >
                          <IconifyIcon icon="solar:refresh-broken" className="me-1" />
                          Clear All
                        </button>
                      )}
                    </div>
                  </Col>
                </Row>
              )}
            </CardHeader>
          </Card>
        </Col>
      </Row>
      <ResidentData 
        residents={currentResidents}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        totalCount={filteredResidents.length}
      />
      {totalPages > 1 && (
        <div className="p-3 border-top">
          <nav aria-label="Residents pagination">
            <ul className="pagination justify-content-center mb-0">
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
        </div>
      )}
    </>
  )
}

export default GridViewPage
