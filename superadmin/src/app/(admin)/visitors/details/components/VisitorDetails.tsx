'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import QRCode from 'qrcode'
import { toast } from 'react-hot-toast'

interface VisitorDetailsProps {
  visitor: {
    id: string
    visitor_name: string
    visitor_phone?: string | null
    visitor_type?: string | null
    purpose?: string | null
    status: string | null
    checked_in_at?: string | null
    checked_out_at?: string | null
    from_date?: string | null
    to_date?: string | null
    visit_date?: string | null
    created_at?: string | null
    updated_at?: string | null
    unit_label?: string
    community_name?: string
    agency_name?: string
    entry_code?: string | null
    qr_code_data?: string | null
    created_by_display?: string
    approved_by_display?: string
    checked_in_by_display?: string
    checked_out_by_display?: string
    created_by_profile?: {
      full_name?: string
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
    }
  }
  onApprove?: () => Promise<void>
  onDeny?: () => Promise<void>
  onCheckIn?: () => Promise<void>
  onCheckOut?: () => Promise<void>
  onDelete?: () => Promise<void>
  isActionPending?: boolean
}

const formatStatus = (value?: string | null) => {
  if (!value) return 'Unknown'
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const statusColor = (status?: string | null) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'checked_in':
      return 'info'
    case 'checked_out':
      return 'secondary'
    case 'denied':
    case 'cancelled':
    case 'expired':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString()
}

const displayValue = (value?: string | null, fallback = 'Not assigned') => {
  if (!value) return fallback
  const trimmed = value.trim()
  return trimmed.length ? trimmed : fallback
}

const resolveLifecycleStatusEvent = (visitor: VisitorDetailsProps['visitor']) => {
  const statusTimestamp =
    visitor.updated_at && visitor.updated_at !== visitor.created_at ? visitor.updated_at : null

  if (!statusTimestamp) return null

  if (visitor.status === 'approved' && !visitor.checked_in_at && !visitor.checked_out_at) {
    return {
      label: 'Pass Approved',
      timestamp: statusTimestamp,
      actor: visitor.approved_by_display || 'System',
      icon: 'ri:check-double-line',
      color: 'success',
    }
  }

  if (visitor.status === 'denied') {
    return {
      label: 'Pass Denied',
      timestamp: statusTimestamp,
      actor: visitor.approved_by_display || 'System',
      icon: 'ri:close-circle-line',
      color: 'danger',
    }
  }

  if (visitor.status === 'cancelled') {
    return {
      label: 'Pass Cancelled',
      timestamp: statusTimestamp,
      actor: visitor.approved_by_display || 'System',
      icon: 'ri:close-circle-line',
      color: 'secondary',
    }
  }

  if (visitor.status === 'expired') {
    return {
      label: 'Pass Expired',
      timestamp: statusTimestamp,
      actor: 'System',
      icon: 'ri:timer-flash-line',
      color: 'secondary',
    }
  }

  return null
}

const normalizeQrPayload = (value?: string | null) => {
  if (!value) return null
  const raw = value.trim()
  if (!raw) return null

  try {
    JSON.parse(raw)
    return raw
  } catch {
    const unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    try {
      JSON.parse(unescaped)
      return unescaped
    } catch {
      return raw
    }
  }
}

