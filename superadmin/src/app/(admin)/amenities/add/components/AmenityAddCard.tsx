import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col, Row } from 'react-bootstrap'

// Using a placeholder image for amenity
const amenityPlaceholder = '/images/amenity-placeholder.jpg'

const AmenityAddCard = () => {
  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="d-flex align-items-center gap-2 border-bottom pb-3">
            <div className="avatar-lg bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center">
              <IconifyIcon icon="ri:building-line" className="fs-28 text-primary" />
            </div>
            <div className="d-block">
              <Link href="" className="text-dark fw-medium fs-16">
                New Amenity
              </Link>
              <p className="mb-0">amenities@casanirvana.com</p>
              <p className="mb-0 text-primary"># NEW</p>
            </div>
          </div>
          <p className="mt-3 d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="ri:community-line" className="fs-18 text-primary" />
            Community Facility
          </p>
          <p className="d-flex align-items-center gap-2 mt-2">
            <IconifyIcon icon="ri:map-pin-line" className="fs-18 text-primary" />
            Casa Nirvana Societies
          </p>
          <h5 className="my-3">Amenity Features :</h5>
          <ul className="list-inline d-flex gap-1 mb-0 align-items-center">
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-primary avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:calendar-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Button variant="soft-success" className="avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:time-line" />
                </span>
              </Button>
            </li>
            <li className="list-inline-item">
              <Button variant="soft-info" className="avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:group-line" />
                </span>
              </Button>
            </li>
            <li className="list-inline-item">
              <Button variant="soft-warning" className="avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:money-rupee-circle-line" />
                </span>
              </Button>
            </li>
            <li className="list-inline-item">
              <Button variant="soft-danger" className="avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:settings-line" />
                </span>
              </Button>
            </li>
          </ul>
        </CardBody>
        <CardFooter className="bg-light-subtle">
          <Row className="g-0 text-center">
            <Col sm={6} className="border-end border-light">
              <div>
                <h5 className="mb-1">Booking</h5>
                <p className="text-muted mb-0">Management</p>
              </div>
            </Col>
            <Col sm={6}>
              <div>
                <h5 className="mb-1">Pricing</h5>
                <p className="text-muted mb-0">Configuration</p>
              </div>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  )
}

export default AmenityAddCard
