"use client";
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useListAgencies } from '@/hooks/useAgencies'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'

const AgencyCard = ({ agency }: { agency: any }) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-2 border-bottom pb-3">
          <div className="avatar-lg rounded-3 border border-light border-3 bg-primary d-flex align-items-center justify-content-center">
            <IconifyIcon icon="ri:building-4-line" className="fs-24 text-white" />
          </div>
          <div className="d-block">
            <Link href={`/agency/details?id=${agency.id}`} className="text-dark fw-medium fs-16">
              {agency.name || 'Agency Name'}
            </Link>
            <p className="mb-0">{agency.description || 'No description'}</p>
            <p className="mb-0 text-primary"># {agency.id}</p>
          </div>
          <div className="ms-auto">
            <Dropdown>
              <DropdownToggle
                as={'a'}
                className="btn btn-sm btn-outline-light rounded arrow-none fs-16"
                data-bs-toggle="dropdown"
                aria-expanded="false">
                <IconifyIcon icon="ri:more-2-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem>View Details</DropdownItem>
                <DropdownItem>Edit</DropdownItem>
                <DropdownItem>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <p className="mt-3 d-flex align-items-center gap-2 mb-2">
          <IconifyIcon icon="solar:calendar-bold-duotone" className="fs-18 text-primary" />
          Created: {agency.created_at ? new Date(agency.created_at).toLocaleDateString() : 'Unknown'}
        </p>
        <p className="d-flex align-items-center gap-2 mt-2">
          <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />
          {agency.address || 'No address provided'}
        </p>
        <h5 className="my-3">Social Media :</h5>
        <ul className="list-inline d-flex gap-1 mb-0 align-items-center">
          <li className="list-inline-item">
            <Button variant="soft-primary" className="d-flex avatar-sm align-items-center justify-content-center fs-20">
              <span>
                {' '}
                <IconifyIcon icon="ri:facebook-fill" />
              </span>
            </Button>
          </li>
          <li className="list-inline-item">
            <Button variant="soft-danger" className="d-flex avatar-sm align-items-center justify-content-center fs-20">
              <span>
                {' '}
                <IconifyIcon icon="ri:instagram-line" />
              </span>
            </Button>
          </li>
          <li className="list-inline-item">
            <Button variant="soft-info" className="d-flex avatar-sm align-items-center justify-content-center  fs-20">
              <span>
                {' '}
                <IconifyIcon icon="ri:twitter-line" />
              </span>
            </Button>
          </li>
          <li className="list-inline-item">
            <Button variant="soft-success" className="d-flex avatar-sm align-items-center justify-content-center fs-20">
              <span>
                {' '}
                <IconifyIcon icon="ri:whatsapp-line" />
              </span>
            </Button>
          </li>
          <li className="list-inline-item">
            <Button variant="soft-warning" className="d-flex avatar-sm align-items-center justify-content-center fs-20">
              <span>
                {' '}
                <IconifyIcon icon="ri:mail-line" />
              </span>
            </Button>
          </li>
        </ul>
      </CardBody>
      <CardFooter className="border-top">
        <Row className="g-2">
          <Col lg={6}>
            <Button variant="primary" className="w-100">
              <IconifyIcon icon="solar:outgoing-call-rounded-broken" className="align-middle fs-18" /> Call Us
            </Button>
          </Col>
          <Col lg={6}>
            <Button variant="light" className="w-100">
              <IconifyIcon icon="solar:chat-round-dots-broken" className="align-middle fs-16" /> Message
            </Button>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  )
}

const AgencyData = () => {
  const { data: agencies = [] } = useListAgencies()
  
  return (
    <>
      <Row>
        {agencies.map((agency: any, idx: number) => (
          <Col xl={4} lg={6} key={idx}>
            <AgencyCard agency={agency} />
          </Col>
        ))}
      </Row>
    </>
  )
}

export default AgencyData
