'use client'

import { useEffect, useMemo, useState } from 'react'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Badge, Card, CardBody, Col, Form, Row } from 'react-bootstrap'
import VisitorsList from './components/VisitorsList'
import { useListVisitorPasses } from '@/hooks/useVisitorPasses'
import {
  normalizeVisitorSearch,
  VISITOR_STATUS_OPTIONS,
  VISITOR_TYPE_OPTIONS,
} from '../components/visitorDisplay'

const PAGE_SIZE = 12

const VisitorsListPage = () => {
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

  const hasActiveFilters = Boolean(
    normalizeVisitorSearch(searchTerm) || statusFilter !== 'all' || typeFilter !== 'all' || communityFilter !== 'all'
  )

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Visitors List" />
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
                      autoComplete="off"
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
                  <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
                    {VISITOR_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xl={2} lg={6}>
                  <Form.Label className="mb-1">Type</Form.Label>
                  <Form.Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by type">
                    {VISITOR_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xl={2} lg={6}>
                  <Form.Label className="mb-1">Community</Form.Label>
                  <Form.Select
                    value={communityFilter}
                    onChange={(event) => setCommunityFilter(event.target.value)}
                    aria-label="Filter by community"
                  >
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
                    <Link href="/visitors/grid-view" className="btn btn-outline-primary">
                      Grid View
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
      <VisitorsList
        visitors={paginatedVisitors}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        filteredCount={filteredVisitors.length}
        onPageChange={setCurrentPage}
      />
    </>
  )
}

export default VisitorsListPage
