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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap'
import { useDeleteResident, type Resident } from '@/hooks/useResidents'
import { mapAvatarUrl } from '@/utils/avatarMapper'
import { avatars } from '@/assets/images/users'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ResidentsListProps {
  residents: Resident[]
  isLoading: boolean
  error: Error | null
  currentPage: number
  onPageChange: (page: number) => void
  searchTerm: string
  onRefresh: () => Promise<unknown>
}

const ResidentsList = ({ 
  residents, 
  isLoading, 
  error, 
  currentPage, 
  onPageChange, 
  searchTerm,
  onRefresh,
}: ResidentsListProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const deleteResidentMutation = useDeleteResident()

  // Pagination logic
  const ITEMS_PER_PAGE = 8
  const totalPages = Math.ceil(residents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentResidents = residents.slice(startIndex, endIndex)

  const handleDeleteClick = (resident: Resident) => {
    setSelectedResident(resident)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedResident) return

    try {
      await deleteResidentMutation.mutateAsync(selectedResident.id)
      toast.success('Resident deleted successfully')
      setShowDeleteModal(false)
      setSelectedResident(null)
    } catch (error) {
      toast.error('Failed to delete resident')
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setSelectedResident(null)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Unit', 'Society', 'Status', 'Date Joined'],
      ...residents.map(resident => [
        resident.full_name || 'N/A',
        resident.email || 'N/A',
        resident.phone || 'N/A',
        resident.unit_number || 'N/A',
        resident.communities?.name || 'N/A',
        resident.is_active ? 'Active' : 'Inactive',
        resident.created_at ? new Date(resident.created_at).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `residents_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Residents data exported successfully')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleRefresh = async () => {
    await onRefresh()
    toast.success('Residents list refreshed')
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

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={'h4'}>
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'All Residents List'}
                </CardTitle>
                <small className="text-muted">
                  {residents.length > 0
                    ? `Showing ${startIndex + 1}-${Math.min(endIndex, residents.length)} of ${residents.length} residents`
                    : 'Showing 0 residents'}
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
                  <DropdownItem onClick={handlePrint}>
                    <IconifyIcon icon="solar:printer-broken" className="me-2" />
                    Print List
                  </DropdownItem>
                  <DropdownItem onClick={handleRefresh}>
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
                      <th>Resident Photo &amp; Name</th>
                      <th>Unit</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Society</th>
                      <th>Date Joined</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResidents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5">
                          <div className="text-muted">
                            <IconifyIcon icon="solar:users-group-two-rounded-broken" className="fs-48 mb-3" />
                            <h5>No residents found</h5>
                            <p>
                              {searchTerm 
                                ? `No residents match your search "${searchTerm}"`
                                : 'No residents have been added yet'
                              }
                            </p>
                            {!searchTerm && (
                              <Link href="/residents/add" className="btn btn-primary">
                                <IconifyIcon icon="ri:add-line" className="me-1" />
                                Add First Resident
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentResidents.map((resident) => (
                        <tr key={resident.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                {resident.avatar_url ? (
                                  <Image 
                                    src={mapAvatarUrl(resident.avatar_url) || avatars.dummyAvatar} 
                                    alt="avatar" 
                                    width={40} 
                                    height={40} 
                                    className="avatar-sm rounded-circle" 
                                  />
                                ) : (
                                  <div className="avatar-sm rounded-circle bg-light-subtle d-flex align-items-center justify-content-center">
                                    <IconifyIcon icon="ri:user-line" className="fs-18" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <Link href={`/residents/${resident.id}`} className="text-dark fw-medium fs-15">
                                  {resident.full_name || 'No Name'}
                                </Link>
                                <div className="text-muted fs-13">
                                  ID: {resident.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{resident.unit_number || (resident.units ? `${resident.units.block}-${resident.units.number}` : 'N/A')}</td>
                          <td>
                            <div>
                              {resident.email}
                              {resident.email && (
                                <div className="text-muted fs-13">
                                  <IconifyIcon icon="solar:check-circle-broken" className="text-success me-1" />
                                  Verified
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{resident.phone || 'N/A'}</td>
                          <td>{resident.communities?.name || 'N/A'}</td>
                          <td>{resident.created_at
                            ? new Date(resident.created_at).toLocaleDateString('en-us', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A'
                          }</td>
                          <td>
                            <span
                              className={`badge bg-${resident.is_active ? 'success' : 'danger'}-subtle text-${resident.is_active ? 'success' : 'danger'} py-1 px-2 fs-13`}>
                              {resident.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link href={`/residents/${resident.id}`}>
                                <Button variant="light" size="sm" title="View Details">
                                  <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                                </Button>
                              </Link>
                              <Link href={`/residents/${resident.id}/edit`}>
                                <Button variant="soft-primary" size="sm" title="Edit Resident">
                                  <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                                </Button>
                              </Link>
                              <Button 
                                variant="soft-danger" 
                                size="sm" 
                                title="Delete Resident"
                                onClick={() => handleDeleteClick(resident)}
                                disabled={deleteResidentMutation.isPending}
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
            {totalPages > 1 && (
              <CardFooter>
                <nav aria-label="Residents pagination">
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <ModalHeader closeButton>
          <ModalTitle>Confirm Delete</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <IconifyIcon icon="solar:danger-circle-broken" className="text-danger fs-48 mb-3" />
            <h5>Are you sure?</h5>
            <p className="text-muted">
              Do you want to delete <strong>{selectedResident?.full_name}</strong>? 
              This action cannot be undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleteResidentMutation.isPending}
          >
            {deleteResidentMutation.isPending ? 'Deleting...' : 'Delete Resident'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default ResidentsList
