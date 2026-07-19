import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col } from 'react-bootstrap'

type AgencyAddCardProps = {
  formId?: string
}

const AgencyAddCard = ({ formId = 'agency-directory-form' }: AgencyAddCardProps) => {
  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="d-flex align-items-start gap-2 border-bottom pb-3">
            <div className="avatar-lg rounded-3 border border-light border-3 d-flex align-items-center justify-content-center bg-soft-primary text-primary">
              <IconifyIcon icon="solar:buildings-3-bold-duotone" className="fs-28" />
            </div>
            <div className="d-block">
              <p className="text-dark fw-medium fs-16 mb-1">Agency Directory Provisioning</p>
              <p className="mb-1 text-muted">
                Create the agency directory record and its initial profile in one launch-safe flow.
              </p>
              <p className="mb-0 text-primary">Scope: People → Agency</p>
            </div>
          </div>

          <h5 className="my-3">What this does</h5>
          <ul className="ps-3 mb-0 text-muted">
            <li className="mb-2">Creates the base agency directory record.</li>
            <li className="mb-2">Seeds the matching operational agency profile.</li>
            <li className="mb-2">Creates the initial managed community records you define in the form.</li>
          </ul>
        </CardBody>
        <CardFooter>
          <div className="d-flex gap-2">
            <Link href="/agency/list-view" className="btn btn-outline-secondary btn-sm flex-fill">
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back
            </Link>
            <Button type="submit" form={formId} variant="primary" size="sm" className="flex-fill">
              <IconifyIcon icon="ri:building-line" className="me-1" />
              Create Agency
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Col>
  )
}

export default AgencyAddCard