const VisitorDetails = ({
  visitor,
  onApprove,
  onDeny,
  onCheckIn,
  onCheckOut,
  onDelete,
  isActionPending = false,
}: VisitorDetailsProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [qrCodeError, setQrCodeError] = useState<string | null>(null)

  const normalizedQrPayload = useMemo(
    () => normalizeQrPayload(visitor.qr_code_data),
    [visitor.qr_code_data]
  )

  const qrCodeValue = useMemo(() => {
    if (normalizedQrPayload) return normalizedQrPayload
    if (visitor.entry_code?.trim()) {
      return JSON.stringify({
        type: 'visitor_pass',
        entry_code: visitor.entry_code,
        visitor_name: visitor.visitor_name,
      })
    }
    return null
  }, [normalizedQrPayload, visitor.entry_code, visitor.visitor_name])

  const qrPayloadPreview = useMemo(() => {
    if (!normalizedQrPayload) return 'Not available'
    try {
      return JSON.stringify(JSON.parse(normalizedQrPayload), null, 2)
    } catch {
      return normalizedQrPayload
    }
  }, [normalizedQrPayload])

  useEffect(() => {
    let active = true
    if (!qrCodeValue) {
      setQrCodeDataUrl(null)
      setQrCodeError('QR data not available')
      return () => {
        active = false
      }
    }

    setQrCodeError(null)
    QRCode.toDataURL(qrCodeValue, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl) => {
        if (!active) return
        setQrCodeDataUrl(dataUrl)
      })
      .catch((error) => {
        if (!active) return
        setQrCodeDataUrl(null)
        setQrCodeError(error?.message || 'Failed to render QR code')
      })

    return () => {
      active = false
    }
  }, [qrCodeValue])

  const lifecycleStatusEvent = resolveLifecycleStatusEvent(visitor)

  const timeline = [
    {
      label: 'Pass Created',
      timestamp: visitor.created_at,
      actor: visitor.created_by_profile?.full_name || visitor.created_by_display || 'Unknown',
      icon: 'ri:add-circle-line',
      color: 'primary',
    },
    lifecycleStatusEvent,
    visitor.checked_in_at
      ? {
          label: 'Visitor Checked In',
          timestamp: visitor.checked_in_at,
          actor: visitor.checked_in_by_display || 'Guard',
          icon: 'ri:login-box-line',
          color: 'info',
        }
      : null,
    visitor.checked_out_at
      ? {
          label: 'Visitor Checked Out',
          timestamp: visitor.checked_out_at,
          actor: visitor.checked_out_by_display || 'Guard',
          icon: 'ri:logout-box-line',
          color: 'secondary',
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string
    timestamp?: string | null
    actor?: string | null
    icon: string
    color: string
  }>

  const handleCopyQrPayload = async () => {
    if (!normalizedQrPayload) {
      toast.error('No QR payload available')
      return
    }

    const payloadToCopy = qrPayloadPreview

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payloadToCopy)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = payloadToCopy
        textarea.setAttribute('readonly', 'true')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      toast.success('QR payload copied')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to copy QR payload')
    }
  }

  const handleDownloadQrCode = () => {
    if (!qrCodeDataUrl) {
      toast.error('QR code not available')
      return
    }

    const fallbackName = visitor.entry_code || visitor.id.slice(0, 8)
    const safeVisitorName = (visitor.visitor_name || 'visitor')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const downloadName = `${safeVisitorName || 'visitor'}-${fallbackName}.png`

    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code download started')
  }

  return (
    <Row>
      <Col xl={8}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              <IconifyIcon icon="ri:user-line" className="me-2" />
              Visitor Information
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Full Name</label>
                  <p className="mb-0">{displayValue(visitor.visitor_name, 'Unknown')}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Phone Number</label>
                  <p className="mb-0">{displayValue(visitor.visitor_phone, 'Not provided')}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Visitor Type</label>
                  <p className="mb-0">{formatStatus(visitor.visitor_type)}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Purpose</label>
                  <p className="mb-0">{displayValue(visitor.purpose, 'Not specified')}</p>
                </div>
              </Col>
            </Row>
            <div className="d-flex align-items-center gap-2">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-0">Current Status</label>
              <Badge bg={statusColor(visitor.status)}>
                {formatStatus(visitor.status)}
              </Badge>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h5">
              <IconifyIcon icon="ri:calendar-line" className="me-2" />
              Visit Window
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Visit Date</label>
                  <p className="mb-0">{formatDate(visitor.visit_date || visitor.from_date)}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Valid From</label>
                  <p className="mb-0">{formatDateTime(visitor.from_date)}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Valid Until</label>
                  <p className="mb-0">{formatDateTime(visitor.to_date)}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Last Updated</label>
                  <p className="mb-0">{formatDateTime(visitor.updated_at)}</p>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h5">
              <IconifyIcon icon="ri:time-line" className="me-2" />
              Access Timeline
            </CardTitle>
          </CardHeader>
          <CardBody>
            {timeline.length === 0 ? (
              <p className="text-muted mb-0">No timeline events yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {timeline.map((event, index) => (
                  <div key={`${event.label}-${index}`} className="d-flex align-items-start gap-3">
                    <div
                      className={`rounded-circle bg-${event.color}-subtle text-${event.color} d-flex align-items-center justify-content-center`}
                      style={{ width: 32, height: 32 }}
                    >
                      <IconifyIcon icon={event.icon} />
                    </div>
                    <div>
                      <h6 className="mb-1">{event.label}</h6>
                      <p className="text-muted mb-0 fs-13">{formatDateTime(event.timestamp)}</p>
                      <p className="text-muted mb-0 fs-12">By: {event.actor || 'System'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </Col>

      <Col xl={4}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              <IconifyIcon icon="ri:user-heart-line" className="me-2" />
              Created By
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-3">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Name</label>
              <p className="mb-0 text-break">
                {displayValue(
                  visitor.created_by_profile?.full_name || visitor.created_by_display,
                  'Unknown'
                )}
              </p>
            </div>
            <div className="mb-3">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Email</label>
              <p className="mb-0 text-break">{displayValue(visitor.created_by_profile?.email, 'Not provided')}</p>
            </div>
            <div className="mb-0">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Phone</label>
              <p className="mb-0">{displayValue(visitor.created_by_profile?.phone, 'Not provided')}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h5">
              <IconifyIcon icon="ri:home-line" className="me-2" />
              Tenant Scope
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-3">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Community</label>
              <p className="mb-0 text-break">{displayValue(visitor.community_name)}</p>
            </div>
            <div className="mb-3">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Unit</label>
              <p className="mb-0">{displayValue(visitor.unit_label)}</p>
            </div>
            <div className="mb-0">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Agency</label>
              <p className="mb-0 text-break">{displayValue(visitor.agency_name)}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h5">
              <IconifyIcon icon="ri:tools-line" className="me-2" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-grid gap-2">
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
              {onDelete && (
                <Button variant="outline-danger" size="sm" onClick={onDelete} disabled={isActionPending}>
                  <IconifyIcon icon="ri:delete-bin-6-line" className="me-1" />
                  Delete Pass
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h5">
              <IconifyIcon icon="ri:qr-code-line" className="me-2" />
              Pass Data
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="border rounded-3 p-3 mb-3 text-center bg-body-tertiary">
              {qrCodeDataUrl ? (
                <Image
                  src={qrCodeDataUrl}
                  width={220}
                  height={220}
                  alt="Visitor pass QR code"
                  unoptimized
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              ) : (
                <div className="py-5">
                  <IconifyIcon icon="ri:qr-code-line" className="fs-1 text-muted" />
                  <p className="text-muted mb-0 mt-2 fs-13">{qrCodeError || 'QR code unavailable'}</p>
                </div>
              )}
            </div>
            <div className="d-flex gap-2 flex-wrap mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleCopyQrPayload}
                disabled={!normalizedQrPayload}
              >
                <IconifyIcon icon="ri:file-copy-line" className="me-1" />
                Copy Payload
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleDownloadQrCode}
                disabled={!qrCodeDataUrl}
              >
                <IconifyIcon icon="ri:download-line" className="me-1" />
                Download QR
              </Button>
            </div>
            <div className="mb-3">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">Entry Code</label>
              <p className="mb-0">
                <code>{displayValue(visitor.entry_code, 'Not generated')}</code>
              </p>
            </div>
            <div className="mb-0">
              <label className="fw-semibold text-muted fs-12 text-uppercase mb-1">QR Payload</label>
              <pre
                className="mb-0 fs-12 border rounded bg-body-tertiary p-2"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 160, overflowY: 'auto' }}
              >
                {qrPayloadPreview}
              </pre>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default VisitorDetails
