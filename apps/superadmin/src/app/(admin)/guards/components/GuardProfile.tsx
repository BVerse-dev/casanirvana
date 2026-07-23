'use client'

import Link from 'next/link'
import { Button, Col, Row } from 'react-bootstrap'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGuardDetailSnapshot } from '@/hooks/useGuardDetailSnapshot'
import GuardDetails from '../details/components/GuardDetails'
import GuardDetailsBanner from '../details/components/GuardDetailsBanner'

type GuardProfileProps = { guardId: string }

const GuardProfile = ({ guardId }: GuardProfileProps) => {
  const { data: snapshot, isLoading, error } = useGuardDetailSnapshot(guardId)

  if (isLoading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading guard details...</span></div><div className="mt-2">Loading guard details...</div></div>
  }

  if (error || !snapshot) {
    return <div className="text-center py-5"><div className="text-danger"><IconifyIcon icon="solar:danger-circle-broken" className="fs-48 mb-3" /><h4>Guard unavailable</h4><p>{error?.message || 'The guard profile could not be found in your authorized scope.'}</p><Link href="/guards" className="btn btn-primary"><IconifyIcon icon="ri:arrow-left-line" className="me-1" />Back to Guards</Link></div></div>
  }

  const { guard } = snapshot

  return (
    <>
      <PageTitle subName="Casa Nirvana" title={`${guard.full_name || 'Guard'} - Details`} />
      <Row className="mb-3"><Col xl={12}><div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <Link href="/guards" className="btn btn-outline-secondary"><IconifyIcon icon="ri:arrow-left-line" className="me-1" />Back to Guards</Link>
        <div className="d-flex flex-wrap gap-2">
          <Link href={`/guards/manage?tab=assignments&guardId=${guard.id}`} className="btn btn-primary"><IconifyIcon icon="ri:settings-3-line" className="me-1" />Manage Assignments</Link>
          {guard.phone ? <a href={`tel:${guard.phone}`} className="btn btn-success"><IconifyIcon icon="ri:phone-line" className="me-1" />Call Guard</a> : <Button variant="success" disabled><IconifyIcon icon="ri:phone-line" className="me-1" />No Phone Available</Button>}
        </div>
      </div></Col></Row>
      <GuardDetailsBanner snapshot={snapshot} />
      <GuardDetails snapshot={snapshot} />
    </>
  )
}

export default GuardProfile
