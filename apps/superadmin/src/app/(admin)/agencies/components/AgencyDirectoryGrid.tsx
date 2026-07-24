'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, Col, Dropdown, Row } from 'react-bootstrap'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { AgencyDirectoryItem } from '@/hooks/useAgencyDirectory'
import { getAgencyAvatar, getAgencyPropertyImage } from '@/utils/avatarMapper'

type Props = {
  agencies: AgencyDirectoryItem[]
  isLoading: boolean
  error: Error | null
  onDelete: (agency: AgencyDirectoryItem) => void
}

const SOCIAL_LINKS = [
  { key: 'facebook', icon: 'ri:facebook-fill', variant: 'soft-primary' },
  { key: 'instagram', icon: 'ri:instagram-line', variant: 'soft-danger' },
  { key: 'twitter', icon: 'ri:twitter-line', variant: 'soft-info' },
  { key: 'linkedin', icon: 'ri:linkedin-fill', variant: 'soft-primary' },
] as const

const AgencyCard = ({ agency, onDelete }: { agency: AgencyDirectoryItem; onDelete: (agency: AgencyDirectoryItem) => void }) => {
  const avatarImage = getAgencyAvatar(agency.logo_url ?? null)
  const bannerImage = getAgencyPropertyImage(agency)
  const socialMedia = agency.social_media || {}
  const availableSocialLinks = SOCIAL_LINKS.filter(
    (item) => typeof socialMedia[item.key] === 'string' && socialMedia[item.key]
  )

  return (
    <Card className="h-100">
      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
        <Image
          src={bannerImage}
          alt={`${agency.name} banner`}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-top"
        />
      </div>

      <Card.Body>
        <div className="d-flex flex-wrap align-items-center gap-2 border-bottom pb-3">
          {avatarImage ? (
            <Image
              src={avatarImage}
              alt={`${agency.name} logo`}
              width={48}
              height={48}
              className="avatar-md rounded-3 border border-light border-2"
            />
          ) : (
            <div className="avatar-md rounded-3 border border-light border-2 bg-primary d-flex align-items-center justify-content-center">
              <IconifyIcon icon="ri:building-4-line" className="fs-18 text-white" />
            </div>
          )}
          <div className="d-block flex-grow-1 min-w-0">
            <Link href={`/agencies/${agency.id}`} className="text-dark fw-medium fs-15">
              {agency.name || 'Agency Name'}
            </Link>
            <p className="mb-0 small text-muted">
              {agency.description
                ? agency.description.length > 50
                  ? `${agency.description.substring(0, 50)}...`
                  : agency.description
                : 'No description'}
            </p>
            <p className="mb-0 text-primary small"># {String(agency.id).slice(0, 8)}</p>
          </div>
          <div className="ms-auto">
            <Dropdown>
              <Dropdown.Toggle
                as="button"
                className="btn btn-sm btn-outline-light rounded arrow-none fs-16"
                aria-label={`Open actions for ${agency.name}`}
              >
                <IconifyIcon icon="ri:more-2-fill" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                <Dropdown.Item as={Link} href={`/agencies/${agency.id}`}>
                  View Details
                </Dropdown.Item>
                <Dropdown.Item as={Link} href={`/agency/manage?tab=profiles&agencyId=${agency.id}`}>
                  Manage
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onDelete(agency)}>Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <p className="mt-3 d-flex align-items-center gap-2 mb-2 small">
          <IconifyIcon icon="solar:calendar-bold-duotone" className="fs-16 text-primary" />
          Created: {agency.created_at ? new Date(agency.created_at).toLocaleDateString() : 'Unknown'}
        </p>
        <p className="d-flex align-items-center gap-2 mt-2 small">
          <IconifyIcon icon="solar:buildings-bold-duotone" className="fs-16 text-primary" />
          Communities: {agency.managed_societies || 0}
        </p>
        <div className="d-flex justify-content-between align-items-center my-3">
          <h6 className="mb-0 small">Social Media</h6>
          <span
            className={`badge bg-${agency.is_active ? 'success' : 'danger'}-subtle text-${agency.is_active ? 'success' : 'danger'} py-1 px-2 fs-12`}
          >
            {agency.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        {availableSocialLinks.length > 0 || agency.email ? (
          <ul className="list-inline d-flex gap-1 mb-0 align-items-center">
            {availableSocialLinks.map((item) => (
              <li className="list-inline-item" key={item.key}>
                <Button
                  as="a"
                  href={socialMedia[item.key]}
                  target="_blank"
                  rel="noreferrer"
                  variant={item.variant}
                  className="d-flex avatar-xs align-items-center justify-content-center fs-16"
                  aria-label={`${agency.name} ${item.key}`}
                >
                  <IconifyIcon icon={item.icon} />
                </Button>
              </li>
            ))}
            {agency.email ? (
              <li className="list-inline-item">
                <Button
                  as="a"
                  href={`mailto:${agency.email}`}
                  variant="soft-warning"
                  className="d-flex avatar-xs align-items-center justify-content-center fs-16"
                  aria-label={`Email ${agency.name}`}
                >
                  <IconifyIcon icon="ri:mail-line" />
                </Button>
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="text-muted small mb-0">No social or contact links configured.</p>
        )}
      </Card.Body>

      <Card.Footer className="border-top">
        <Row className="g-2">
          <Col xs={6}>
            <Button
              as="a"
              href={agency.phone ? `tel:${agency.phone}` : undefined}
              variant="primary"
              className="w-100 btn-sm"
              disabled={!agency.phone}
            >
              <IconifyIcon icon="solar:outgoing-call-rounded-broken" className="align-middle fs-16" /> Call Us
            </Button>
          </Col>
          <Col xs={6}>
            <Button
              as="a"
              href={agency.email ? `mailto:${agency.email}` : undefined}
              variant="light"
              className="w-100 btn-sm"
              disabled={!agency.email}
            >
              <IconifyIcon icon="solar:chat-round-dots-broken" className="align-middle fs-14" /> Message
            </Button>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  )
}

const AgencyDirectoryGrid = ({ agencies, isLoading, error, onDelete }: Props) => {
  if (isLoading) {
    return <Card><Card.Body className="text-center py-5">Loading agencies...</Card.Body></Card>
  }

  if (error) {
    return <Card><Card.Body className="text-center py-5 text-danger">{error.message}</Card.Body></Card>
  }

  if (agencies.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <IconifyIcon icon="ri:building-4-line" className="fs-48 text-muted mb-3" />
          <h5 className="text-muted">No agencies found</h5>
          <p className="text-muted">Adjust the current filters or add a new agency.</p>
          <Link href="/agencies/add" className="btn btn-primary">Add Agency</Link>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Row className="g-4">
      {agencies.map((agency) => (
        <Col xl={4} lg={6} key={agency.id} className="mb-4">
          <AgencyCard agency={agency} onDelete={onDelete} />
        </Col>
      ))}
    </Row>
  )
}

export default AgencyDirectoryGrid
