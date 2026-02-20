'use client'
import PageTitle from '@/components/PageTitle'
import GuardDetails from './components/GuardDetails'
import GuardDetailsBanner from './components/GuardDetailsBanner'
import { Row, Col } from 'react-bootstrap'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useSearchParams } from 'next/navigation'
import { useGetGuard } from '@/hooks/useGuards'
import { Suspense } from 'react'

const GuardDetailsContent = () => {
  const searchParams = useSearchParams()
  const guardId = searchParams.get('id')
  
  const { data: guard, isLoading, error } = useGetGuard(guardId || '')

  if (!guardId) {
    return (
      <div className="text-center py-5">
        <h4>Guard Not Found</h4>
        <p>No guard ID provided in the URL.</p>
        <Link href="/guards/list-view" className="btn btn-primary">
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Back to Guards List
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Loading guard details...</div>
      </div>
    )
  }

  if (error || !guard) {
    return (
      <div className="text-center py-5">
        <div className="text-danger">
          <IconifyIcon icon="solar:danger-circle-broken" className="fs-48 mb-3" />
          <h4>Error Loading Guard</h4>
          <p>{error?.message || 'Guard not found'}</p>
          <Link href="/guards/list-view" className="btn btn-primary">
            <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
            Back to Guards List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title={`${guard.full_name || 'Guard'} - Details`} />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/guards/grid-view" 
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
              Back to Guards
            </Link>
            <div className="d-flex gap-2">
              <Link href={`/guards/edit?id=${guard.id}`} className="btn btn-primary">
                <IconifyIcon icon="solar:pen-2-broken" className="me-1" />
                Edit Guard
              </Link>
              <Link href={`tel:${guard.phone}`} className="btn btn-success">
                <IconifyIcon icon="ri:phone-line" className="me-1" />
                Call Guard
              </Link>
            </div>
          </div>
        </Col>
      </Row>
      
      <GuardDetailsBanner guard={guard} />
      <GuardDetails guard={guard} />
    </>
  )
}

const GuardDetailsPage = () => {
  return (
    <Suspense fallback={
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Loading page...</div>
      </div>
    }>
      <GuardDetailsContent />
    </Suspense>
  )
}

export default GuardDetailsPage
