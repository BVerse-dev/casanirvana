'use client'

import PageTitle from '@/components/PageTitle'
import { useSearchParams } from 'next/navigation'
import { useGetResident } from '@/hooks/useResidents'
import ResidentDetails from './components/ResidentDetails'
import ResidentDetailsBanner from './components/ResidentDetailsBanner'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const ResidentDetailsPage = () => {
  const searchParams = useSearchParams()
  const residentId = searchParams.get('id')

  const { data: resident, isLoading, error } = useGetResident(residentId || '')

  if (!residentId) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="text-danger">No resident ID provided</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (isLoading) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Resident Overview" />
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody className="text-center py-5">
                <div>Loading resident details...</div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    )
  }

  if (error || !resident) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Resident Overview" />
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody className="text-center py-5">
                <div className="text-danger">Resident not found</div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title={`${resident.full_name} - Overview`} />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/residents/grid-view" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Residents
            </Link>
          </div>
        </Col>
      </Row>
      
      <ResidentDetailsBanner resident={resident} />
      <ResidentDetails resident={resident} />
    </>
  )
}

export default ResidentDetailsPage
