'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge, Button, Card, CardBody, CardTitle, Col, Row } from 'react-bootstrap'

import { avatars } from '@/assets/images/users'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { GuardDetailSnapshot } from '@/hooks/useGuardDetailSnapshot'
import { mapAvatarUrl } from '@/utils/avatarMapper'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatStatus = (value?: string | null) =>
  String(value || 'not_recorded')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const formatScore = (value: unknown) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toFixed(1) : '—'
}

type GuardDetailsCardProps = {
  snapshot: GuardDetailSnapshot
}

const GuardDetailsCard = ({ snapshot }: GuardDetailsCardProps) => {
  const { guard, assignments, schedules, equipment, performance, training } = snapshot
  const mappedAvatarUrl = mapAvatarUrl(guard.avatar_url)

  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="position-relative">
            {mappedAvatarUrl ? (
              <Image
                src={mappedAvatarUrl || avatars.dummyAvatar}
                alt="avatar"
                className="avatar-xl user-img img-thumbnail rounded-circle"
                width={80}
                height={80}
              />
            ) : (
              <div className="avatar-xl rounded-circle bg-light-subtle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:shield-user-line" className="fs-32" />
              </div>
            )}
            <div
              className={`badge bg-${guard.is_active ? 'success' : 'secondary'} rounded-2 position-absolute bottom-0 start-50 translate-middle-x mb-n1 fs-11`}
            >
              {guard.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="d-block">
            <p className="text-dark fw-medium fs-16 mb-1">{guard.full_name || 'No Name'}</p>
            <p className="mb-0">{guard.email || 'No email on file'}</p>
            <small className="text-muted">
              {guard.resolved_community_name || guard.societies?.name || 'Community not assigned'}
            </small>
          </div>
          <div className="ms-lg-auto d-flex flex-wrap gap-2">
            {guard.email ? (
              <a href={`mailto:${guard.email}`} className="btn btn-primary">
                Email Guard
              </a>
            ) : (
              <Button variant="primary" disabled>
                No Email Available
              </Button>
            )}
            <Link
              href={`/guards/manage?tab=assignments&guardId=${guard.id}`}
              className="btn btn-outline-secondary"
            >
              Manage Assignments
            </Link>
          </div>
        </div>

        <Row className="mt-4 g-3">
          <Col md={6}>
            <div className="border rounded p-3 h-100">
              <CardTitle as={'h5'} className="mb-3">
                Guard Profile
              </CardTitle>
              <p className="mb-2">
                <span className="fw-medium text-dark">Phone</span>
                <span className="mx-2">:</span>
                {guard.phone || 'No phone number'}
              </p>
              <p className="mb-2">
                <span className="fw-medium text-dark">Shift</span>
                <span className="mx-2">:</span>
                {guard.shift_type || guard.active_assignment_shift_type || 'Not set'}
              </p>
              <p className="mb-2">
                <span className="fw-medium text-dark">Employment Date</span>
                <span className="mx-2">:</span>
                {formatDate(guard.employment_date)}
              </p>
              <p className="mb-0">
                <span className="fw-medium text-dark">Provisioning</span>
                <span className="mx-2">:</span>
                {guard.assignment_status_label || 'No provisioning status'}
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className="border rounded p-3 h-100">
              <CardTitle as={'h5'} className="mb-3">
                Contact Shortcuts
              </CardTitle>
              <div className="d-flex flex-wrap gap-2">
                {guard.phone ? (
                  <Link
                    href={`tel:${guard.phone}`}
                    className="btn btn-soft-primary d-flex align-items-center justify-content-center"
                  >
                    <IconifyIcon icon="ri:phone-line" className="me-1" />
                    Call
                  </Link>
                ) : (
                  <Button variant="soft-primary" disabled>
                    <IconifyIcon icon="ri:phone-line" className="me-1" />
                    No Phone
                  </Button>
                )}
                {guard.email ? (
                  <Link
                    href={`mailto:${guard.email}`}
                    className="btn btn-soft-info d-flex align-items-center justify-content-center"
                  >
                    <IconifyIcon icon="ri:mail-line" className="me-1" />
                    Email
                  </Link>
                ) : (
                  <Button variant="soft-info" disabled>
                    <IconifyIcon icon="ri:mail-line" className="me-1" />
                    No Email
                  </Button>
                )}
                <Link
                  href={`/guards/manage?tab=assignments&guardId=${guard.id}`}
                  className="btn btn-soft-success d-flex align-items-center justify-content-center"
                >
                  <IconifyIcon icon="ri:settings-3-line" className="me-1" />
                  Workspace
                </Link>
              </div>
            </div>
          </Col>
        </Row>

        <div className="mt-4">
          <CardTitle as={'h4'} className="mb-3">
            Assignment Records
          </CardTitle>
          {assignments.length === 0 ? (
            <p className="text-muted mb-0">No guard assignment records have been created yet.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded p-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    <div>
                      <h6 className="mb-1">
                        {assignment.assignment_name || assignment.assigned_location || 'Assignment record'}
                      </h6>
                      <p className="text-muted mb-1 fs-13">
                        {assignment.assigned_gate || 'No gate specified'}
                        {assignment.shift_type ? ` • ${assignment.shift_type}` : ''}
                      </p>
                    </div>
                    <Badge bg="light" text="dark">
                      {formatStatus(assignment.status)}
                    </Badge>
                  </div>
                  <small className="text-muted">
                    {formatDate(assignment.start_date)}
                    {assignment.end_date ? ` to ${formatDate(assignment.end_date)}` : ''}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <CardTitle as={'h4'} className="mb-3">
            Recorded Schedules
          </CardTitle>
          {schedules.length === 0 ? (
            <p className="text-muted mb-0">No shift schedules have been recorded for this guard yet.</p>
          ) : (
            <Row className="g-3">
              {schedules.slice(0, 4).map((schedule) => (
                <Col md={6} key={schedule.id}>
                  <div className="border rounded p-3 h-100">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <h6 className="mb-1">{schedule.shift_type || 'Shift schedule'}</h6>
                        <p className="text-muted mb-1 fs-13">{schedule.post_location || 'Post not specified'}</p>
                      </div>
                      <Badge bg="light" text="dark">
                        {formatStatus(schedule.status)}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      {formatDate(schedule.assigned_date)} • {schedule.start_time || '—'} - {schedule.end_time || '—'}
                    </small>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </div>

        <Row className="mt-4 g-3">
          <Col lg={6}>
            <CardTitle as={'h4'} className="mb-3">
              Equipment
            </CardTitle>
            {equipment.length === 0 ? (
              <p className="text-muted mb-0">No equipment records are assigned to this guard.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {equipment.map((item) => (
                  <div key={item.id} className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <h6 className="mb-1">{item.name || 'Equipment record'}</h6>
                        <p className="text-muted mb-1 fs-13">
                          {item.equipment_type || 'Type not set'}
                          {item.serial_number ? ` • ${item.serial_number}` : ''}
                        </p>
                      </div>
                      <Badge bg="light" text="dark">
                        {formatStatus(item.status)}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      {item.location || 'Location not specified'} • Assigned {formatDate(item.assignment_date)}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </Col>

          <Col lg={6}>
            <CardTitle as={'h4'} className="mb-3">
              Training & Performance
            </CardTitle>
            {training.length === 0 && performance.length === 0 ? (
              <p className="text-muted mb-0">
                No training, certification, or performance records have been logged yet.
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {training.slice(0, 3).map((record) => (
                  <div key={`training-${record.id}`} className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <h6 className="mb-1">{record.training_name || record.certification || 'Training record'}</h6>
                        <p className="text-muted mb-1 fs-13">{record.training_type || 'Type not set'}</p>
                      </div>
                      <Badge bg="light" text="dark">
                        {formatStatus(record.status)}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      Start {formatDate(record.start_date)}
                      {record.completion_date ? ` • Completed ${formatDate(record.completion_date)}` : ''}
                    </small>
                  </div>
                ))}
                {performance.slice(0, 2).map((review) => (
                  <div key={`performance-${review.id}`} className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <h6 className="mb-1">Performance Review</h6>
                        <p className="text-muted mb-1 fs-13">
                          Reviewer: {review.reviewed_by || 'Not recorded'}
                        </p>
                      </div>
                      <Badge bg="light" text="dark">
                        Score {formatScore(review.overall_score)}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      {formatDate(review.evaluation_date)} • {formatStatus(review.status)}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default GuardDetailsCard
