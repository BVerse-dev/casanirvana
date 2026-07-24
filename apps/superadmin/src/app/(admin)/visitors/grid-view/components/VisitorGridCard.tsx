'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import { Badge, Card, CardBody, CardFooter } from 'react-bootstrap'
import VisitorActionButtons from '../../components/VisitorActionButtons'
import { formatVisitorLabel, getVisitorStatusVariant } from '../../components/visitorDisplay'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

const VisitorGridCard = ({ visitor }: { visitor: any }) => {
  const router = useRouter()

  return (
    <Card
      className="h-100 w-100 shadow-sm"
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={() => router.push(`/visitors/${visitor.id}?source=grid-view`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          router.push(`/visitors/${visitor.id}?source=grid-view`)
        }
      }}
    >
      <CardBody className="d-flex flex-column gap-3">
        <div className="d-flex align-items-start gap-2 pb-3 border-bottom">
          {visitor.visitor_profile?.avatar_url ? (
            <Image
              src={visitor.visitor_profile.avatar_url}
              alt="avatar"
              width={56}
              height={56}
              className="rounded-circle border border-light border-3"
            />
          ) : (
            <div className="rounded-circle bg-light-subtle border border-light border-3 d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
              <IconifyIcon icon="ri:user-line" className="fs-22" />
            </div>
          )}
          <div className="flex-grow-1">
            <Link
              href={`/visitors/${visitor.id}?source=grid-view`}
              className="h5 mb-1 d-inline-block text-dark text-decoration-none"
              onClick={(event) => event.stopPropagation()}
            >
              {displayValue(visitor.visitor_name, 'No Name')}
            </Link>
            <p className="mb-1 text-muted">{displayValue(visitor.visitor_phone)}</p>
            <p className="mb-0 text-muted fs-13">Pass #{visitor.id.slice(0, 8)}</p>
          </div>
          <Badge bg={`${getVisitorStatusVariant(visitor.status)}-subtle`} text={getVisitorStatusVariant(visitor.status)}>
            {formatVisitorLabel(visitor.status)}
          </Badge>
        </div>

        <div className="d-flex flex-column gap-2">
          <p className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:calendar-line" className="text-primary fs-16" />
            Visit Date: {formatDate(visitor.visit_date || visitor.from_date)}
          </p>
          <p className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:user-settings-line" className="text-primary fs-16" />
            Type: {formatVisitorLabel(visitor.visitor_type)}
          </p>
          <p className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:community-line" className="text-primary fs-16" />
            Community: {displayValue(visitor.community_name)}
          </p>
          <p className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:home-line" className="text-primary fs-16" />
            Unit: {displayValue(visitor.unit_label)}
          </p>
          <p className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:id-card-line" className="text-primary fs-16" />
            Entry Code: {displayValue(visitor.entry_code)}
          </p>
          <p className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:user-line" className="text-primary fs-16" />
            Created By: {displayValue(visitor.created_by_display || visitor.host_profile?.full_name, 'Unknown')}
          </p>
          <p className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:file-list-3-line" className="text-primary fs-16" />
            Purpose: {displayValue(visitor.purpose, 'Not specified')}
          </p>
        </div>
      </CardBody>
      <CardFooter className="border-top">
        <VisitorActionButtons
          visitor={{
            id: visitor.id,
            status: visitor.status,
            checked_in_at: visitor.checked_in_at,
            checked_out_at: visitor.checked_out_at,
          }}
          mode="card"
          source="grid-view"
        />
      </CardFooter>
    </Card>
  )
}

export default VisitorGridCard
