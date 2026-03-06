'use client'

import { Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useVisitorPassLifecycleActions } from '@/hooks/useVisitorPasses'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import type { MouseEvent } from 'react'

type VisitorActionRecord = {
  id: string
  status?: string | null
  checked_in_at?: string | null
  checked_out_at?: string | null
}

interface VisitorActionButtonsProps {
  visitor: VisitorActionRecord
  mode?: 'table' | 'card'
  source?: 'list-view' | 'grid-view'
}

const VisitorActionButtons = ({ visitor, mode = 'table', source }: VisitorActionButtonsProps) => {
  const { approve, deny, checkIn, checkOut, remove, isPending } = useVisitorPassLifecycleActions(visitor.id)

  const showLabels = mode === 'card'
  const buttonSize = 'sm'
  const isCardMode = mode === 'card'
  const containerClassName = isCardMode ? 'd-flex flex-nowrap gap-2 w-100' : 'd-flex flex-wrap gap-1'
  const buttonClassName = isCardMode
    ? 'flex-grow-1 flex-basis-0 d-inline-flex align-items-center justify-content-center gap-1 text-nowrap px-2 overflow-hidden'
    : undefined
  const cardButtonStyle = isCardMode ? { minWidth: 0 } : undefined

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action()
      toast.success(label)
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${label.toLowerCase()}`)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this visitor pass? This action cannot be undone.')) return
    await runAction('Visitor pass deleted', remove)
  }

  const isPendingState = visitor.status === 'pending'
  const canCheckIn = visitor.status === 'approved' && !visitor.checked_in_at
  const canCheckOut = visitor.status === 'checked_in' && !visitor.checked_out_at
  const stopEvent = (event: MouseEvent) => {
    event.stopPropagation()
  }
  const renderLabel = (label: string) => (showLabels ? <span className="text-truncate">{label}</span> : null)

  return (
    <div className={containerClassName}>
      {isPendingState && (
        <>
          <Button
            variant="success"
            size={buttonSize}
            className={buttonClassName}
            disabled={isPending}
            onClick={(event) => {
              stopEvent(event)
              runAction('Visitor approved', approve)
            }}
            title="Approve"
            style={cardButtonStyle}
          >
            <IconifyIcon icon="ri:check-line" />
            {renderLabel('Approve')}
          </Button>
          <Button
            variant="outline-danger"
            size={buttonSize}
            className={buttonClassName}
            disabled={isPending}
            onClick={(event) => {
              stopEvent(event)
              runAction('Visitor denied', deny)
            }}
            title="Deny"
            style={cardButtonStyle}
          >
            <IconifyIcon icon="ri:close-line" />
            {renderLabel('Deny')}
          </Button>
        </>
      )}

      {canCheckIn && (
        <Button
          variant="primary"
          size={buttonSize}
          className={buttonClassName}
          disabled={isPending}
          onClick={(event) => {
            stopEvent(event)
            runAction('Visitor checked in', checkIn)
          }}
          title="Check in"
          style={cardButtonStyle}
        >
          <IconifyIcon icon="ri:login-box-line" />
          {renderLabel('Check In')}
        </Button>
      )}

      {canCheckOut && (
        <Button
          variant="warning"
          size={buttonSize}
          className={buttonClassName}
          disabled={isPending}
          onClick={(event) => {
            stopEvent(event)
            runAction('Visitor checked out', checkOut)
          }}
          title="Check out"
          style={cardButtonStyle}
        >
          <IconifyIcon icon="ri:logout-box-line" />
          {renderLabel('Check Out')}
        </Button>
      )}

      <Button
        as={Link}
        href={`/visitors/details?id=${visitor.id}${source ? `&source=${source}` : ''}`}
        variant="outline-secondary"
        size={buttonSize}
        className={buttonClassName}
        title="View details"
        onClick={stopEvent}
        style={cardButtonStyle}
      >
        <IconifyIcon icon="solar:eye-broken" />
        {renderLabel('Details')}
      </Button>

      <Button
        variant="outline-danger"
        size={buttonSize}
        className={buttonClassName}
        disabled={isPending}
        onClick={(event) => {
          stopEvent(event)
          handleDelete()
        }}
        title="Delete"
        style={cardButtonStyle}
      >
        <IconifyIcon icon="ri:delete-bin-line" />
        {renderLabel('Delete')}
      </Button>
    </div>
  )
}

export default VisitorActionButtons
