'use client'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardHeader, Col, Row } from '@/components/ReactBootstrap'
import AgencyList from './components/AgencyList'
import SearchForm from './components/SearchForm'
import Link from 'next/link'
import { useState } from 'react'
import { useListAgenciesDirectory } from '@/hooks/useAgencyDirectory'

// Note: Metadata can't be used in client components, so we'll handle it differently
// export const metadata: Metadata = { title: 'Society List' }

const ListViewPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: agenciesData = [], isLoading, error, refetch } = useListAgenciesDirectory()

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Agency List" />
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="border-0">
              <Row className="justify-content-between">
                <Col lg={6}>
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <SearchForm searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                    </Col>
                    <Col lg={4}>
                      <h5 className="text-dark fw-medium mb-0">
                        <span id="agency-count">{agenciesData.length}</span> <span className="text-muted"> Agencies</span>
                      </h5>
                    </Col>
                  </Row>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <Link href="/agency/manage?tab=profiles" className="btn btn-outline-primary me-2">
                      <IconifyIcon icon="ri:settings-2-line" className="me-1" />
                      Agency Workspace
                    </Link>
                    <Link href="#agency-list-filters" className="btn btn-outline-primary me-2">
                      <IconifyIcon icon="ri:filter-line" className="me-1" /> Filters
                    </Link>
                    <Link href="/agency/add" className="btn btn-success me-1">
                      <IconifyIcon icon="ri:add-line" /> New Agency
                    </Link>
                  </div>
                </Col>
              </Row>
            </CardHeader>
          </Card>
        </Col>
      </Row>
      <AgencyList
        agencies={agenciesData}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        searchTerm={searchTerm}
        onRefresh={() => {
          void refetch()
        }}
      />
    </>
  )
}

export default ListViewPage
