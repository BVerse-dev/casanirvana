'use client'

import PageTitle from '@/components/PageTitle'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGetVisitorPass, useVisitorPassLifecycleActions } from '@/hooks/useVisitorPasses'
import VisitorDetails from './components/VisitorDetails'
import VisitorDetailsBanner from './components/VisitorDetailsBanner'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { toast } from 'react-hot-toast'

const VisitorDetailsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitorId = searchParams.get('id')

  const { data: visitor, isLoading, error } = useGetVisitorPass(visitorId || '')
  const { approve, deny, checkIn, checkOut, remove, isPending } = useVisitorPassLifecycleActions(visitorId || '')

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action()
      toast.success(label)
    } catch (actionError: any) {
      toast.error(actionError?.message || `Failed to ${label.toLowerCase()}`)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this visitor pass? This action cannot be undone.')) return
    await runAction('Visitor pass deleted', async () => {
      await remove()
      router.push('/visitors/list-view')
    })
  }

  if (!visitorId) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Visitor Pass Details" />
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody className="text-center py-5">
                <div className="text-danger">No visitor ID provided</div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Visitor Pass Details" />
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody className="text-center py-5">
                <div>Loading visitor details...</div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    )
  }

  if (error || !visitor) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Visitor Pass Details" />
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody className="text-center py-5">
                <div className="text-danger">Visitor not found</div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title={`${visitor.visitor_name} - Visitor Details`} />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/visitors/grid-view" 
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
              Back to Visitors
            </Link>
          </div>
        </Col>
      </Row>
      
      <VisitorDetailsBanner
        visitor={visitor}
        onApprove={() => runAction('Visitor approved', approve)}
        onDeny={() => runAction('Visitor denied', deny)}
        onCheckIn={() => runAction('Visitor checked in', checkIn)}
        onCheckOut={() => runAction('Visitor checked out', checkOut)}
        isActionPending={isPending}
      />
      <VisitorDetails
        visitor={visitor}
        onApprove={() => runAction('Visitor approved', approve)}
        onDeny={() => runAction('Visitor denied', deny)}
        onCheckIn={() => runAction('Visitor checked in', checkIn)}
        onCheckOut={() => runAction('Visitor checked out', checkOut)}
        onDelete={handleDelete}
        isActionPending={isPending}
      />
    </>
  )
}

export default VisitorDetailsPage
