import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col, Row } from 'react-bootstrap'

const ServiceAddCard = () => {
  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="d-flex align-items-center gap-2 border-bottom pb-3">
            <div className="avatar-lg rounded-3 border border-light border-3 d-flex align-items-center justify-content-center bg-primary-subtle">
              <IconifyIcon icon="ri:customer-service-2-line" className="fs-24 text-primary" />
            </div>
            <div className="d-block">
              <Link href="" className="text-dark fw-medium fs-16">
                New Service
              </Link>
              <p className="mb-0">service@casanirvana.com</p>
              <p className="mb-0 text-primary"># New</p>
            </div>
          </div>
          <p className="mt-3 d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-18 text-primary" />
            Community-wide Service
          </p>
          <p className="d-flex align-items-center gap-2 mt-2">
            <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-18 text-primary" />
            Available 24/7
          </p>
          <h5 className="my-3">Service Categories :</h5>
          <div className="d-flex gap-2 flex-wrap">
            <span className="badge bg-primary-subtle text-primary">Maintenance</span>
            <span className="badge bg-success-subtle text-success">Cleaning</span>
            <span className="badge bg-info-subtle text-info">Security</span>
            <span className="badge bg-warning-subtle text-warning">Utilities</span>
          </div>
        </CardBody>
        <CardFooter className="bg-light-subtle">
          <Row className="g-2">
            <Col lg={6}>
              <Button variant="outline-primary" className="w-100">
                Preview
              </Button>
            </Col>
            <Col lg={6}>
              <Button variant="danger" className="w-100">
                Cancel
              </Button>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  )
}

export default ServiceAddCard
