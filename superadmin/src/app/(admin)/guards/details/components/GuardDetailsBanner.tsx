import { Badge, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import type { GuardDetailSnapshot } from '@/hooks/useGuardDetailSnapshot'

const formatScore = (value: unknown) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toFixed(1) : '—'
}

type GuardDetailsBannerProps = {
  snapshot: GuardDetailSnapshot
}

const GuardDetailsBanner = ({ snapshot }: GuardDetailsBannerProps) => {
  const { guard, assignments, schedules, equipment, performance, training } = snapshot
  const latestPerformance = performance[0]
  const activeAssignment =
    assignments.find((assignment) => String(assignment.status || '').toLowerCase() === 'active') ||
    assignments[0]

  const metrics = [
    {
      label: 'Assignments',
      value: assignments.length,
      tone: 'primary',
      helpText: activeAssignment?.assignment_name || 'No assignment records',
    },
    {
      label: 'Schedules',
      value: schedules.length,
      tone: 'info',
      helpText: schedules.length > 0 ? 'Recorded shift schedules' : 'No schedules recorded',
    },
    {
      label: 'Equipment',
      value: equipment.length,
      tone: 'warning',
      helpText: equipment.length > 0 ? 'Assigned equipment records' : 'No equipment assigned',
    },
    {
      label: 'Latest Score',
      value: formatScore(latestPerformance?.overall_score),
      tone: 'success',
      helpText: latestPerformance?.evaluation_date || 'No performance reviews recorded',
    },
    {
      label: 'Training Records',
      value: training.length,
      tone: 'secondary',
      helpText: training.length > 0 ? 'Training and certification history' : 'No training records',
    },
  ]

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader className="bg-light-subtle">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <CardTitle as={'h4'} className="mb-1">
                  {guard.full_name || 'Guard'} - Live Operations Snapshot
                </CardTitle>
                <p className="text-muted mb-0">
                  Community: {guard.resolved_community_name || guard.societies?.name || 'Not assigned'}
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg={guard.is_active ? 'success' : 'secondary'}>
                  {guard.is_active ? 'Active Guard' : 'Inactive Guard'}
                </Badge>
                <Badge bg="primary">
                  {guard.assignment_status_label || 'Provisioning status unavailable'}
                </Badge>
                <Badge bg="dark">{guard.shift_type || guard.active_assignment_shift_type || 'Shift not set'}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Row className="g-3">
              {metrics.map((metric) => (
                <Col md={6} xl key={metric.label}>
                  <div className={`rounded border bg-${metric.tone}-subtle p-3 h-100`}>
                    <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">{metric.label}</p>
                    <h3 className="mb-1">{metric.value}</h3>
                    <small className="text-muted">{metric.helpText}</small>
                  </div>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default GuardDetailsBanner
