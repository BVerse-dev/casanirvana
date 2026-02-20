import avatar2 from '@/assets/images/users/avatar-2.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col, Row } from 'react-bootstrap'

const GuardAddCard = () => {
  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="d-flex align-items-center gap-2 border-bottom pb-3">
            <Image src={avatar2} alt="avatar" className="avatar-lg rounded-3 border border-light border-3" />
            <div className="d-block">
              <Link href="" className="text-dark fw-medium fs-16">
                New Guard Profile
              </Link>
              <p className="mb-0">security@casanirvana.com</p>
              <p className="mb-0 text-primary"># NEW</p>
            </div>
          </div>
          <p className="mt-3 d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="solar:shield-check-bold-duotone" className="fs-18 text-primary" />
            Security Personnel
          </p>
          <p className="d-flex align-items-center gap-2 mt-2">
            <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />
            Casa Nirvana Societies
          </p>
          <h5 className="my-3">Guard Features :</h5>
          <ul className="list-inline d-flex gap-1 mb-0 align-items-center">
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-primary avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:shield-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Button variant="soft-danger" className="avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:time-line" />
                </span>
              </Button>
            </li>
            <li className="list-inline-item">
              <Button variant="soft-info" className="avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:phone-line" />
                </span>
              </Button>
            </li>
            <li className="list-inline-item">
              <Button variant="soft-success" className="avatar-sm d-flex align-items-center justify-content-center">
                <span>
                  <IconifyIcon width={20} height={20} icon="ri:eye-line" />
                </span>
              </Button>
            </li>
          </ul>
        </CardBody>
        <CardFooter>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" className="flex-fill">
              <IconifyIcon icon="ri:eye-line" className="me-1" />
              Preview
            </Button>
            <Button variant="primary" size="sm" className="flex-fill">
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Guard
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Col>
  )
}

export default GuardAddCard
