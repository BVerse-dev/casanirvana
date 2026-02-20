'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Card, CardHeader, Col, Row } from '@/components/ReactBootstrap'
import AgencyData from './components/AgencyData'
import AgencyGridCard from './components/AgencyGridCard'
import PageTitle from '@/components/PageTitle'
import { useListAgencies } from '@/hooks/useAgencies'

// Note: Metadata can't be used in client components, so we'll handle it differently
// export const metadata: Metadata = { title: 'Agency Grid' }

const GridViewPage = () => {
  const { data: agencies = [] } = useListAgencies()

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Agency Grid" />
      <AgencyGridCard />
      <Row>
        <Col lg={12}>
          <Card className="bg-body shadow-none">
            <CardHeader className="border-0">
              <Row className="justify-content-between align-items-center">
                <Col lg={6}>
                  <p className="mb-0 text-muted">
                    Showing all <span className="text-dark fw-semibold">{agencies.length}</span> Agencies
                  </p>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <button type="button" className="btn btn-outline-primary me-1">
                      <IconifyIcon icon="ri:settings-2-line" className="me-1" />
                      More Setting
                    </button>
                    <button type="button" className="btn btn-outline-primary me-1" id="filters-dropdown" data-bs-toggle="dropdown">
                      <IconifyIcon icon="ri:filter-line" className="me-1" /> Filters
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="filters-dropdown">
                      <li><a className="dropdown-item" href="#">All Agencies</a></li>
                      <li><a className="dropdown-item" href="#">Active Agencies</a></li>
                      <li><a className="dropdown-item" href="#">Inactive Agencies</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item" href="#">Sort by Name</a></li>
                      <li><a className="dropdown-item" href="#">Sort by Date</a></li>
                      <li><a className="dropdown-item" href="#">Sort by Rating</a></li>
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
      <AgencyData />
    </>
  )
}

export default GridViewPage
