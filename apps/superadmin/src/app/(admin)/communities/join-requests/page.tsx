'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardHeader, Col, Row } from 'react-bootstrap'
import JoinRequestsList from './components/JoinRequestsList'
import { useListJoinRequests } from '@/hooks/useJoinRequests'
import { useState } from 'react'

const JoinRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'pending_manual_review'>('all')
  
  const { data: joinRequests = [], isLoading, error } = useListJoinRequests()

  // Filter join requests based on search term and status
  const filteredRequests = joinRequests.filter(request => {
    const communityDisplayName = (request.community_name || '').toLowerCase()
    const unitDisplay = (request.is_manual_entry ? request.manual_unit_info : request.unit_number) || ''
    const matchesSearch = 
      request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone?.includes(searchTerm) ||
      communityDisplayName.includes(searchTerm.toLowerCase()) ||
      unitDisplay.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: 'all' | 'pending' | 'approved' | 'rejected' | 'pending_manual_review') => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const pendingCount = joinRequests.filter(r => r.status === 'pending').length
  const manualReviewCount = joinRequests.filter(r => r.status === 'pending_manual_review').length
  const approvedCount = joinRequests.filter(r => r.status === 'approved').length
  const rejectedCount = joinRequests.filter(r => r.status === 'rejected').length

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Join Requests" />
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
                            placeholder="Search join requests..." 
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
                            {filteredRequests.length} <span className="text-muted">
                              {searchTerm || statusFilter !== 'all' ? 'Found' : 'Requests'}
                            </span>
                            {(searchTerm || statusFilter !== 'all') && (
                              <small className="text-muted ms-2">
                                (of {joinRequests.length} total)
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
                      {showFilters && <span className="badge bg-primary ms-1">Active</span>}
                    </button>
                    {pendingCount > 0 && (
                      <span className="badge bg-warning fs-12 me-2">
                        {pendingCount} Pending
                      </span>
                    )}
                    {manualReviewCount > 0 && (
                      <span className="badge bg-info fs-12 me-2">
                        {manualReviewCount} Manual Review
                      </span>
                    )}
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
                        All Requests ({joinRequests.length})
                      </button>
                      <button 
                        className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => handleStatusFilter('pending')}
                      >
                        Pending ({pendingCount})
                      </button>
                      <button 
                        className={`btn btn-sm ${statusFilter === 'pending_manual_review' ? 'btn-info' : 'btn-outline-info'}`}
                        onClick={() => handleStatusFilter('pending_manual_review')}
                      >
                        Manual Review ({manualReviewCount})
                      </button>
                      <button 
                        className={`btn btn-sm ${statusFilter === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => handleStatusFilter('approved')}
                      >
                        Approved ({approvedCount})
                      </button>
                      <button 
                        className={`btn btn-sm ${statusFilter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => handleStatusFilter('rejected')}
                      >
                        Rejected ({rejectedCount})
                      </button>
                    </div>
                  </Col>
                </Row>
              )}
            </CardHeader>
          </Card>
        </Col>
      </Row>
      <JoinRequestsList 
        joinRequests={filteredRequests}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />
    </>
  )
}

export default JoinRequestsPage
