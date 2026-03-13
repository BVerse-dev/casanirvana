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
              <Link href="/services" className="text-dark fw-medium fs-16">
                Service Draft
              </Link>
              <p className="mb-0">Scoped to the community you select in the form.</p>
              <p className="mb-0 text-primary">Launch-safe creation flow</p>
            </div>
          </div>
          <p className="mt-3 d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-18 text-primary" />
            Service catalog record
          </p>
          <p className="d-flex align-items-center gap-2 mt-2">
            <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-18 text-primary" />
            Availability and pricing are saved with the record
          </p>
          <h5 className="my-3">What This Form Saves:</h5>
          <ul className="text-muted ps-3 mb-0">
            <li>Service name, category, and description</li>
            <li>Community scope and active status</li>
            <li>Base price and feature flags</li>
          </ul>
        </CardBody>
        <CardFooter className="bg-light-subtle">
          <Row className="g-2">
            <Col lg={6}>
              <Link href="/services" className="btn btn-outline-primary w-100">
                Back to Services
              </Link>
            </Col>
            <Col lg={6}>
              <Button variant="soft-success" className="w-100" disabled>
                Media Later
              </Button>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  )
}

export default ServiceAddCard
