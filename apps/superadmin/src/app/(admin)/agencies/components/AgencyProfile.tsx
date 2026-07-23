'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import AgencyDetails from '../../agency/details/components/AgencyDetails'
import AgencyDetailsBanner from '../../agency/details/components/AgencyDetailsBanner'
import { useGetAgencyDirectorySummary } from '@/hooks/useAgencyDirectory'

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

const statusVariant = (value?: string | null) => {
  if (!value) return 'secondary'
  const normalized = value.toLowerCase()
  if (normalized === 'active' || normalized === 'completed') return 'success'
  if (normalized === 'inactive' || normalized === 'cancelled') return 'secondary'
  if (normalized === 'pending' || normalized === 'draft') return 'warning'
  return 'primary'
}

const EmptyState = ({ title, description, ctaHref, ctaLabel }: { title: string; description: string; ctaHref?: string; ctaLabel?: string }) => (
  <Card className="border-0 shadow-sm">
    <CardBody className="text-center py-5">
      <div className="avatar-lg bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
        <IconifyIcon icon="solar:folder-open-bold-duotone" className="fs-24 text-primary" />
      </div>
      <h5>{title}</h5>
      <p className="text-muted mb-0">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className="btn btn-primary mt-3">
          {ctaLabel}
        </Link>
      ) : null}
    </CardBody>
  </Card>
)

