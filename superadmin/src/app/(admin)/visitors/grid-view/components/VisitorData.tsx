'use client'

import { Card, CardBody, Col, Row } from 'react-bootstrap'
import VisitorGridCard from './VisitorGridCard'

interface VisitorDataProps {
  visitors: any[]
  isLoading: boolean
  error: unknown
}

const VisitorData = ({ visitors, isLoading, error }: VisitorDataProps) => {

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div>Loading visitors...</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="text-danger">Error loading visitors</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (visitors.length === 0) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="text-muted">No visitors found</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <Row className="g-4 mt-1 align-items-stretch">
      {visitors.map((visitor) => (
        <Col md={6} xl={4} key={visitor.id} className="d-flex">
          <VisitorGridCard visitor={visitor} />
        </Col>
      ))}
    </Row>
  )
}

export default VisitorData
