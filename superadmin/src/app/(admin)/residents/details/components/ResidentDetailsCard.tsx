'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Alert, Button, Card, CardBody, CardTitle, Col, Row, Table } from 'react-bootstrap'

import { avatars } from '@/assets/images/users'
import { useResidentActivitySnapshot } from '@/hooks/useResidentActivities'
import { useResidentDirectoryEntries } from '@/hooks/useResidentDirectoryEntries'
import type { Resident } from '@/hooks/useResidents'
import { mapAvatarUrl } from '@/utils/avatarMapper'

type ResidentDetailsCardProps = {
  resident: Resident
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Not available'
  return new Date(value).toLocaleString()
}

const StatusBadge = ({ isActive }: { isActive?: boolean | null }) => {
  const active = isActive !== false
  return (
    <span className={`badge bg-${active ? 'success' : 'secondary'}-subtle text-${active ? 'success' : 'secondary'} py-1 px-2`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

const DirectorySection = ({
  title,
  icon,
  columns,
  count,
  children,
}: {
  title: string
  icon: string
  columns: string[]
  count: number
  children: React.ReactNode
}) => (
  <Card className="mb-3 border shadow-none">
    <CardBody>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <IconifyIcon icon={icon} className="text-primary" />
          {title}
        </h5>
        <span className="badge bg-primary-subtle text-primary">{count}</span>
      </div>
      <div className="table-responsive">
        <Table size="sm" className="align-middle mb-0">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </Table>
      </div>
    </CardBody>
  </Card>
)

const ResidentDetailsCard = ({ resident }: ResidentDetailsCardProps) => {
  const activityQuery = useResidentActivitySnapshot(resident.id)
  const directoryQuery = useResidentDirectoryEntries(resident.id)
  const activitySummary = activityQuery.data?.summary
  const recentActivity = activityQuery.data?.recent || []
  const directory = directoryQuery.data

  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="position-relative">
            {resident.avatar_url ? (
              <Image
                src={mapAvatarUrl(resident.avatar_url) || avatars.dummyAvatar}
                alt="avatar"
                className="avatar-xl user-img img-thumbnail rounded-circle"
                width={80}
                height={80}
              />
            ) : (
              <div className="avatar-xl user-img img-thumbnail rounded-circle bg-light-subtle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:user-line" className="fs-32" />
              </div>
            )}
            <div className={`badge bg-${resident.is_active ? 'success' : 'danger'} rounded-2 position-absolute bottom-0 start-50 translate-middle-x mb-n1 fs-11`}>
              {resident.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="d-block">
            <h4 className="mb-1">{resident.full_name}</h4>
            <p className="mb-1 text-muted">{resident.email || 'No email on file'}</p>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge bg-primary-subtle text-primary text-capitalize">
                {resident.role === 'tenant' ? 'Tenant' : 'Resident'}
              </span>
              <span className="badge bg-light text-dark text-capitalize">{resident.status}</span>
            </div>
          </div>
          <div className="ms-lg-auto d-flex gap-2 flex-wrap">
            <Button variant="outline-secondary" disabled title="Start resident chats from the Messages & Chats module.">
              Message
            </Button>
            <Link href={`/residents/edit?id=${resident.id}`} className="btn btn-primary">
              Edit Profile
            </Link>
          </div>
        </div>

        <Row className="mt-4 g-3">
          <Col md={6}>
            <div className="rounded border p-3 h-100">
              <CardTitle as={'h5'} className="mb-3">
                Core Profile
              </CardTitle>
              <p className="mb-2">
                <span className="fw-medium text-dark">Phone:</span> {resident.phone || resident.mobile || 'Not provided'}
              </p>
              <p className="mb-2">
                <span className="fw-medium text-dark">Community:</span> {resident.communities?.name || 'Not assigned'}
              </p>
              <p className="mb-2">
                <span className="fw-medium text-dark">Unit:</span> {resident.unit_number || 'Not assigned'}
              </p>
              <p className="mb-2">
                <span className="fw-medium text-dark">Emergency Contact:</span>{' '}
                {[resident.emergency_contact_name, resident.emergency_contact_phone].filter(Boolean).join(' | ') || 'Not provided'}
              </p>
              <p className="mb-0">
                <span className="fw-medium text-dark">Address:</span> {resident.address || 'Not provided'}
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className="rounded border p-3 h-100">
              <CardTitle as={'h5'} className="mb-3">
                Audit Trail
              </CardTitle>
              <p className="mb-2">
                <span className="fw-medium text-dark">Resident ID:</span> {resident.id}
              </p>
              <p className="mb-2">
                <span className="fw-medium text-dark">Created:</span> {formatDate(resident.created_at)}
              </p>
              <p className="mb-2">
                <span className="fw-medium text-dark">Last Updated:</span> {formatDate(resident.updated_at)}
              </p>
              <p className="mb-0">
                <span className="fw-medium text-dark">Profile Status:</span>{' '}
                <StatusBadge isActive={resident.is_active} />
              </p>
            </div>
          </Col>
        </Row>

        <div className="mt-4">
          <CardTitle as={'h4'} className="mb-3">
            Resident Activity
          </CardTitle>
          {activityQuery.isLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : activityQuery.error ? (
            <Alert variant="warning" className="mb-0">
              Unable to load resident activity right now.
            </Alert>
          ) : (
            <>
              <Row className="g-3 mb-3">
                <Col md={3} sm={6}>
                  <Card className="border shadow-none h-100">
                    <CardBody>
                      <small className="text-uppercase text-muted d-block mb-1">Requests</small>
                      <h4 className="mb-0">{activitySummary?.totalRequests || 0}</h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="border shadow-none h-100">
                    <CardBody>
                      <small className="text-uppercase text-muted d-block mb-1">Completed Payments</small>
                      <h4 className="mb-0">{activitySummary?.completedPayments || 0}</h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="border shadow-none h-100">
                    <CardBody>
                      <small className="text-uppercase text-muted d-block mb-1">Open Service Requests</small>
                      <h4 className="mb-0">{activitySummary?.activeServices || 0}</h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="border shadow-none h-100">
                    <CardBody>
                      <small className="text-uppercase text-muted d-block mb-1">Pending Payments</small>
                      <h4 className="mb-0">{activitySummary?.pendingPayments || 0}</h4>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <tr key={`${activity.type}-${activity.id}`}>
                          <td className="text-capitalize">{activity.type}</td>
                          <td>
                            <div className="fw-medium">{activity.title}</div>
                            <small className="text-muted">{activity.description || 'No extra details'}</small>
                          </td>
                          <td className="text-capitalize">{activity.status || 'unknown'}</td>
                          <td>{typeof activity.amount === 'number' ? activity.amount.toLocaleString() : '—'}</td>
                          <td>{formatDate(activity.created_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-3">
                          No recent resident activity found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </div>

        <div className="mt-4">
          <CardTitle as={'h4'} className="mb-3">
            Resident Access Directory
          </CardTitle>
          {directoryQuery.isLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : directoryQuery.error ? (
            <Alert variant="warning" className="mb-0">
              Unable to load resident directory entries right now.
            </Alert>
          ) : (
            <>
              <DirectorySection
                title="Family Members"
                icon="solar:users-group-two-rounded-bold-duotone"
                columns={['Name', 'Relation', 'Phone', 'Entry Code', 'Added On', 'Status']}
                count={directory?.familyMembers.length || 0}
              >
                {directory?.familyMembers.length ? (
                  directory.familyMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name || '—'}</td>
                      <td>{member.relation || '—'}</td>
                      <td>{member.phone || '—'}</td>
                      <td>{member.entry_code || '—'}</td>
                      <td>{formatDate(member.created_at)}</td>
                      <td>
                        <StatusBadge isActive={member.is_active} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No family members added yet.
                    </td>
                  </tr>
                )}
              </DirectorySection>

              <DirectorySection
                title="Daily Help"
                icon="solar:shield-user-bold-duotone"
                columns={['Name', 'Type', 'Phone', 'Entry Code', 'Added On', 'Status']}
                count={directory?.dailyHelp.length || 0}
              >
                {directory?.dailyHelp.length ? (
                  directory.dailyHelp.map((helper) => (
                    <tr key={helper.id}>
                      <td>{helper.name || '—'}</td>
                      <td>{helper.type || '—'}</td>
                      <td>{helper.phone || '—'}</td>
                      <td>{helper.entry_code || '—'}</td>
                      <td>{formatDate(helper.created_at)}</td>
                      <td>
                        <StatusBadge isActive={helper.is_active} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No daily help records found.
                    </td>
                  </tr>
                )}
              </DirectorySection>

              <DirectorySection
                title="Vehicles"
                icon="solar:bus-bold-duotone"
                columns={['Vehicle Number', 'Model', 'Color', 'Entry Code', 'Added On', 'Status']}
                count={directory?.vehicles.length || 0}
              >
                {directory?.vehicles.length ? (
                  directory.vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>{vehicle.vehicle_number || '—'}</td>
                      <td>{vehicle.model || '—'}</td>
                      <td>{vehicle.color || '—'}</td>
                      <td>{vehicle.entry_code || '—'}</td>
                      <td>{formatDate(vehicle.created_at)}</td>
                      <td>
                        <StatusBadge isActive={vehicle.is_active} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No vehicles registered yet.
                    </td>
                  </tr>
                )}
              </DirectorySection>

              <DirectorySection
                title="Frequent Entries"
                icon="solar:user-check-bold-duotone"
                columns={['Name', 'Relation / Description', 'Phone', 'Entry Code', 'Added On', 'Status']}
                count={directory?.frequentEntries.length || 0}
              >
                {directory?.frequentEntries.length ? (
                  directory.frequentEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.name || '—'}</td>
                      <td>{entry.relation || '—'}</td>
                      <td>{entry.phone || '—'}</td>
                      <td>{entry.entry_code || '—'}</td>
                      <td>{formatDate(entry.created_at)}</td>
                      <td>
                        <StatusBadge isActive={entry.is_active} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No frequent entry records found.
                    </td>
                  </tr>
                )}
              </DirectorySection>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default ResidentDetailsCard