const AgencyProfile = ({ agencyId }: { agencyId: string }) => {
  const [activeTab, setActiveTab] = useState<string>('overview')

  const { data: summary, isLoading, error } = useGetAgencyDirectorySummary(agencyId || '')

  if (!agencyId) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Agency Details" />
        <Row>
          <Col lg={12}>
            <Alert variant="warning">No agency ID provided. Select an agency from the list or grid view.</Alert>
          </Col>
        </Row>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Agency Details" />
        <Row>
          <Col lg={12} className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 mb-0">Loading agency details...</p>
          </Col>
        </Row>
      </>
    )
  }

  if (error || !summary) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Agency Details" />
        <Row>
          <Col lg={12}>
            <Alert variant="danger">
              <h5 className="mb-1">Unable to load agency details</h5>
              <p className="mb-0">{error instanceof Error ? error.message : 'Agency details could not be loaded.'}</p>
            </Alert>
          </Col>
        </Row>
      </>
    )
  }

  const { agency, stats, communities, finance, activities, staff, services, documents, profile } = summary

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Agency Details" />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <Link href="/agencies" className="btn btn-outline-primary">
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" /> Back to agencies
            </Link>
            <div className="d-flex gap-2">
              <Link href={`/agencies/${agency.id}/edit`} className="btn btn-outline-primary">
                <IconifyIcon icon="solar:pen-bold-duotone" className="me-1" /> Edit agency
              </Link>
              <Link href={`/agency/manage?tab=profiles&agencyId=${agency.id}`} className="btn btn-primary">
                <IconifyIcon icon="solar:settings-bold-duotone" className="me-1" /> Manage agency
              </Link>
              <Link href="/agencies" className="btn btn-light">
                <IconifyIcon icon="solar:list-bold-duotone" className="me-1" /> Directory
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      <AgencyDetailsBanner agency={agency} stats={stats} />

      <Row className="mb-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="p-0">
              <Nav variant="tabs" className="nav-tabs-custom border-bottom-0">
                {[
                  ['overview', 'Overview', 'solar:buildings-2-bold-duotone'],
                  ['communities', 'Communities', 'solar:home-2-bold-duotone'],
                  ['analytics', 'Analytics', 'solar:chart-2-bold-duotone'],
                  ['financials', 'Financials', 'solar:wallet-money-bold-duotone'],
                  ['activities', 'Activities', 'solar:clock-circle-bold-duotone'],
                  ['management', 'Management', 'solar:settings-bold-duotone'],
                ].map(([key, label, icon]) => (
                  <NavItem key={key}>
                    <NavLink className={`px-4 py-3 ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)} style={{ cursor: 'pointer' }}>
                      <IconifyIcon icon={icon} className="me-2" />
                      {label}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {activeTab === 'overview' ? <AgencyDetails agency={agency} profile={profile} stats={stats} /> : null}

      {activeTab === 'communities' ? (
        communities.length > 0 ? (
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-transparent border-bottom d-flex justify-content-between align-items-center">
              <div>
                <CardTitle className="mb-1">Managed communities</CardTitle>
                <p className="text-muted mb-0">Live communities assigned to this agency.</p>
              </div>
              <Badge bg="primary">{communities.length} communities</Badge>
            </CardHeader>
            <CardBody className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Community</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map((community) => (
                    <tr key={community.id}>
                      <td>
                        <div className="fw-medium">{community.name || 'Unnamed community'}</div>
                        <div className="text-muted small">{community.address || 'No address configured'}</div>
                      </td>
                      <td>{[community.city, community.state, community.country].filter(Boolean).join(', ') || 'Not set'}</td>
                      <td>
                        <Badge bg={statusVariant(community.status)}>{community.status || 'unknown'}</Badge>
                      </td>
                      <td>{formatDate(community.created_at)}</td>
                      <td className="text-end">
                        <Link href={`/communities/${community.id}`} className="btn btn-light btn-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        ) : (
          <EmptyState
            title="No communities linked"
            description="This agency does not yet have any assigned communities in the directory."
            ctaHref="/communities/add"
            ctaLabel="Add community"
          />
        )
      ) : null}

      {activeTab === 'analytics' ? (
        <Row className="g-4">
          {[
            ['Communities', stats.communities_count, 'solar:buildings-2-bold-duotone'],
            ['Active communities', stats.active_communities_count, 'solar:check-circle-bold-duotone'],
            ['Inactive communities', stats.inactive_communities_count, 'solar:close-circle-bold-duotone'],
            ['Units covered', stats.units_count, 'solar:home-2-bold-duotone'],
            ['Staff records', stats.staff_count, 'solar:users-group-rounded-bold-duotone'],
            ['Documents', stats.documents_count, 'solar:document-bold-duotone'],
          ].map(([label, value, icon]) => (
            <Col xl={4} md={6} key={label}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1">{label}</p>
                      <h3 className="mb-0">{value}</h3>
                    </div>
                    <div className="avatar-md bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                      <IconifyIcon icon={icon as string} className="fs-24 text-primary" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      ) : null}

      {activeTab === 'financials' ? (
        <Row className="g-4">
          <Col xl={4}>
            <Card className="border-0 shadow-sm h-100">
              <CardHeader className="bg-transparent border-bottom">
                <CardTitle className="mb-0">Finance summary</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="border rounded-3 p-3 mb-3">
                  <p className="text-muted mb-1">Ledger entries</p>
                  <h3 className="mb-0">{stats.finance_entries_count}</h3>
                </div>
                <div className="border rounded-3 p-3">
                  <p className="text-muted mb-1">Total recorded amount</p>
                  <h3 className="mb-0">{formatAmount(stats.finance_total_amount)}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={8}>
            {finance.length > 0 ? (
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom">
                  <CardTitle className="mb-0">Latest finance entries</CardTitle>
                </CardHeader>
                <CardBody className="p-0">
                  <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finance.map((entry) => (
                        <tr key={entry.id}>
                          <td>{formatDate(entry.date || entry.created_at)}</td>
                          <td>{entry.type || '—'}</td>
                          <td>{entry.category || '—'}</td>
                          <td>{formatAmount(typeof entry.amount === 'number' ? entry.amount : Number(entry.amount || 0))}</td>
                          <td>
                            <Badge bg={statusVariant(entry.status)}>{entry.status || 'unknown'}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            ) : (
              <EmptyState
                title="No finance entries"
                description="Finance and billing entries will appear here when agency-level finance records are created."
                ctaHref={`/agency/manage?tab=finance&agencyId=${agency.id}`}
                ctaLabel="Open finance workspace"
              />
            )}
          </Col>
        </Row>
      ) : null}

      {activeTab === 'activities' ? (
        activities.length > 0 ? (
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-transparent border-bottom">
              <CardTitle className="mb-0">Recent agency activity</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="border rounded-3 p-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Badge bg={statusVariant(activity.status)}>{activity.type}</Badge>
                          <span className="text-muted small">{formatDate(activity.occurred_at)}</span>
                        </div>
                        <h6 className="mb-1">{activity.title}</h6>
                        <p className="text-muted mb-0">{activity.description}</p>
                      </div>
                      {activity.href ? (
                        <Link href={activity.href} className="btn btn-light btn-sm">
                          Open
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ) : (
          <EmptyState title="No recent activity" description="Agency activity will appear here after records start changing across staff, services, documents, finance, and communities." />
        )
      ) : null}

      {activeTab === 'management' ? (
        <Row className="g-4">
          {[
            {
              title: 'Agency profile',
              description: 'Review the agency directory profile and confirm tenant-scoped visibility.',
              href: `/agency/manage?tab=profiles&agencyId=${agency.id}`,
              cta: 'Open profile workspace',
            },
            {
              title: 'Staff management',
              description: `${staff.length} recent staff records loaded for this agency.`,
              href: `/agency/manage?tab=staff&agencyId=${agency.id}`,
              cta: 'Manage staff',
            },
            {
              title: 'Services management',
              description: `${services.length} recent service records loaded for this agency.`,
              href: `/agency/manage?tab=services&agencyId=${agency.id}`,
              cta: 'Manage services',
            },
            {
              title: 'Documents & records',
              description: `${documents.length} recent document records loaded for this agency.`,
              href: `/agency/manage?tab=documents&agencyId=${agency.id}`,
              cta: 'Manage documents',
            },
          ].map((item) => (
            <Col xl={6} key={item.title}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody className="d-flex flex-column">
                  <CardTitle className="mb-2">{item.title}</CardTitle>
                  <p className="text-muted flex-grow-1">{item.description}</p>
                  <Link href={item.href} className="btn btn-primary">
                    {item.cta}
                  </Link>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      ) : null}
    </>
  )
}

export default AgencyProfile
