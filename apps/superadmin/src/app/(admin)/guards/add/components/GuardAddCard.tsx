import { avatars } from '@/assets/images/users'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col } from 'react-bootstrap'

type GuardAddCardProps = {
  formId?: string
}

const GuardAddCard = ({ formId = 'guard-provisioning-form' }: GuardAddCardProps) => {
  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="d-flex align-items-center gap-2 border-bottom pb-3">
            <Image src={avatars.dummyAvatar} alt="New guard avatar" width={64} height={64} className="avatar-lg rounded-3 border border-light border-3" />
            <div className="d-block">
              <p className="text-dark fw-medium fs-16 mb-0">New Guard Profile</p>
              <p className="mb-0 text-muted">Invite email not entered</p>
              <p className="mb-0 text-primary"># NEW</p>
            </div>
          </div>
          <p className="mt-3 d-flex align-items-center gap-2 mb-2"><IconifyIcon icon="solar:shield-check-bold-duotone" className="fs-18 text-primary" />Security Personnel</p>
          <p className="d-flex align-items-center gap-2 mt-2"><IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />Community assignment required</p>
          <h5 className="my-3">Guard Features :</h5>
          <ul className="list-inline d-flex gap-1 mb-0 align-items-center" aria-label="Guard provisioning capabilities">
            <li className="list-inline-item"><span className="btn btn-soft-primary avatar-sm d-flex align-items-center justify-content-center" title="Guard profile"><IconifyIcon width={20} height={20} icon="ri:shield-line" /></span></li>
            <li className="list-inline-item"><span className="btn btn-soft-danger avatar-sm d-flex align-items-center justify-content-center" title="Shift assignment"><IconifyIcon width={20} height={20} icon="ri:time-line" /></span></li>
            <li className="list-inline-item"><span className="btn btn-soft-info avatar-sm d-flex align-items-center justify-content-center" title="Contact details"><IconifyIcon width={20} height={20} icon="ri:phone-line" /></span></li>
            <li className="list-inline-item"><span className="btn btn-soft-success avatar-sm d-flex align-items-center justify-content-center" title="Community access"><IconifyIcon width={20} height={20} icon="ri:eye-line" /></span></li>
          </ul>
        </CardBody>
        <CardFooter>
          <div className="d-flex gap-2">
            <Link href="/guards" className="btn btn-outline-primary btn-sm flex-fill">
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back
            </Link>
            <Button type="submit" form={formId} variant="primary" size="sm" className="flex-fill">
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Send Invite
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Col>
  )
}

export default GuardAddCard
