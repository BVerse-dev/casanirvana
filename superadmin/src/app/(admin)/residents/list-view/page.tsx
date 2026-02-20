'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardHeader, Col, Row } from 'react-bootstrap'
import ResidentsList from './components/ResidentsList'
import { useListResidents } from '@/hooks/useResidents'
import { useState } from 'react'
import Link from 'next/link'

const ListViewPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  const { data: residents = [], isLoading, error } = useListResidents()

  // Filter residents based on search term
  const filteredResidents = residents.filter(resident =>
    resident.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.phone?.includes(searchTerm) ||
    resident.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.societies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Residents List" />
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="border-0">
              <Row className="justify-content-between">
                <Col lg={6}>
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <form className="app-search d-none d-md-block me-auto">
                        <div className="position-relative">
                          <input 
                            type="search" 
                            className="form-control" 
                            placeholder="Search residents..." 
                            autoComplete="off"
                            value={searchTerm}
                            onChange={handleSearch}
                          />
                          <IconifyIcon icon="solar:magnifer-broken" className="search-widget-icon" />
                          {searchTerm && (
                            <button
                              type="button"
                              className="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y me-4"
                              onClick={handleClearSearch}
                            >
                              <IconifyIcon icon="solar:close-circle-broken" className="fs-16" />
                            </button>
                          )}
                        </div>
                      </form>
                    </Col>
                    <Col lg={4}>
                      <h5 className="text-dark fw-medium mb-0">
                        {isLoading ? (
                          <span className="placeholder-glow">
                            <span className="placeholder col-3"></span>
                          </span>
                        ) : (
                          <>
                            {filteredResidents.length} <span className="text-muted">
                              {searchTerm ? 'Found' : 'Residents'}
                            </span>
                            {searchTerm && (
                              <small className="text-muted ms-2">
                                (of {residents.length} total)
                              </small>
                            )}
                          </>
                        )}
                      </h5>
                    </Col>
                  </Row>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary me-2"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <IconifyIcon icon="ri:filter-line" className="me-1" /> 
                      Filters
                      {showFilters && <span className="badge bg-primary ms-1">1</span>}
                    </button>
                    <Link href="/residents/add" className="btn btn-success me-1">
                      <IconifyIcon icon="ri:add-line" /> New Resident
                    </Link>
                  </div>
                </Col>
              </Row>
              {showFilters && (
                <Row className="mt-3 pt-3 border-top">
                  <Col lg={12}>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="text-muted">Quick Filters:</span>
                      <button 
                        className={`btn btn-sm ${searchTerm === '' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSearchTerm('')}
                      >
                        All Residents
                      </button>
                      <button 
                        className={`btn btn-sm ${searchTerm === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setSearchTerm('active')}
                      >
                        Active Only
                      </button>
                      <button 
                        className={`btn btn-sm ${searchTerm === 'inactive' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setSearchTerm('inactive')}
                      >
                        Inactive Only
                      </button>
                    </div>
                  </Col>
                </Row>
              )}
            </CardHeader>
          </Card>
        </Col>
      </Row>
      <ResidentsList 
        residents={filteredResidents}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        searchTerm={searchTerm}
      />
    </>
  )
}

export default ListViewPage
