'use client'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardHeader, Col, Row } from 'react-bootstrap'
import GuardsList from './components/GuardsList'
import Link from 'next/link'
import { useListGuardsDirectory } from '@/hooks/useGuardDirectory'
import { useState } from 'react'

const ListViewPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data: guards = [], isLoading, error } = useListGuardsDirectory()
  
  // Filter guards based on search and status
  const filteredGuards = guards.filter(guard => {
    const matchesSearch = !searchTerm || 
      guard.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.phone?.includes(searchTerm) ||
      guard.societies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && guard.is_active) ||
      (statusFilter === 'inactive' && !guard.is_active)
    
    return matchesSearch && matchesStatus
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setStatusFilter(filter)
    setCurrentPage(1)
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Guards List" />
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
                            placeholder="Search guards..." 
                            autoComplete="off"
                            value={searchTerm}
                            onChange={handleSearchChange}
                          />
                          <IconifyIcon icon="solar:magnifer-broken" className="search-widget-icon" />
                          {searchTerm && (
                            <button
                              type="button"
                              className="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y me-4"
                              onClick={handleClearSearch}
                            >
                              <IconifyIcon icon="ri:close-line" />
                            </button>
                          )}
                        </div>
                      </form>
                    </Col>
                    <Col lg={4}>
                      <h5 className="text-dark fw-medium mb-0">
                        {filteredGuards.length} <span className="text-muted">
                          {searchTerm || statusFilter !== 'all' ? 'filtered' : 'total'} Guards
                        </span>
                      </h5>
                      {(searchTerm || statusFilter !== 'all') && (
                        <small className="text-muted">
                          {guards.length} total guards
                        </small>
                      )}
                    </Col>
                  </Row>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <button type="button" className="btn btn-outline-primary me-2">
                      <IconifyIcon icon="ri:settings-2-line" className="me-1" />
                      More Setting
                    </button>
                    <button 
                      type="button" 
                      className={`btn btn-outline-primary me-2 ${showFilters ? 'active' : ''}`}
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <IconifyIcon icon="ri:filter-line" className="me-1" /> Filters
                    </button>
                    <Link href="/guards/add" className="btn btn-success me-1">
                      <IconifyIcon icon="ri:add-line" /> New Guard
                    </Link>
                  </div>
                </Col>
              </Row>
              
              {/* Quick Filters */}
              {showFilters && (
                <Row className="mt-3">
                  <Col lg={12}>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleFilterChange('all')}
                      >
                        All Guards ({guards.length})
                      </button>
                      <button
                        className={`btn btn-sm ${statusFilter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => handleFilterChange('active')}
                      >
                        Active ({guards.filter(g => g.is_active).length})
                      </button>
                      <button
                        className={`btn btn-sm ${statusFilter === 'inactive' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => handleFilterChange('inactive')}
                      >
                        Inactive ({guards.filter(g => !g.is_active).length})
                      </button>
                    </div>
                  </Col>
                </Row>
              )}
            </CardHeader>
          </Card>
        </Col>
      </Row>
      <GuardsList 
        guards={filteredGuards}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  )
}

export default ListViewPage
