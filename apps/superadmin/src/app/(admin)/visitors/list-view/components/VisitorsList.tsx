'use client'

import { useMemo } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import { Badge, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import VisitorActionButtons from '../../components/VisitorActionButtons'
import { formatVisitorLabel, getVisitorStatusVariant } from '../../components/visitorDisplay'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VisitorsListProps {
  visitors: any[]
  isLoading: boolean
  error: unknown
  currentPage: number
  totalPages: number
  filteredCount: number
  onPageChange: (page: number) => void
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString()
}

const displayValue = (value?: string | null, fallback = 'N/A') => {
  if (!value) return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

const VisitorsList = ({
  visitors,
  isLoading,
  error,
  currentPage,
  totalPages,
  filteredCount,
  onPageChange,
}: VisitorsListProps) => {
  const router = useRouter()

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const start = Math.max(1, currentPage - 1)
    const end = Math.min(totalPages, start + 2)
    const normalizedStart = Math.max(1, end - 2)
    return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index)
  }, [currentPage, totalPages])

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div>Loading visitors...</div>
            </CardBody>
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
            <CardBody className="text-center py-5">
              <div className="text-danger">Error loading visitors</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
            <div>
              <CardTitle as="h4" className="mb-1">
                Visitor Pass Records
              </CardTitle>
              <p className="mb-0 text-muted fs-13">
                {filteredCount} result{filteredCount === 1 ? '' : 's'} · page {currentPage} of {totalPages}
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="table-responsive">
              <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Visitor</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Visit Date</th>
                    <th>Community</th>
                    <th>Unit</th>
                    <th>Created By</th>
                    <th>Agency</th>
                    <th>Status</th>
                    <th>Entry Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-4">
                        No visitors found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    visitors.map((visitor) => (
                      <tr
                        key={visitor.id}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={() => router.push(`/visitors/${visitor.id}?source=list-view`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            router.push(`/visitors/${visitor.id}?source=list-view`)
                          }
                        }}
                      >
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div>
                              {visitor.visitor_profile?.avatar_url ? (
                                <Image
                                  src={visitor.visitor_profile.avatar_url}
                                  alt="avatar"
                                  width={40}
                                  height={40}
                                  className="avatar-sm rounded-circle"
                                />
                              ) : (
                                <div className="avatar-sm rounded-circle bg-light-subtle d-flex align-items-center justify-content-center">
                                  <IconifyIcon icon="ri:user-line" className="fs-18" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/visitors/${visitor.id}?source=list-view`}
                                className="mb-0 text-dark fw-medium fs-15 d-inline-block"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {displayValue(visitor.visitor_name, 'No Name')}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td>{displayValue(visitor.visitor_phone)}</td>
                        <td>{formatVisitorLabel(visitor.visitor_type)}</td>
                        <td>{formatDate(visitor.visit_date || visitor.from_date)}</td>
                        <td>{displayValue(visitor.community_name)}</td>
                        <td>{displayValue(visitor.unit_label)}</td>
                        <td>{displayValue(visitor.created_by_display || visitor.host_profile?.full_name, 'Unknown')}</td>
                        <td>{displayValue(visitor.agency_name || visitor.agency_id, 'Not assigned')}</td>
                        <td>
                          <Badge bg={`${getVisitorStatusVariant(visitor.status)}-subtle`} text={getVisitorStatusVariant(visitor.status)}>
                            {formatVisitorLabel(visitor.status)}
                          </Badge>
                        </td>
                        <td>{displayValue(visitor.entry_code)}</td>
                        <td>
                          <VisitorActionButtons
                            visitor={{
                              id: visitor.id,
                              status: visitor.status,
                              checked_in_at: visitor.checked_in_at,
                              checked_out_at: visitor.checked_out_at,
                            }}
                            mode="table"
                            source="list-view"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
          <CardFooter>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <p className="mb-0 text-muted fs-13">
                Showing page {currentPage} of {totalPages}
              </p>
              <nav aria-label="Visitors pagination">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </button>
                  </li>
                  {pageNumbers.map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button type="button" className="page-link" onClick={() => onPageChange(page)}>
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  )
}

export default VisitorsList
