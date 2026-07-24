'use client'

import { useEffect, useMemo, useState } from 'react'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Badge, Card, CardBody, Col, Form, Row } from 'react-bootstrap'
import VisitorData from './components/VisitorData'
import { useListVisitorPasses } from '@/hooks/useVisitorPasses'
import {
  normalizeVisitorSearch,
  VISITOR_STATUS_OPTIONS,
  VISITOR_TYPE_OPTIONS,
} from '../components/visitorDisplay'

const PAGE_SIZE = 9

const VisitorsGridPage = () => {
  const { data: visitors = [], isLoading, error } = useListVisitorPasses()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [communityFilter, setCommunityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const communityOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        visitors
          .map((visitor) => visitor.community_name?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b))

    return ['all', ...values]
  }, [visitors])

  const filteredVisitors = useMemo(() => {
    return visitors.filter((visitor) => {
      const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter
      const matchesType = typeFilter === 'all' || visitor.visitor_type === typeFilter
      const matchesCommunity = communityFilter === 'all' || visitor.community_name === communityFilter

      const searchable = [
        visitor.visitor_name,
        visitor.visitor_phone,
        visitor.community_name,
        visitor.unit_label,
        visitor.created_by_display,
        visitor.agency_name,
        visitor.entry_code,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const normalizedSearch = normalizeVisitorSearch(searchTerm)
      const matchesSearch = normalizedSearch.length === 0 || searchable.includes(normalizedSearch)
      return matchesStatus && matchesType && matchesCommunity && matchesSearch
    })
  }, [visitors, searchTerm, statusFilter, typeFilter, communityFilter])

  const totalPages = Math.max(1, Math.ceil(filteredVisitors.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter, communityFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedVisitors = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredVisitors.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredVisitors, currentPage])

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const start = Math.max(1, currentPage - 1)
    const end = Math.min(totalPages, start + 2)
    const normalizedStart = Math.max(1, end - 2)
    return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index)
  }, [currentPage, totalPages])

  const hasActiveFilters = Boolean(
    normalizeVisitorSearch(searchTerm) || statusFilter !== 'all' || typeFilter !== 'all' || communityFilter !== 'all'
  )

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Visitors Grid" />
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
              <Row className="g-3 align-items-end">
                <Col xl={4} lg={6}>
                  <Form.Label className="mb-1">Search</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="search"
                      placeholder="Visitor, phone, community, unit, entry code"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                    <IconifyIcon
                      icon="solar:magnifer-broken"
                      className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                    />
                  </div>
                </Col>
                <Col xl={2} lg={6}>
                  <Form.Label className="mb-1">Status</Form.Label>
                  <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    {VISITOR_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xl={2} lg={6}>
                  <Form.Label className="mb-1">Type</Form.Label>
                  <Form.Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                    {VISITOR_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xl={2} lg={6}>
                  <Form.Label className="mb-1">Community</Form.Label>
                  <Form.Select value={communityFilter} onChange={(event) => setCommunityFilter(event.target.value)}>
                    {communityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All Communities' : option}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xl={2} lg={12}>
                  <div className="d-flex flex-wrap gap-2 justify-content-xl-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={!hasActiveFilters}
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setTypeFilter('all')
                        setCommunityFilter('all')
                      }}
                    >
                      Clear
                    </button>
                    <Link
                      href="/visitors?view=list"
                      className="btn btn-outline-primary"
                      aria-label="Show visitors as a list"
                      title="List view"
                    >
                      <IconifyIcon icon="ri:list-check-2" />
                      <span className="visually-hidden">List View</span>
                    </Link>
                    <Link href="/visitors/add" className="btn btn-success">
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      New Pass
                    </Link>
                  </div>
                </Col>
              </Row>

              <div className="d-flex flex-wrap gap-2 mt-3">
                <Badge bg="light" text="dark">
                  Total: {visitors.length}
                </Badge>
                <Badge bg="light" text="dark">
                  Filtered: {filteredVisitors.length}
                </Badge>
                {isLoading && <Badge bg="info">Loading...</Badge>}
                {error && <Badge bg="danger">Load Error</Badge>}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <div className="mt-2">
        <VisitorData visitors={paginatedVisitors} isLoading={isLoading} error={error} />
      </div>

      <div className="mt-3 p-3 border-top">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <p className="mb-0 text-muted fs-13">
            Showing page {currentPage} of {totalPages}
          </p>
          <nav aria-label="Visitors grid pagination">
            <ul className="pagination justify-content-end mb-0">
              <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
              </li>
              {pageNumbers.map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button type="button" className="page-link" onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default VisitorsGridPage
