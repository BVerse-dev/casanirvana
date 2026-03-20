'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Pagination } from 'react-bootstrap'
import { useDeleteGuardDirectory, type GuardDirectoryItem } from '@/hooks/useGuardDirectory'
import { mapAvatarUrl } from '@/utils/avatarMapper'
import { avatars } from '@/assets/images/users'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

type GuardCardProps = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  societies?: { id: string; name: string; address?: string } | null
  is_active: boolean | null
  shift_type: string | null
  employment_date: string | null
  onDelete: (guard: GuardDirectoryItem) => void
}

const GuardCard = ({ id, full_name, email, phone, avatar_url, societies, is_active, shift_type, employment_date, onDelete }: GuardCardProps) => {
  const mappedAvatarUrl = mapAvatarUrl(avatar_url)
  
  const handleActionClick = (action: string) => {
    switch (action) {
      case 'view':
        window.open(`/guards/details?id=${id}`, '_blank')
        break
      case 'manage':
        window.open(`/guards/manage?tab=assignments&guardId=${id}`, '_blank')
        break
      case 'delete':
        onDelete({
          id,
          full_name,
          email,
          phone,
          avatar_url,
          societies,
          is_active,
          shift_type,
          employment_date
        } as GuardDirectoryItem)
        break
    }
  }

  return (
    <Card className="h-100">
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-2 border-bottom pb-3">
          {mappedAvatarUrl ? (
            <Image 
              src={mappedAvatarUrl || avatars.dummyAvatar} 
              alt="avatar" 
              width={64} 
              height={64} 
              className="avatar-lg rounded-3 border border-light border-3" 
            />
          ) : (
            <div className="avatar-lg rounded-3 border border-light border-3 bg-light-subtle d-flex align-items-center justify-content-center">
              <IconifyIcon icon="ri:shield-user-line" className="fs-24" />
            </div>
          )}
          <div className="d-block flex-grow-1">
            <Link href={`/guards/details?id=${id}`} className="text-dark fw-medium fs-16">
              {full_name || 'No Name'}
            </Link>
            <p className="mb-0 text-muted">{email || 'No Email'}</p>
            <p className="mb-0 text-primary fs-13"># {id.slice(0, 8)}...</p>
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
                <DropdownItem onClick={() => handleActionClick('view')}>
                  <IconifyIcon icon="solar:eye-broken" className="me-2" />
                  View Details
                </DropdownItem>
                <DropdownItem onClick={() => handleActionClick('manage')}>
                  <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                  Manage Assignments
                </DropdownItem>
                <DropdownItem onClick={() => handleActionClick('delete')} className="text-danger">
                  <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-2" />
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="mt-3">
          <p className="d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="solar:buildings-bold-duotone" className="fs-18 text-primary" />
            <span className="text-muted">Community:</span> {societies?.name || 'N/A'}
          </p>
          <p className="d-flex align-items-center gap-2 mb-2">
            <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-18 text-warning" />
            <span className="text-muted">Shift:</span> {shift_type || 'Not Set'}
          </p>
          <p className="d-flex align-items-center gap-2 mb-0">
            <IconifyIcon icon="solar:phone-bold-duotone" className="fs-18 text-success" />
            <span className="text-muted">Phone:</span> {phone || 'No Phone'}
          </p>
        </div>
      </CardBody>
      <CardFooter>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className={`badge bg-${is_active ? 'success' : 'danger'}-subtle text-${is_active ? 'success' : 'danger'} py-1 px-2 fs-13`}>
            {is_active ? 'Active' : 'Inactive'}
          </span>
          <p className="fs-13 text-muted mb-0">
            Employed: {employment_date 
              ? new Date(employment_date).toLocaleDateString('en-us', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'N/A'
            }
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

interface GuardDataProps {
  guards: GuardDirectoryItem[]
  isLoading: boolean
  error: Error | null
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  currentPage: number
  onPageChange: (page: number) => void
}

const GuardData = ({ 
  guards, 
  isLoading, 
  error, 
  searchTerm, 
  statusFilter, 
  currentPage, 
  onPageChange 
}: GuardDataProps) => {
  const [selectedGuard, setSelectedGuard] = useState<GuardDirectoryItem | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const deleteGuardMutation = useDeleteGuardDirectory()
  
  const itemsPerPage = 6 // Show 6 guards per page (2 rows of 3)

  // Calculate pagination
  const totalPages = Math.ceil(guards.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentGuards = guards.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDeleteClick = (guard: GuardDirectoryItem) => {
    setSelectedGuard(guard)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedGuard) {
      try {
        await deleteGuardMutation.mutateAsync(selectedGuard.id)
        toast.success('Guard deleted successfully')
        setShowDeleteModal(false)
        setSelectedGuard(null)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete guard')
      }
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setSelectedGuard(null)
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2">Loading guards...</div>
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
                <h5>Error loading guards</h5>
                <p className="text-muted">{error.message}</p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <>
      <Row>
        {currentGuards.length === 0 ? (
          <Col xl={12}>
            <Card>
              <CardBody className="text-center py-5">
                <div className="text-muted">
                  <IconifyIcon icon="solar:shield-user-broken" className="fs-48 mb-3" />
                  <h5>No guards found</h5>
                  <p>
                    {searchTerm || statusFilter !== 'all'
                      ? `No guards match your current filters`
                      : 'No guards have been added yet'
                    }
                  </p>
                  {searchTerm && (
                    <p className="text-muted">
                      Try adjusting your search term: <strong>"{searchTerm}"</strong>
                    </p>
                  )}
                  {statusFilter !== 'all' && (
                    <p className="text-muted">
                      Current filter: <strong>{statusFilter}</strong> guards
                    </p>
                  )}
                  {!searchTerm && statusFilter === 'all' && (
                    <Link href="/guards/add" className="btn btn-primary">
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      Add First Guard
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        ) : (
          currentGuards.map((guard) => (
            <Col xl={4} lg={6} key={guard.id}>
              <GuardCard 
                id={guard.id}
                full_name={guard.full_name}
                email={guard.email ?? null}
                phone={guard.phone ?? null}
                avatar_url={guard.avatar_url ?? null}
                societies={guard.societies ? {
                  id: guard.societies.id ?? "",
                  name: guard.societies.name ?? "",
                  address: guard.societies.address ?? undefined
                } : null}
                is_active={guard.is_active ?? null}
                shift_type={guard.shift_type ?? null}
                employment_date={guard.employment_date ?? null}
                onDelete={handleDeleteClick}
              />
            </Col>
          ))
        )}
      </Row>
      
      {/* Pagination */}
      {guards.length > itemsPerPage && (
        <Row className="mt-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Showing {startIndex + 1} to {Math.min(endIndex, guards.length)} of {guards.length} guards
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </Pagination>
            </div>
          </Col>
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGuard && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={handleDeleteCancel}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete guard <strong>{selectedGuard.full_name}</strong>?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleDeleteCancel}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeleteConfirm}
                  disabled={deleteGuardMutation.isPending}
                >
                  {deleteGuardMutation.isPending ? 'Deleting...' : 'Delete Guard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GuardData
