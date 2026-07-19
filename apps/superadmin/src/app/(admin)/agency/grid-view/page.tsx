'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Card, CardHeader, Col, Row } from '@/components/ReactBootstrap'
import AgencyData from './components/AgencyData'
import AgencyGridCard from './components/AgencyGridCard'
import PageTitle from '@/components/PageTitle'
import { useListAgenciesDirectory } from '@/hooks/useAgencyDirectory'
import { useMemo, useState } from 'react'

// Note: Metadata can't be used in client components, so we'll handle it differently
// export const metadata: Metadata = { title: 'Agency Grid' }

const GridViewPage = () => {
  const { data: agencies = [], isLoading, error, refetch } = useListAgenciesDirectory()
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredAgencies = useMemo(
    () =>
      agencies.filter((agency) => {
        if (statusFilter === 'all') return true
        return statusFilter === 'active' ? Boolean(agency.is_active) : !agency.is_active
      }),
    [agencies, statusFilter]
  )

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Agency Grid" />
      <AgencyGridCard agencies={agencies} />
      <Row>
        <Col lg={12}>
          <Card className="bg-body shadow-none">
            <CardHeader className="border-0">
              <Row className="justify-content-between align-items-center">
                <Col lg={6}>
                  <p className="mb-0 text-muted">
                    Showing <span className="text-dark fw-semibold">{filteredAgencies.length}</span>{' '}
                    {statusFilter === 'all' ? 'agencies' : `${statusFilter} agencies`}
                    {statusFilter !== 'all' ? (
                      <small className="ms-2 text-muted">{agencies.length} total agencies</small>
                    ) : null}
                  </p>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <Link href="/agency/manage?tab=profiles" className="btn btn-outline-primary me-1">
                      <IconifyIcon icon="ri:settings-2-line" className="me-1" />
                      Agency Workspace
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-primary me-1"
                      id="filters-dropdown"
                      data-bs-toggle="dropdown"
                    >
                      <IconifyIcon icon="ri:filter-line" className="me-1" /> Filters
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="filters-dropdown">
                      <li>
                        <button type="button" className="dropdown-item" onClick={() => setStatusFilter('all')}>
                          All Agencies
                        </button>
                      </li>
                      <li>
                        <button type="button" className="dropdown-item" onClick={() => setStatusFilter('active')}>
                          Active Agencies
                        </button>
                      </li>
                      <li>
                        <button type="button" className="dropdown-item" onClick={() => setStatusFilter('inactive')}>
                          Inactive Agencies
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button type="button" className="dropdown-item" onClick={() => void refetch()}>
                          Refresh Directory
                        </button>
                      </li>
                    </ul>
                    <Link href="/agency/add" className="btn btn-success me-1">
                      <IconifyIcon icon="ri-add-line" /> New Agency
                    </Link>
                  </div>
                </Col>
              </Row>
            </CardHeader>
          </Card>
        </Col>
      </Row>
      <AgencyData
        agencies={filteredAgencies}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
      />
    </>
  )
}

export default GridViewPage
