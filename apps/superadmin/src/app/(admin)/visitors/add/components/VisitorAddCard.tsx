'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Badge, Card, CardBody, CardHeader, CardTitle, Col } from 'react-bootstrap'

const VisitorAddCard = () => {
  return (
    <Col xl={3} lg={4}>
      <Card className="h-100">
        <CardHeader>
          <CardTitle as="h5" className="mb-0 d-flex align-items-center gap-2">
            <IconifyIcon icon="ri:shield-user-line" className="text-primary" />
            Visitor Pass Checklist
          </CardTitle>
        </CardHeader>
        <CardBody className="d-flex flex-column gap-4">
          <div>
            <h6 className="text-uppercase fs-12 text-muted mb-2">Creation Standard</h6>
            <ul className="mb-0 ps-3 text-muted fs-14">
              <li>Select the visitor type first.</li>
              <li>Use the exact unit for community scoping.</li>
              <li>Visit date must be today or later.</li>
              <li>Gate pass QR and entry code are generated automatically.</li>
            </ul>
          </div>

          <div>
            <h6 className="text-uppercase fs-12 text-muted mb-2">Lifecycle States</h6>
            <div className="d-flex flex-wrap gap-2">
              <Badge bg="warning-subtle" text="warning" className="border border-warning-subtle">
                Pending
              </Badge>
              <Badge bg="success-subtle" text="success" className="border border-success-subtle">
                Approved
              </Badge>
              <Badge bg="info-subtle" text="info" className="border border-info-subtle">
                Checked In
              </Badge>
              <Badge bg="secondary-subtle" text="secondary" className="border border-secondary-subtle">
                Checked Out
              </Badge>
            </div>
          </div>

          <div className="border rounded p-3 bg-light-subtle">
            <div className="d-flex align-items-start gap-2">
              <IconifyIcon icon="ri:information-line" className="text-primary fs-18 mt-1" />
              <p className="mb-0 text-muted fs-13">
                This screen is aligned with user-app visitor creation so records, status flow, and QR payload stay consistent across user, guard, and superadmin apps.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

export default VisitorAddCard
