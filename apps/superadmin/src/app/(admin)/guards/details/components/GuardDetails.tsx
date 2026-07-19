'use client'

import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import GuardDetailsCard from './GuardDetailsCard'
import type { GuardDetailSnapshot } from '@/hooks/useGuardDetailSnapshot'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatScore = (value: unknown) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toFixed(1) : '—'
}

const formatStatus = (value?: string | null) =>
  String(value || 'not_recorded')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

type ActivityEvent = {
  id: string
  title: string
  detail: string
  when: string | null
  status?: string | null
}

const buildActivityEvents = (snapshot: GuardDetailSnapshot): ActivityEvent[] => {
  const assignmentEvents = snapshot.assignments.map((assignment) => ({
    id: `assignment-${assignment.id}`,
    title: 'Assignment Updated',
    detail: assignment.assignment_name || assignment.assigned_location || 'Guard assignment record',
    when: assignment.updated_at || assignment.start_date || assignment.created_at || null,
    status: assignment.status,
  }))

  const scheduleEvents = snapshot.schedules.map((schedule) => ({
    id: `schedule-${schedule.id}`,
    title: 'Schedule Recorded',
    detail: `${schedule.shift_type || 'Shift'} schedule`,
    when: schedule.assigned_date || schedule.updated_at || schedule.created_at || null,
    status: schedule.status,
  }))

  const equipmentEvents = snapshot.equipment.map((equipment) => ({
    id: `equipment-${equipment.id}`,
    title: 'Equipment Logged',
    detail: equipment.name || equipment.equipment_type || 'Equipment record',
    when: equipment.assignment_date || equipment.updated_at || equipment.created_at || null,
    status: equipment.status,
  }))

  const performanceEvents = snapshot.performance.map((review) => ({
    id: `performance-${review.id}`,
    title: 'Performance Review',
    detail: `Overall score ${formatScore(review.overall_score)}`,
    when: review.evaluation_date || review.updated_at || review.created_at || null,
    status: review.status,
  }))

  const trainingEvents = snapshot.training.map((training) => ({
    id: `training-${training.id}`,
    title: 'Training Record',
    detail: training.training_name || training.certification || 'Training activity',
    when: training.completion_date || training.start_date || training.updated_at || training.created_at || null,
    status: training.status,
  }))

  return [
    ...assignmentEvents,
    ...scheduleEvents,
    ...equipmentEvents,
    ...performanceEvents,
    ...trainingEvents,
  ]
    .sort((left, right) => {
      const leftTime = left.when ? new Date(left.when).getTime() : 0
      const rightTime = right.when ? new Date(right.when).getTime() : 0
      return rightTime - leftTime
    })
    .slice(0, 6)
}

type GuardDetailsProps = {
  snapshot: GuardDetailSnapshot
}

const GuardDetails = ({ snapshot }: GuardDetailsProps) => {
  const latestPerformance = snapshot.performance[0]
  const upcomingSchedule = snapshot.schedules[0]
  const recentActivity = buildActivityEvents(snapshot)

  return (
    <Row className="justify-content-center">
      <Col xl={8} lg={12}>
        <GuardDetailsCard snapshot={snapshot} />
      </Col>
      <Col xl={4} lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Operational Snapshot</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="mb-1">Latest Performance</h6>
                <small className="text-muted">
                  {latestPerformance ? formatDate(latestPerformance.evaluation_date) : 'No review recorded'}
                </small>
              </div>
              <h3 className="mb-0 text-success">{formatScore(latestPerformance?.overall_score)}</h3>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="mb-1">Next Known Shift</h6>
                <small className="text-muted">{upcomingSchedule?.shift_type || 'No schedule recorded'}</small>
              </div>
              <span className="fw-semibold">{formatDate(upcomingSchedule?.assigned_date)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="mb-1">Equipment Assigned</h6>
                <small className="text-muted">Tracked equipment records</small>
              </div>
              <span className="fw-semibold">{snapshot.equipment.length}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">Completed Training</h6>
                <small className="text-muted">Training records marked completed</small>
              </div>
              <span className="fw-semibold">
                {snapshot.training.filter((record) => record.status === 'completed').length}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Recent Recorded Activity</CardTitle>
          </CardHeader>
          <CardBody>
            {recentActivity.length === 0 ? (
              <p className="text-muted mb-0">
                No assignments, schedules, equipment, performance, or training activity has been recorded for this guard yet.
              </p>
            ) : (
              recentActivity.map((event, index) => (
                <div
                  key={event.id}
                  className={index === recentActivity.length - 1 ? '' : 'border-bottom pb-3 mb-3'}
                >
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h6 className="mb-1">{event.title}</h6>
                      <p className="text-muted mb-1 fs-13">{event.detail}</p>
                    </div>
                    <span className="badge bg-light text-dark">{formatStatus(event.status)}</span>
                  </div>
                  <small className="text-muted">{formatDate(event.when)}</small>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default GuardDetails
