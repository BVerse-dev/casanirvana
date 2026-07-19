import { Badge, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import type { Resident } from '@/hooks/useResidents'

type ResidentDetailsBannerProps = {
  resident: Resident
}

const ResidentDetailsBanner = ({ resident }: ResidentDetailsBannerProps) => {
  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between bg-light-subtle flex-wrap gap-2">
            <div>
              <CardTitle as={'h4'} className="mb-1">
                Resident - {resident.full_name}
              </CardTitle>
              <p className="mb-0 text-muted">
                {resident.communities?.name || 'No community assigned'}
                {resident.unit_number ? ` • Unit ${resident.unit_number}` : ''}
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Badge bg={resident.is_active ? 'success' : 'secondary'}>
                {resident.is_active ? 'Active Profile' : 'Inactive Profile'}
              </Badge>
              <Badge bg="primary">{resident.role === 'tenant' ? 'Tenant Record' : 'Resident Record'}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <Row className="g-3">
              <Col md={4}>
                <div className="rounded bg-light-subtle p-3 h-100">
                  <small className="text-uppercase text-muted d-block mb-1">Primary Contact</small>
                  <div className="fw-medium">{resident.email || 'Not provided'}</div>
                  <div className="text-muted">{resident.phone || resident.mobile || 'No phone on file'}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="rounded bg-light-subtle p-3 h-100">
                  <small className="text-uppercase text-muted d-block mb-1">Residence</small>
                  <div className="fw-medium">{resident.unit_number || 'No unit assigned'}</div>
                  <div className="text-muted">{resident.communities?.name || 'No community assigned'}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="rounded bg-light-subtle p-3 h-100">
                  <small className="text-uppercase text-muted d-block mb-1">Profile Status</small>
                  <div className="fw-medium text-capitalize">{resident.status}</div>
                  <div className="text-muted">Resident ID: {resident.id.slice(0, 8)}...</div>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default ResidentDetailsBanner
