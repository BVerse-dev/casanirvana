import IconifyIcon from '@/components/wrappers/IconifyIcon'
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
          <div className="d-flex align-items-start gap-2 border-bottom pb-3">
            <div className="avatar-lg rounded-3 border border-light border-3 d-flex align-items-center justify-content-center bg-soft-primary text-primary">
              <IconifyIcon icon="solar:shield-user-bold-duotone" className="fs-28" />
            </div>
            <div className="d-block">
              <p className="text-dark fw-medium fs-16 mb-1">Guard Account Provisioning</p>
              <p className="mb-1 text-muted">Create the guard profile, send the invite, and attach the first active assignment in one step.</p>
              <p className="mb-0 text-primary">Role: Guard</p>
            </div>
          </div>

          <h5 className="my-3">What this does</h5>
          <ul className="ps-3 mb-0 text-muted">
            <li className="mb-2">Sends the guard invite through Supabase Auth.</li>
            <li className="mb-2">Creates the matching profile and guard records.</li>
            <li className="mb-2">Creates the first community assignment for immediate onboarding.</li>
          </ul>
        </CardBody>
        <CardFooter>
          <div className="d-flex gap-2">
            <Link href="/guards" className="btn btn-outline-secondary btn-sm flex-fill">
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back
            </Link>
            <Button type="submit" form={formId} variant="primary" size="sm" className="flex-fill">
              <IconifyIcon icon="ri:user-add-line" className="me-1" />
              Send Invite
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Col>
  )
}

export default GuardAddCard
