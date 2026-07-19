'use client'

import { Badge, Button, Card, CardBody, Col, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import type { VisitorPassRecord } from '@/hooks/useVisitorPasses'

interface VisitorDetailsBannerProps {
  visitor: VisitorPassRecord
  onApprove?: () => Promise<void>
  onDeny?: () => Promise<void>
  onCheckIn?: () => Promise<void>
  onCheckOut?: () => Promise<void>
  isActionPending?: boolean
}

const formatStatus = (value?: string | null) => {
  if (!value) return 'Unknown'
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not set'
  return date.toLocaleDateString()
}

const displayValue = (value?: string | null, fallback = 'Not assigned') => {
  if (!value) return fallback
  const trimmed = value.trim()
  return trimmed.length ? trimmed : fallback
}

const VisitorDetailsBanner = ({
  visitor,
  onApprove,
  onDeny,
  onCheckIn,
  onCheckOut,
  isActionPending = false,
}: VisitorDetailsBannerProps) => {
  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'denied':
        return 'danger'
      case 'checked_in':
        return 'info'
      case 'checked_out':
        return 'secondary'
      case 'cancelled':
      case 'expired':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getCheckInStatus = () => {
    if (visitor.status === 'checked_out' || visitor.checked_out_at) {
      return { text: 'Visit Completed', color: 'secondary', icon: 'ri:logout-box-line' }
    }
    if (visitor.status === 'checked_in' || visitor.checked_in_at) {
      return { text: 'Inside Community', color: 'success', icon: 'ri:check-double-line' }
    }
    if (visitor.status === 'approved') {
      return { text: 'Awaiting Check-in', color: 'warning', icon: 'ri:time-line' }
    }
    if (visitor.status === 'pending') {
      return { text: 'Awaiting Approval', color: 'warning', icon: 'ri:hourglass-line' }
    }
    if (visitor.status === 'denied' || visitor.status === 'cancelled' || visitor.status === 'expired') {
      return { text: 'Access Closed', color: 'secondary', icon: 'ri:close-line' }
    }
    return { text: 'Awaiting Review', color: 'secondary', icon: 'ri:question-line' }
  }

  const checkInStatus = getCheckInStatus()
  const detailCards = [
    {
      label: 'Visit Date',
      icon: 'ri:calendar-line',
      value: formatDate(visitor.visit_date || visitor.from_date),
      iconColor: 'text-primary',
    },
    {
      label: 'Valid Until',
      icon: 'ri:calendar-check-line',
      value: formatDate(visitor.to_date),
      iconColor: 'text-success',
    },
    {
      label: 'Unit',
      icon: 'ri:home-line',
      value: displayValue(visitor.unit_label),
      iconColor: 'text-info',
    },
    {
      label: 'Created By',
      icon: 'ri:user-line',
      value: displayValue(
        visitor.created_by_profile?.full_name || visitor.created_by_display,
        'Unknown'
      ),
      iconColor: 'text-warning',
    },
    {
      label: 'Community',
      icon: 'ri:community-line',
      value: displayValue(visitor.community_name),
      iconColor: 'text-info',
    },
    {
      label: 'Agency',
      icon: 'ri:building-2-line',
      value: displayValue(visitor.agency_name),
      iconColor: 'text-primary',
    },
  ]

  return (
    <Card>
      <CardBody>
        <Row className="align-items-center">
          <Col lg={8}>
            <div className="d-flex align-items-center">
              <div className="avatar-lg me-3">
                {visitor.visitor_profile?.avatar_url ? (
                  <Image
                    src={visitor.visitor_profile.avatar_url}
                    alt="Visitor Avatar"
                    className="img-fluid rounded-circle"
                    width={72}
                    height={72}
                  />
                ) : (
                  <Image
                    src={avatar1}
                    alt="Default Avatar"
                    className="img-fluid rounded-circle"
                    width={72}
                    height={72}
                  />
                )}
              </div>
              <div>
                <h4 className="mb-1 fw-semibold">{displayValue(visitor.visitor_name, 'Unknown')}</h4>
                <p className="text-muted mb-1">
                  <IconifyIcon icon="ri:phone-line" className="me-1" />
                  {displayValue(visitor.visitor_phone, 'Phone not provided')}
                </p>
                <p className="text-muted mb-0">
                  <IconifyIcon icon="ri:file-text-line" className="me-1" />
                  Purpose: {displayValue(visitor.purpose, 'Not specified')}
                </p>
              </div>
            </div>
          </Col>
          <Col lg={4}>
            <div className="text-lg-end">
              <div className="d-flex flex-column gap-2 align-items-lg-end">
                <div className="d-flex gap-2 align-items-center">
                  <Badge bg={getStatusColor(visitor.status)} className="fs-12">
                    <IconifyIcon icon="ri:check-line" className="me-1" />
                    {formatStatus(visitor.status)}
                  </Badge>
                  <Badge bg={checkInStatus.color} className="fs-12">
                    <IconifyIcon icon={checkInStatus.icon} className="me-1" />
                    {checkInStatus.text}
                  </Badge>
                </div>
                <div className="d-flex gap-1">
                  {visitor.status === 'pending' && onApprove && onDeny && (
                    <>
                      <Button variant="success" size="sm" onClick={onApprove} disabled={isActionPending}>
                        <IconifyIcon icon="ri:check-line" className="me-1" />
                        Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={onDeny} disabled={isActionPending}>
                        <IconifyIcon icon="ri:close-line" className="me-1" />
                        Deny
                      </Button>
                    </>
                  )}
                  {visitor.status === 'approved' && !visitor.checked_in_at && onCheckIn && (
                    <Button variant="primary" size="sm" onClick={onCheckIn} disabled={isActionPending}>
                      <IconifyIcon icon="ri:login-box-line" className="me-1" />
                      Check In
                    </Button>
                  )}
                  {visitor.status === 'checked_in' && !visitor.checked_out_at && onCheckOut && (
                    <Button variant="warning" size="sm" onClick={onCheckOut} disabled={isActionPending}>
                      <IconifyIcon icon="ri:logout-box-line" className="me-1" />
                      Check Out
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
        
        <Row className="mt-4 pt-3 border-top g-3">
          {detailCards.map((item) => (
            <Col md={6} xl={4} key={item.label}>
              <div className="border rounded-3 p-3 h-100 bg-body-tertiary">
                <div className="d-flex align-items-start gap-2">
                  <IconifyIcon icon={item.icon} className={`fs-22 mt-1 ${item.iconColor}`} />
                  <div style={{ minWidth: 0 }}>
                    <p className="text-muted mb-1 fs-12 text-uppercase">{item.label}</p>
                    <p className="mb-0 fw-semibold text-break">{item.value}</p>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  )
}

export default VisitorDetailsBanner
