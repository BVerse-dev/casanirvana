'use client';

import React, { useMemo, useState } from 'react';
import { Row, Col, Card, CardBody, CardHeader, Button, Alert, Table, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type OnboardingRequest = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_role: 'agency_manager' | 'facility_manager';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  organization_name?: string | null;
  community_name?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  referral_code?: string | null;
  source?: string | null;
  review_notes?: string | null;
  invited_user_id?: string | null;
};

const roleLabel = (role: string) => {
  switch (role) {
    case 'agency_manager':
      return 'Agency Manager';
    case 'facility_manager':
      return 'Facility Manager';
    default:
      return role;
  }
};

const statusVariant = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'warning';
  }
};

const OnboardingRequestsPage = () => {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'approve_invite' | 'notes'>('notes');
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    const token = session?.accessToken as string | undefined;
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }
    return payload;
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminOnboardingRequests', statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);
      const query = params.toString();
      return fetchAdmin(`/admin/onboarding-requests${query ? `?${query}` : ''}`);
    },
    enabled: !!session?.accessToken,
  });

  const requests: OnboardingRequest[] = useMemo(() => data?.data || [], [data]);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setActionId(requestId);
      await fetchAdmin(`/admin/onboarding-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, review_notes: reviewNotes || undefined }),
      });
      setShowAlert({ type: 'success', message: `Request ${status} successfully.` });
      refetch();
    } catch (error) {
      console.error('Status update error:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update request status.' });
    } finally {
      setActionId(null);
      setTimeout(() => setShowAlert(null), 4000);
    }
  };

  const handleApproveAndInvite = async (request: OnboardingRequest) => {
    try {
      setActionId(request.id);
      const inviteResponse = await fetchAdmin('/admin/invites', {
        method: 'POST',
        body: JSON.stringify({
          first_name: request.first_name,
          last_name: request.last_name,
          email: request.email,
          role: request.requested_role,
          phone: request.phone || undefined,
        }),
      });

      const invitedId = inviteResponse?.profile?.id || inviteResponse?.invite?.id || null;
      await fetchAdmin(`/admin/onboarding-requests/${request.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'approved',
          invited_user_id: invitedId,
          review_notes: reviewNotes || undefined,
        }),
      });

      setShowAlert({ type: 'success', message: 'Invite sent and request approved.' });
      refetch();
    } catch (error) {
      console.error('Invite error:', error);
      setShowAlert({ type: 'danger', message: 'Failed to approve and invite.' });
    } finally {
      setActionId(null);
      setTimeout(() => setShowAlert(null), 4000);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    try {
      setActionId(selectedRequest.id);
      await fetchAdmin(`/admin/onboarding-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ review_notes: reviewNotes }),
      });
      setShowAlert({ type: 'success', message: 'Review notes saved.' });
      refetch();
    } catch (error) {
      console.error('Save notes error:', error);
      setShowAlert({ type: 'danger', message: 'Failed to save review notes.' });
    } finally {
      setActionId(null);
      setTimeout(() => setShowAlert(null), 4000);
    }
  };

  const openReviewModal = (request: OnboardingRequest, action: 'approve' | 'reject' | 'approve_invite' | 'notes') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes(request.review_notes || '');
    setShowReviewModal(true);
  };

  const handleReviewConfirm = async () => {
    if (!selectedRequest) return;
    const request = selectedRequest;
    setShowReviewModal(false);

    if (reviewAction === 'notes') {
      await handleSaveNotes();
      return;
    }

    if (reviewAction === 'approve_invite') {
      await handleApproveAndInvite(request);
      return;
    }

    if (reviewAction === 'approve') {
      await handleUpdateStatus(request.id, 'approved');
      return;
    }

    if (reviewAction === 'reject') {
      await handleUpdateStatus(request.id, 'rejected');
    }
  };

  const handleSearch = () => setSearchTerm(searchInput.trim());

  return (
    <>
      <PageTitle subName="Identity & Access" title="Onboarding & Invitations" />

      <div className="container-xxl">
        {showAlert && (
          <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)} className="mb-3">
            <IconifyIcon
              icon={showAlert.type === 'success' ? 'ri:check-line' : 'ri:error-warning-line'}
              className="me-2"
            />
            {showAlert.message}
          </Alert>
        )}

        <ComponentContainerCard title="Review Onboarding & Invitation Requests" id="onboarding-requests">
          <Card className="mb-3">
            <CardHeader className="bg-light">
              <Row className="g-2 align-items-center">
                <Col md={4}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Search by name, email, organization, or community"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                    />
                    <Button variant="outline-primary" onClick={handleSearch}>
                      Search
                    </Button>
                  </InputGroup>
                </Col>
                <Col md={2} className="text-md-end">
                  <Button variant="outline-secondary" onClick={() => refetch()} disabled={isFetching}>
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody className="p-0">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted mt-2">Loading requests...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Applicant</th>
                        <th>Role</th>
                        <th>Organization / Community</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Requested</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            No onboarding requests found.
                          </td>
                        </tr>
                      ) : (
                        requests.map((request) => {
                          const isPending = request.status === 'pending';
                          const isBusy = actionId === request.id;
                          return (
                            <tr key={request.id}>
                              <td>
                                <div className="fw-semibold">
                                  {request.first_name} {request.last_name}
                                </div>
                                <small className="text-muted">{request.email}</small>
                              </td>
                              <td>
                                <Badge bg="info">{roleLabel(request.requested_role)}</Badge>
                              </td>
                              <td>
                                <div className="fw-medium">{request.organization_name || '—'}</div>
                                <small className="text-muted">{request.community_name || '—'}</small>
                              </td>
                              <td>
                                <div>{request.phone || '—'}</div>
                                <small className="text-muted">
                                  {[request.city, request.country].filter(Boolean).join(', ') || '—'}
                                </small>
                              </td>
                              <td>
                                <Badge bg={statusVariant(request.status)}>{request.status.toUpperCase()}</Badge>
                                {request.invited_user_id && (
                                  <div>
                                    <Badge bg="secondary" className="mt-1">Invited</Badge>
                                  </div>
                                )}
                              </td>
                              <td>
                                <div>{new Date(request.created_at).toLocaleDateString()}</div>
                                <small className="text-muted">{new Date(request.created_at).toLocaleTimeString()}</small>
                              </td>
                              <td className="text-end">
                                <div className="d-flex flex-column gap-2 align-items-end">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    disabled={!isPending || isBusy}
                                    onClick={() => openReviewModal(request, 'approve')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    disabled={!isPending || isBusy || !!request.invited_user_id}
                                    onClick={() => openReviewModal(request, 'approve_invite')}
                                  >
                                    Approve & Invite
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    disabled={isBusy}
                                    onClick={() => openReviewModal(request, 'notes')}
                                  >
                                    Review Notes
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    disabled={!isPending || isBusy}
                                    onClick={() => openReviewModal(request, 'reject')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </ComponentContainerCard>
      </div>

      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {reviewAction === 'notes' && 'Review Notes'}
            {reviewAction === 'approve' && 'Approve Request'}
            {reviewAction === 'approve_invite' && 'Approve & Invite'}
            {reviewAction === 'reject' && 'Reject Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div className="mb-3">
              <div className="fw-semibold">
                {selectedRequest.first_name} {selectedRequest.last_name}
              </div>
              <div className="text-muted">{selectedRequest.email}</div>
              <div className="text-muted">{roleLabel(selectedRequest.requested_role)}</div>
            </div>
          )}
          <Form.Group>
            <Form.Label>Review Notes (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any verification or decision notes here."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReviewConfirm} disabled={actionId !== null}>
            {reviewAction === 'notes' && 'Save Notes'}
            {reviewAction === 'approve' && 'Approve'}
            {reviewAction === 'approve_invite' && 'Approve & Invite'}
            {reviewAction === 'reject' && 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OnboardingRequestsPage;
