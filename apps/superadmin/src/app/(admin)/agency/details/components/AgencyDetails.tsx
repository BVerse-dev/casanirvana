'use client'

import Link from 'next/link'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Table } from 'react-bootstrap'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { AgencyDirectoryItem, AgencyDirectorySummary } from '@/hooks/useAgencyDirectory'

const formatDate = (value?: string | null) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const formatAmount = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0.00'
  return new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const resolveText = (...values: Array<string | null | undefined>) => {
  const value = values.find((entry) => typeof entry === 'string' && entry.trim().length > 0)
  return value?.trim() || 'Not set'
}

const statusVariant = (value?: string | null) => {
  if (!value) return 'secondary'
  const normalized = value.toLowerCase()
  if (normalized === 'active' || normalized === 'completed') return 'success'
  if (normalized === 'inactive' || normalized === 'cancelled') return 'secondary'
  if (normalized === 'pending' || normalized === 'draft') return 'warning'
  return 'primary'
}

type AgencyDetailsProps = {
  agency: AgencyDirectoryItem
  profile: AgencyDirectorySummary['profile']
  stats: AgencyDirectorySummary['stats']
}

const AgencyDetails = ({ agency, profile, stats }: AgencyDetailsProps) => {
  const socialLinks = [
    { key: 'facebook', label: 'Facebook', href: agency.social_media?.facebook },
    { key: 'instagram', label: 'Instagram', href: agency.social_media?.instagram },
    { key: 'twitter', label: 'Twitter / X', href: agency.social_media?.twitter },
    { key: 'linkedin', label: 'LinkedIn', href: agency.social_media?.linkedin },
  ].filter((entry) => entry.href)

  return (
    <Row className="g-4">
      <Col xl={8}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-transparent border-bottom">
            <CardTitle className="mb-1">Agency overview</CardTitle>
            <p className="text-muted mb-0">Production record for the selected agency. All values below are sourced from the agency directory and agency profile tables.</p>
          </CardHeader>
          <CardBody>
            <Row className="g-4">
              <Col lg={12}>
                <div className="border rounded-3 p-3 bg-light-subtle">
                  <h5 className="mb-2">Description</h5>
                  <p className="text-muted mb-0">{resolveText(agency.description, profile?.description, 'No agency description has been added yet.')}</p>
                </div>
              </Col>
              <Col lg={6}>
                <Table responsive borderless className="mb-0">
                  <tbody>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Agency type</th>
                      <td className="pe-0 text-end">{resolveText(profile?.agency_type, agency.agency_type)}</td>
                    </tr>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">License number</th>
                      <td className="pe-0 text-end">{resolveText(agency.license_number, profile?.license_number)}</td>
                    </tr>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Registration number</th>
                      <td className="pe-0 text-end">{resolveText(agency.registration_number)}</td>
                    </tr>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Established</th>
                      <td className="pe-0 text-end">{formatDate(agency.establishment_date || profile?.established_year?.toString())}</td>
                    </tr>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Website</th>
                      <td className="pe-0 text-end">
                        {agency.website ? (
                          <a href={agency.website} target="_blank" rel="noreferrer" className="link-primary">
                            {agency.website}
                          </a>
                        ) : (
                          'Not set'
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col lg={6}>
                <Table responsive borderless className="mb-0">
                  <tbody>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Primary contact</th>
                      <td className="pe-0 text-end">{resolveText(agency.contact_person, profile?.owner_name, profile?.manager_name)}</td>
                    </tr>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Email</th>
                      <td className="pe-0 text-end">{resolveText(agency.email, profile?.email)}</td>
                    </tr>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Phone</th>
                      <td className="pe-0 text-end">{resolveText(agency.phone, profile?.phone)}</td>
                    </tr>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Address</th>
                      <td className="pe-0 text-end">{resolveText(agency.address)}</td>
                    </tr>
                    <tr>
                      <th className="ps-0 text-muted fw-medium">Status</th>
                      <td className="pe-0 text-end">
                        <Badge bg={agency.is_active ? 'success' : 'secondary'}>
                          {agency.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>

      <Col xl={4}>
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="bg-transparent border-bottom">
            <CardTitle className="mb-0">Operational snapshot</CardTitle>
          </CardHeader>
          <CardBody>
            <Row className="g-3">
              <Col xs={6}>
                <div className="border rounded-3 p-3 h-100">
                  <p className="text-muted mb-1 small">Communities</p>
                  <h4 className="mb-0">{stats.communities_count}</h4>
                </div>
              </Col>
              <Col xs={6}>
                <div className="border rounded-3 p-3 h-100">
                  <p className="text-muted mb-1 small">Units</p>
                  <h4 className="mb-0">{stats.units_count}</h4>
                </div>
              </Col>
              <Col xs={6}>
                <div className="border rounded-3 p-3 h-100">
                  <p className="text-muted mb-1 small">Staff records</p>
                  <h4 className="mb-0">{stats.staff_count}</h4>
                </div>
              </Col>
              <Col xs={6}>
                <div className="border rounded-3 p-3 h-100">
                  <p className="text-muted mb-1 small">Services</p>
                  <h4 className="mb-0">{stats.services_count}</h4>
                </div>
              </Col>
              <Col xs={6}>
                <div className="border rounded-3 p-3 h-100">
                  <p className="text-muted mb-1 small">Documents</p>
                  <h4 className="mb-0">{stats.documents_count}</h4>
                </div>
              </Col>
              <Col xs={6}>
                <div className="border rounded-3 p-3 h-100">
                  <p className="text-muted mb-1 small">Finance total</p>
                  <h4 className="mb-0">{formatAmount(stats.finance_total_amount)}</h4>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-transparent border-bottom">
            <CardTitle className="mb-0">Quick actions</CardTitle>
          </CardHeader>
          <CardBody className="d-grid gap-2">
            <Link href={`/agency/manage?tab=profiles&agencyId=${agency.id}`} className="btn btn-primary">
              <IconifyIcon icon="solar:settings-bold-duotone" className="me-2" /> Manage agency profile
            </Link>
            <Link href={`/agency/manage?tab=staff&agencyId=${agency.id}`} className="btn btn-light">
              <IconifyIcon icon="solar:users-group-rounded-bold-duotone" className="me-2" /> Manage staff
            </Link>
            <Link href={`/agency/manage?tab=services&agencyId=${agency.id}`} className="btn btn-light">
              <IconifyIcon icon="solar:box-bold-duotone" className="me-2" /> Manage services
            </Link>
            <Link href={`/agency/manage?tab=documents&agencyId=${agency.id}`} className="btn btn-light">
              <IconifyIcon icon="solar:document-bold-duotone" className="me-2" /> Manage documents
            </Link>
            {agency.phone ? (
              <Button as="a" href={`tel:${agency.phone}`} variant="outline-primary">
                <IconifyIcon icon="solar:outgoing-call-rounded-broken" className="me-2" /> Call agency
              </Button>
            ) : null}
            {agency.email ? (
              <Button as="a" href={`mailto:${agency.email}`} variant="outline-primary">
                <IconifyIcon icon="solar:letter-bold-duotone" className="me-2" /> Email agency
              </Button>
            ) : null}
          </CardBody>
        </Card>

        <Card className="border-0 shadow-sm mt-4">
          <CardHeader className="bg-transparent border-bottom">
            <CardTitle className="mb-0">Channels</CardTitle>
          </CardHeader>
          <CardBody>
            {socialLinks.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <Button key={link.key} as="a" href={link.href!} target="_blank" rel="noreferrer" variant="soft-primary" size="sm">
                    {link.label}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">No social media channels have been configured for this agency.</p>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default AgencyDetails
