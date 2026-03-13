'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button, Col, Row } from 'react-bootstrap'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import GuardDetails from './components/GuardDetails'
import GuardDetailsBanner from './components/GuardDetailsBanner'
import { useGuardDetailSnapshot } from '@/hooks/useGuardDetailSnapshot'

const GuardDetailsContent = () => {
  const searchParams = useSearchParams()
  const guardId = searchParams.get('id')
  const { data: snapshot, isLoading, error } = useGuardDetailSnapshot(guardId || '')

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

  if (error || !snapshot) {
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

  const { guard } = snapshot

  return (
    <>
      <PageTitle subName="Casa Nirvana" title={`${guard.full_name || 'Guard'} - Details`} />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <Link href="/guards/grid-view" className="btn btn-outline-secondary">
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Guards
            </Link>
            <div className="d-flex flex-wrap gap-2">
              <Link
                href={`/guards/manage?tab=assignments&guardId=${guard.id}`}
                className="btn btn-primary"
              >
                <IconifyIcon icon="ri:settings-3-line" className="me-1" />
                Manage Assignments
              </Link>
              {guard.phone ? (
                <Button as={Link} href={`tel:${guard.phone}`} variant="success">
                  <IconifyIcon icon="ri:phone-line" className="me-1" />
                  Call Guard
                </Button>
              ) : (
                <Button variant="success" disabled>
                  <IconifyIcon icon="ri:phone-line" className="me-1" />
                  No Phone Available
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <GuardDetailsBanner snapshot={snapshot} />
      <GuardDetails snapshot={snapshot} />
    </>
  )
}

const GuardDetailsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading page...</div>
        </div>
      }
    >
      <GuardDetailsContent />
    </Suspense>
  )
}

export default GuardDetailsPage
