'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from 'react-bootstrap'
import { useDeleteGuard, type Guard } from '@/hooks/useGuards'
import { mapAvatarUrl } from '@/utils/avatarMapper'
import { avatars } from '@/assets/images/users'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface GuardsListProps {
  guards: Guard[]
  isLoading: boolean
  error: Error | null
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  currentPage: number
  onPageChange: (page: number) => void
}

const GuardsList = ({ 
  guards, 
  isLoading, 
  error, 
  searchTerm, 
  statusFilter, 
  currentPage, 
  onPageChange 
}: GuardsListProps) => {
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const deleteGuardMutation = useDeleteGuard()

  // Pagination settings
  const itemsPerPage = 8
  const totalPages = Math.ceil(guards.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentGuards = guards.slice(startIndex, endIndex)

  const handleDeleteClick = (guard: Guard) => {
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
        toast.error('Failed to delete guard')
      }
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setSelectedGuard(null)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Society', 'Shift Type', 'Employment Date', 'Status'],
      ...guards.map(guard => [
        guard.full_name || 'N/A',
        guard.email || 'N/A',
        guard.phone || 'N/A',
        guard.societies?.name || 'N/A',
        guard.shift_type || 'N/A',
        guard.employment_date || guard.created_at || 'N/A',
        guard.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guards_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Guards data exported successfully')
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
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={'h4'}>
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'All Guards List'}
                </CardTitle>
                <small className="text-muted">
                  Showing {startIndex + 1}-{Math.min(endIndex, guards.length)} of {guards.length} guards
                </small>
              </div>
              <Dropdown>
                <DropdownToggle
                  as={'a'}
                  className="btn btn-sm btn-outline-light rounded content-none icons-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  Actions <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem onClick={handleExport}>
                    <IconifyIcon icon="solar:download-broken" className="me-2" />
                    Export CSV
                  </DropdownItem>
                  <DropdownItem>
                    <IconifyIcon icon="solar:printer-broken" className="me-2" />
                    Print List
                  </DropdownItem>
                  <DropdownItem>
                    <IconifyIcon icon="solar:refresh-broken" className="me-2" />
                    Refresh
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </CardHeader>
            <CardBody className="p-0">
              <div className="table-responsive">
                <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th>Guard Photo &amp; Name</th>
                      <th>Society</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Shift Type</th>
                      <th>Employment Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGuards.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5">
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
                        </td>
                      </tr>
                    ) : (
                      currentGuards.map((guard) => (
                        <tr key={guard.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                {guard.avatar_url ? (
                                  <Image 
                                    src={mapAvatarUrl(guard.avatar_url) || avatars.dummyAvatar} 
                                    alt="avatar" 
                                    width={40} 
                                    height={40} 
                                    className="avatar-sm rounded-circle" 
                                  />
                                ) : (
                                  <div className="avatar-sm rounded-circle bg-light-subtle d-flex align-items-center justify-content-center">
                                    <IconifyIcon icon="ri:shield-user-line" className="fs-18" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <Link href={`/guards/details?id=${guard.id}`} className="text-dark fw-medium fs-15">
                                  {guard.full_name || 'No Name'}
                                </Link>
                                <div className="text-muted fs-13">
                                  ID: {guard.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{guard.societies?.name || 'N/A'}</td>
                          <td>
                            <div>
                              {guard.email}
                              {guard.email && (
                                <div className="text-muted fs-13">
                                  <IconifyIcon icon="solar:check-circle-broken" className="text-success me-1" />
                                  Verified
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{guard.phone || 'N/A'}</td>
                          <td>
                            <span className={`badge bg-info-subtle text-info py-1 px-2 fs-13`}>
                              {guard.shift_type || 'Not Set'}
                            </span>
                          </td>
                          <td>
                            {guard.employment_date 
                              ? new Date(guard.employment_date).toLocaleDateString('en-us', { day: 'numeric', month: 'short', year: 'numeric' })
                              : guard.created_at 
                                ? new Date(guard.created_at).toLocaleDateString('en-us', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'N/A'
                            }
                          </td>
                          <td>
                            <span
                              className={`badge bg-${guard.is_active ? 'success' : 'danger'}-subtle text-${guard.is_active ? 'success' : 'danger'} py-1 px-2 fs-13`}>
                              {guard.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link href={`/guards/details?id=${guard.id}`}>
                                <Button variant="light" size="sm" title="View Details">
                                  <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                                </Button>
                              </Link>
                              <Link href={`/guards/edit?id=${guard.id}`}>
                                <Button variant="soft-primary" size="sm" title="Edit Guard">
                                  <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                                </Button>
                              </Link>
                              <Button 
                                variant="soft-danger" 
                                size="sm" 
                                title="Delete Guard"
                                onClick={() => handleDeleteClick(guard)}
                                disabled={deleteGuardMutation.isPending}
                              >
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
            {guards.length > itemsPerPage && (
              <CardFooter>
                <nav aria-label="Guards pagination">
                  <ul className="pagination justify-content-end mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </CardFooter>
            )}
          </Card>
        </Col>
      </Row>

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

export default GuardsList
