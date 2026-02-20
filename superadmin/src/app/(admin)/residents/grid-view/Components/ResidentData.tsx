'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { useDeleteResident, type Resident } from '@/hooks/useResidents'
import { mapAvatarUrl } from '@/utils/avatarMapper'
import { avatars } from '@/assets/images/users'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ResidentDataProps {
  residents: Resident[]
  isLoading: boolean
  error: Error | null
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  totalCount: number
}

const ResidentCard = ({ id, full_name, email, phone, avatar_url, units, societies, is_active, unit_number }: Resident) => {
  const [showActions, setShowActions] = useState(false)
  const deleteResidentMutation = useDeleteResident()
  const mappedAvatarUrl = mapAvatarUrl(avatar_url) || avatars.dummyAvatar

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${full_name}?`)) {
      try {
        await deleteResidentMutation.mutateAsync(id)
        toast.success('Resident deleted successfully')
      } catch (error) {
        toast.error('Failed to delete resident')
      }
    }
  }

  return (
    <Card className="h-100">
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-2 border-bottom pb-3">
          <Image src={mappedAvatarUrl} alt="avatar" width={64} height={64} className="avatar-lg rounded-3 border border-light border-3" />
          <div className="d-block flex-grow-1">
            <Link href={`/residents/details?id=${id}`} className="text-dark fw-medium fs-16">
              {full_name || 'No Name'}
            </Link>
            <p className="mb-0 text-muted">{email}</p>
            <p className="mb-0 text-primary fs-13"># {id.slice(0, 8)}</p>
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
                <DropdownItem as={Link} href={`/residents/details?id=${id}`}>
                  <IconifyIcon icon="solar:eye-broken" className="me-2" />
                  View Details
                </DropdownItem>
                <DropdownItem as={Link} href={`/residents/edit?id=${id}`}>
                  <IconifyIcon icon="solar:pen-2-broken" className="me-2" />
                  Edit
                </DropdownItem>
                <DropdownItem 
                  onClick={handleDelete}
                  className="text-danger"
                  disabled={deleteResidentMutation.isPending}
                >
                  <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-2" />
                  {deleteResidentMutation.isPending ? 'Deleting...' : 'Delete'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="mt-3">
          <p className="d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="solar:home-bold-duotone" className="fs-18 text-primary" />
            <span className="text-muted">Unit:</span> {unit_number || (units ? `${units.block}-${units.number}` : 'N/A')}
          </p>
          <p className="d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />
            <span className="text-muted">Society:</span> {societies?.name || 'No Society'}
          </p>
          <p className="d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="solar:phone-bold-duotone" className="fs-18 text-primary" />
            <span className="text-muted">Phone:</span> {phone || 'No Phone'}
          </p>
          <div className="mt-3">
            <span className={`badge bg-${is_active ? 'success' : 'danger'}-subtle text-${is_active ? 'success' : 'danger'} py-1 px-2 fs-13`}>
              {is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardBody>
      <CardFooter className="border-top">
        <Row className="g-2">
          <Col lg={6}>
            <Link href={`/residents/details?id=${id}`} className="btn btn-primary btn-sm w-100">
              <IconifyIcon icon="solar:eye-broken" className="align-middle fs-16" /> View
            </Link>
          </Col>
          <Col lg={6}>
            <Button variant="light" size="sm" className="w-100">
              <IconifyIcon icon="solar:chat-round-dots-broken" className="align-middle fs-16" /> Message
            </Button>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  )
}

const ResidentData = ({ residents, isLoading, error, searchTerm, statusFilter, totalCount }: ResidentDataProps) => {
  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2">Loading residents...</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="text-danger">
                <IconifyIcon icon="solar:danger-circle-broken" className="fs-48 mb-3" />
                <h5>Error loading residents</h5>
                <p className="text-muted">{error.message}</p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (residents.length === 0) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="text-muted">
                <IconifyIcon icon="solar:users-group-two-rounded-broken" className="fs-48 mb-3" />
                <h5>No residents found</h5>
                <p>
                  {searchTerm || statusFilter !== 'all' 
                    ? `No residents match your current filters`
                    : 'No residents have been added yet'
                  }
                </p>
                {searchTerm && (
                  <p className="text-muted">
                    Try adjusting your search term: <strong>"{searchTerm}"</strong>
                  </p>
                )}
                {statusFilter !== 'all' && (
                  <p className="text-muted">
                    Current filter: <strong>{statusFilter}</strong> residents
                  </p>
                )}
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/residents/add" className="btn btn-primary">
                    <IconifyIcon icon="ri:add-line" className="me-1" />
                    Add First Resident
                  </Link>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <Row>
      {residents.map((resident) => (
        <Col xl={4} lg={6} key={resident.id} className="mb-4">
          <ResidentCard {...resident} />
        </Col>
      ))}
    </Row>
  )
}

export default ResidentData
