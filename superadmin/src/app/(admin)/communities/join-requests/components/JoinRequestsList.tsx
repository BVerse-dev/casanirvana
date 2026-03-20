'use client'

import { useState } from 'react'
import { Card, Col, Row, Badge, Button, Alert, Spinner, Modal } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { type JoinRequest, useUpdateJoinRequest } from '@/hooks/useJoinRequests'
import { toast } from 'react-hot-toast'

interface JoinRequestsListProps {
  joinRequests: JoinRequest[]
  isLoading: boolean
  error: any
  currentPage: number
  onPageChange: (page: number) => void
  searchTerm: string
  statusFilter: string
}

const ITEMS_PER_PAGE = 10

const JoinRequestsList = ({ 
  joinRequests, 
  isLoading, 
  error, 
  currentPage, 
  onPageChange,
  searchTerm,
  statusFilter
}: JoinRequestsListProps) => {
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  
  const updateJoinRequest = useUpdateJoinRequest()

  const getCommunityDisplayName = (request: JoinRequest) => {
    return request.community_name || 'Unknown Community'
  }

  // Pagination
  const totalPages = Math.ceil(joinRequests.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedRequests = joinRequests.slice(startIndex, endIndex)

  const handleAction = (request: JoinRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(action)
    setAdminNotes(request.review_notes || '')
    setShowModal(true)
  }

  const handleViewRequest = (request: JoinRequest) => {
    setSelectedRequest(request)
    setAdminNotes(request.review_notes || '')
    setActionType(null) // Reset action type
    setShowViewModal(true)
  }

  const handleActionFromViewModal = (action: 'approve' | 'reject') => {
    setActionType(action)
    setShowViewModal(false)
    setShowModal(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return

    try {
      await updateJoinRequest.mutateAsync({
        id: selectedRequest.id,
        status: actionType === 'approve' ? 'approved' : 'rejected',
        review_notes: adminNotes.trim() || undefined
      })
      
      toast.success(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`)
      setShowModal(false)
      setShowViewModal(false)
      setSelectedRequest(null)
      setActionType(null)
      setAdminNotes('')
    } catch (error) {
      toast.error(`Failed to ${actionType} request`)
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      pending_manual_review: 'info'
    }
    const labels = {
      pending: 'PENDING',
      approved: 'APPROVED', 
      rejected: 'REJECTED',
      pending_manual_review: 'MANUAL REVIEW'
    }
    return <Badge bg={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="text-muted">Loading join requests...</p>
        </Card.Body>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <IconifyIcon icon="ri:error-warning-line" className="me-2" />
        Error loading join requests: {error.message}
      </Alert>
    )
  }

  if (joinRequests.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <IconifyIcon icon="ri:user-add-line" className="fs-48 text-muted mb-3" />
          <h5 className="text-muted">No join requests found</h5>
          <p className="text-muted">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Join requests will appear here when users request to join communities'
            }
          </p>
        </Card.Body>
      </Card>
    )
  }

  return (
    <>
      <Row>
        {paginatedRequests.map((request) => (
          <Col lg={12} key={request.id} className="mb-3">
            <Card>
              <Card.Body>
                <Row className="align-items-center">
                  <Col lg={3}>
                    <div className="d-flex align-items-center">
                      <div className="avatar-lg bg-light rounded-3 d-flex align-items-center justify-content-center me-3">
                        <IconifyIcon icon="ri:user-line" className="fs-20 text-muted" />
                      </div>
                      <div>
                        <h6 className="mb-1">{request.full_name || 'Unknown User'}</h6>
                        <p className="text-muted mb-0 fs-13">{request.email || 'No email'}</p>
                        <p className="text-muted mb-0 fs-13">{request.phone || 'No phone'}</p>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div>
                      <p className="mb-1">
                        <strong>Community:</strong> {getCommunityDisplayName(request)}
                      </p>
                      <p className="mb-1">
                        <strong>Unit:</strong> {
                          request.is_manual_entry 
                            ? request.manual_unit_info 
                            : `${request.unit_block ? request.unit_block + '-' : ''}${request.unit_number}`
                        }
                      </p>
                      {request.is_manual_entry && (
                        <p className="mb-1">
                          <Badge bg="warning" className="fs-12">Manual Entry</Badge>
                        </p>
                      )}
                      <p className="mb-0 text-muted fs-13">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div>
                      {request.comments && (
                        <div>
                          <p className="mb-1 fs-13"><strong>Message:</strong></p>
                          <p className="text-muted fs-13 mb-0" style={{ maxHeight: '60px', overflow: 'hidden' }}>
                            {request.comments.length > 100 
                              ? `${request.comments.substring(0, 100)}...` 
                              : request.comments
                            }
                          </p>
                        </div>
                      )}
                      {request.review_notes && (
                        <div className="mt-2">
                          <p className="mb-1 fs-13"><strong>Admin Notes:</strong></p>
                          <p className="text-muted fs-13 mb-0">
                            {request.review_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="text-end">
                      <div className="mb-2">
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {/* View Button - Always visible */}
                        <Button 
                          variant="info" 
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                          className="w-100"
                        >
                          <IconifyIcon icon="ri:eye-line" className="me-1" />
                          View Details
                        </Button>
                        
                        {/* Action Buttons - Only for pending requests */}
                        {(request.status === 'pending' || request.status === 'pending_manual_review') && (
                          <div className="btn-group w-100" role="group">
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleAction(request, 'approve')}
                              disabled={updateJoinRequest.isPending}
                              className="flex-fill"
                            >
                              <IconifyIcon icon="ri:check-line" className="me-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleAction(request, 'reject')}
                              disabled={updateJoinRequest.isPending}
                              className="flex-fill"
                            >
                              <IconifyIcon icon="ri:close-line" className="me-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                      {(request.status !== 'pending' && request.status !== 'pending_manual_review') && request.reviewed_at && (
                        <small className="text-muted d-block">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} on<br />
                          {request.reviewed_at && formatDate(request.reviewed_at)}
                        </small>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {totalPages > 1 && (
        <Row>
          <Col lg={12}>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <p className="text-muted mb-0">
                    Showing {startIndex + 1} to {Math.min(endIndex, joinRequests.length)} of {joinRequests.length} requests
                  </p>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => onPageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => onPageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => onPageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* View Request Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:eye-line" className="me-2" />
            Join Request Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              {/* User Information Section */}
              <div className="mb-4">
                <h6 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="ri:user-line" className="me-2" />
                  User Information
                </h6>
                <Row>
                  <Col md={6}>
                    <p><strong>Full Name:</strong> {selectedRequest.full_name || 'Unknown User'}</p>
                    <p><strong>Email:</strong> {selectedRequest.email || 'No email provided'}</p>
                    <p><strong>Phone:</strong> {selectedRequest.phone || 'No phone provided'}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>User ID:</strong> {selectedRequest.user_id}</p>
                    <p><strong>Request Date:</strong> {formatDate(selectedRequest.created_at)}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
                  </Col>
                </Row>
              </div>

              {/* Property Information Section */}
              <div className="mb-4">
                <h6 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="ri:building-line" className="me-2" />
                  Property Information
                </h6>
                <Row>
                  <Col md={6}>
                    <p><strong>Community:</strong> {getCommunityDisplayName(selectedRequest)}</p>
                    <p><strong>Unit:</strong> {
                      selectedRequest.is_manual_entry 
                        ? selectedRequest.manual_unit_info 
                        : `${selectedRequest.unit_block ? selectedRequest.unit_block + '-' : ''}${selectedRequest.unit_number}`
                    }</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Entry Type:</strong> {
                      selectedRequest.is_manual_entry 
                        ? <Badge bg="warning">Manual Entry</Badge>
                        : <Badge bg="primary">System Entry</Badge>
                    }</p>
                    {selectedRequest.community_id && (
                      <p><strong>Community ID:</strong> {selectedRequest.community_id}</p>
                    )}
                    {selectedRequest.unit_id && (
                      <p><strong>Unit ID:</strong> {selectedRequest.unit_id}</p>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Request Details Section */}
              <div className="mb-4">
                <h6 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="ri:message-line" className="me-2" />
                  Request Details
                </h6>
                {selectedRequest.comments ? (
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0">{selectedRequest.comments}</p>
                  </div>
                ) : (
                  <p className="text-muted">No message provided by the user</p>
                )}
              </div>

              {/* Review Information Section (if reviewed) */}
              {(selectedRequest.status !== 'pending' && selectedRequest.status !== 'pending_manual_review') && (
                <div className="mb-4">
                  <h6 className="border-bottom pb-2 mb-3">
                    <IconifyIcon icon="ri:admin-line" className="me-2" />
                    Review Information
                  </h6>
                  <Row>
                    <Col md={6}>
                      <p><strong>Reviewed By:</strong> {selectedRequest.reviewed_by || 'System'}</p>
                      <p><strong>Review Date:</strong> {selectedRequest.reviewed_at ? formatDate(selectedRequest.reviewed_at) : 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Decision:</strong> {getStatusBadge(selectedRequest.status)}</p>
                    </Col>
                  </Row>
                  {selectedRequest.review_notes && (
                    <div>
                      <p className="mb-2"><strong>Admin Notes:</strong></p>
                      <div className="bg-light p-3 rounded">
                        <p className="mb-0">{selectedRequest.review_notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Current Admin Notes Section (for editing) */}
              <div className="mb-3">
                <h6 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="ri:edit-line" className="me-2" />
                  Admin Notes
                </h6>
                <textarea
                  className="form-control"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add your notes about this request..."
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowViewModal(false)
            setSelectedRequest(null)
            setAdminNotes('')
            setActionType(null)
          }}>
            Close
          </Button>
          {/* Show action buttons only for pending requests */}
          {selectedRequest && (selectedRequest.status === 'pending' || selectedRequest.status === 'pending_manual_review') && (
            <div className="d-flex gap-2">
              <Button 
                variant="danger"
                onClick={() => handleActionFromViewModal('reject')}
                disabled={updateJoinRequest.isPending}
              >
                <IconifyIcon icon="ri:close-line" className="me-1" />
                Reject Request
              </Button>
              <Button 
                variant="success"
                onClick={() => handleActionFromViewModal('approve')}
                disabled={updateJoinRequest.isPending}
              >
                <IconifyIcon icon="ri:check-line" className="me-1" />
                Approve Request
              </Button>
            </div>
          )}
        </Modal.Footer>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Join Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <p>
                <strong>Name:</strong> {selectedRequest.full_name || 'Unknown User'}<br />
                <strong>Email:</strong> {selectedRequest.email || 'No email'}<br />
                <strong>Community:</strong> {getCommunityDisplayName(selectedRequest)}<br />
                <strong>Unit:</strong> {
                  selectedRequest.is_manual_entry 
                    ? selectedRequest.manual_unit_info 
                    : `${selectedRequest.unit_block ? selectedRequest.unit_block + '-' : ''}${selectedRequest.unit_number}`
                }
              </p>
              <div className="mb-3">
                <label htmlFor="adminNotes" className="form-label">
                  Admin Notes {actionType === 'reject' && <span className="text-danger">*</span>}
                </label>
                <textarea
                  id="adminNotes"
                  className="form-control"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={`Add notes about this ${actionType === 'approve' ? 'approval' : 'rejection'}...`}
                />
                {actionType === 'reject' && !adminNotes.trim() && (
                  <small className="text-danger">Please provide a reason for rejection</small>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false)
            setActionType(null)
            // If we came from view modal, go back to it
            if (selectedRequest) {
              setShowViewModal(true)
            }
          }}>
            Cancel
          </Button>
          <Button 
            variant={actionType === 'approve' ? 'success' : 'danger'}
            onClick={handleConfirmAction}
            disabled={updateJoinRequest.isPending || (actionType === 'reject' && !adminNotes.trim())}
          >
            {updateJoinRequest.isPending && (
              <Spinner animation="border" size="sm" className="me-2" />
            )}
            {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default JoinRequestsList
