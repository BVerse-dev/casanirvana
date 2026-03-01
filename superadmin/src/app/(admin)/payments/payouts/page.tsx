'use client';

import { type FormEvent, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Nav,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import {
  useCreatePayoutDestination,
  useCreatePayoutRequest,
  usePayoutDestinations,
  usePayoutRequests,
  usePayoutRules,
  usePayoutSummary,
  usePayoutTransactions,
  useUpdatePayoutRequestStatus,
  useUpsertPayoutRule,
} from '@/hooks/usePayouts';

type PayoutTab = 'overview' | 'requests' | 'destinations' | 'rules';

const parseNumberInput = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const formatMoney = (value: number | string | null | undefined, symbol = 'GH₵') => {
  const parsed = Number(value);
  const amount = Number.isFinite(parsed) ? parsed : 0;
  return `${symbol} ${amount.toFixed(2)}`;
};

const getStatusVariant = (status?: string | null) => {
  switch (status) {
    case 'available':
    case 'active':
    case 'paid':
      return 'success';
    case 'reserved':
    case 'processing':
    case 'pending_review':
    case 'approved':
      return 'warning';
    case 'rejected':
    case 'failed':
    case 'cancelled':
    case 'disabled':
      return 'danger';
    default:
      return 'secondary';
  }
};

const PayoutsPage = () => {
  const [activeTab, setActiveTab] = useState<PayoutTab>('overview');
  const [requestAmount, setRequestAmount] = useState('0');
  const [requestNotes, setRequestNotes] = useState('');
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [destinationForm, setDestinationForm] = useState({
    destination_type: 'bank_account',
    label: '',
    account_name: '',
    account_number: '',
    bank_name: '',
    bank_code: '',
    mobile_network: '',
    mobile_number: '',
    is_default: true,
  });
  const [ruleForm, setRuleForm] = useState({
    community_share_mode: 'fixed',
    community_share_value: '0',
    agency_share_mode: 'remainder',
    agency_share_value: '0',
    platform_fee_mode: 'fixed',
    platform_fee_value: '0',
    is_active: true,
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const summaryQuery = usePayoutSummary();
  const transactionsQuery = usePayoutTransactions();
  const requestsQuery = usePayoutRequests();
  const destinationsQuery = usePayoutDestinations();
  const rulesQuery = usePayoutRules();

  const createRequest = useCreatePayoutRequest();
  const createDestination = useCreatePayoutDestination();
  const upsertRule = useUpsertPayoutRule();
  const updateRequestStatus = useUpdatePayoutRequestStatus();

  const summary = summaryQuery.data;
  const transactions = transactionsQuery.data || [];
  const requests = requestsQuery.data || [];
  const destinations = destinationsQuery.data || [];
  const rules = rulesQuery.data || [];

  const canSubmitRequest = useMemo(
    () =>
      Boolean(selectedDestinationId) &&
      parseNumberInput(requestAmount) > 0 &&
      !createRequest.isPending &&
      !summaryQuery.isLoading,
    [selectedDestinationId, requestAmount, createRequest.isPending, summaryQuery.isLoading]
  );

  const loading = summaryQuery.isLoading || transactionsQuery.isLoading || requestsQuery.isLoading || destinationsQuery.isLoading || rulesQuery.isLoading;

  const handleCreateRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    try {
      const response = await createRequest.mutateAsync({
        destination_id: selectedDestinationId,
        requested_amount: parseNumberInput(requestAmount),
        notes: requestNotes || null,
      });
      setFeedback({
        type: 'success',
        message: `Payout request ${response?.request?.reference_number || 'created'} submitted successfully.`,
      });
      setRequestAmount('0');
      setRequestNotes('');
    } catch (error: any) {
      setFeedback({
        type: 'danger',
        message: error?.message || 'Failed to submit payout request.',
      });
    }
  };

  const handleCreateDestination = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    try {
      await createDestination.mutateAsync({
        ...destinationForm,
      });
      setFeedback({
        type: 'success',
        message: 'Payout destination saved successfully.',
      });
      setDestinationForm({
        destination_type: 'bank_account',
        label: '',
        account_name: '',
        account_number: '',
        bank_name: '',
        bank_code: '',
        mobile_network: '',
        mobile_number: '',
        is_default: true,
      });
    } catch (error: any) {
      setFeedback({
        type: 'danger',
        message: error?.message || 'Failed to save payout destination.',
      });
    }
  };

  const handleSaveRule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    try {
      await upsertRule.mutateAsync({
        community_share_mode: ruleForm.community_share_mode,
        community_share_value: parseNumberInput(ruleForm.community_share_value),
        agency_share_mode: ruleForm.agency_share_mode,
        agency_share_value: parseNumberInput(ruleForm.agency_share_value),
        platform_fee_mode: ruleForm.platform_fee_mode,
        platform_fee_value: parseNumberInput(ruleForm.platform_fee_value),
        is_active: ruleForm.is_active,
      });
      setFeedback({
        type: 'success',
        message: 'Payout rule saved successfully.',
      });
    } catch (error: any) {
      setFeedback({
        type: 'danger',
        message: error?.message || 'Failed to save payout rule.',
      });
    }
  };

  const handleRequestAction = async (
    id: string,
    action: 'approve' | 'reject' | 'mark_processing' | 'mark_paid' | 'cancel' | 'fail'
  ) => {
    setFeedback(null);
    try {
      await updateRequestStatus.mutateAsync({ id, action });
      setFeedback({
        type: 'success',
        message: `Payout request updated: ${action.replace('_', ' ')}.`,
      });
    } catch (error: any) {
      setFeedback({
        type: 'danger',
        message: error?.message || 'Failed to update payout request.',
      });
    }
  };

  return (
    <>
      <PageTitle title="Payouts" subName="Agency-scoped Community Hub withdrawals, destinations, and distribution rules." />

      {feedback && (
        <Alert variant={feedback.type} onClose={() => setFeedback(null)} dismissible>
          {feedback.message}
        </Alert>
      )}

      <Row className="g-3 mb-3">
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Available Balance</div>
              <div className="fs-4 fw-semibold">
                {summary ? formatMoney(summary.balances.available_amount, summary.balances.currency_symbol) : '—'}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Reserved Balance</div>
              <div className="fs-4 fw-semibold">
                {summary ? formatMoney(summary.balances.reserved_amount, summary.balances.currency_symbol) : '—'}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Paid Out</div>
              <div className="fs-4 fw-semibold">
                {summary ? formatMoney(summary.balances.paid_out_amount, summary.balances.currency_symbol) : '—'}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="small text-muted">Pending Requests</div>
              <div className="fs-4 fw-semibold">{summary?.counts.pending_requests ?? '—'}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body className="py-3">
          <Row className="g-3 align-items-center">
            <Col xl={8}>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <Badge bg="dark-subtle" text="dark">
                  Payout Workspace
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  Community Hub Only
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  Personal Hub Excluded
                </Badge>
                <small className="text-muted">
                  Only distributable Community Hub settlements appear here. Personal Hub transactions are excluded at the ledger level.
                </small>
              </div>
            </Col>
            <Col xl={4}>
              <Nav
                variant="pills"
                activeKey={activeTab}
                onSelect={(eventKey) => setActiveTab((eventKey as PayoutTab) || 'overview')}
                className="justify-content-xl-end gap-2 flex-wrap"
              >
                <Nav.Item>
                  <Nav.Link eventKey="overview">Overview</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="requests">Requests</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="destinations">Destinations</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="rules">Rules</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && (
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" />
            <span>Loading payout data...</span>
          </Card.Body>
        </Card>
      )}

      {activeTab === 'overview' && (
        <Row className="g-3">
          <Col xxl={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">Eligible Revenue</h5>
                    <small className="text-muted">Completed Community Hub settlements contributing to payout balance.</small>
                  </div>
                  <Badge bg="light" text="dark" className="border">
                    {summary?.counts.available_transactions ?? 0} available
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Payment</th>
                        <th>Community</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Agency Share</th>
                        <th>Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            No payout-eligible Community Hub settlements are available yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>
                              <div className="fw-semibold">{transaction.title}</div>
                              <small className="text-muted">
                                {transaction.reference_number || transaction.transaction_id || transaction.source_type}
                              </small>
                            </td>
                            <td>{transaction.community?.name || '—'}</td>
                            <td>
                              {transaction.unit?.block && transaction.unit?.unit_number
                                ? `${transaction.unit.block}-${transaction.unit.unit_number}`
                                : transaction.unit?.unit_number || '—'}
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(transaction.payout_status)}>{transaction.payout_status}</Badge>
                            </td>
                            <td>{transaction.agency_share.amount_formatted}</td>
                            <td>{transaction.payout_available.amount_formatted}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xxl={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-1">Payout Snapshot</h5>
                <small className="text-muted">Current finance scope and distribution posture.</small>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Role Scope</span>
                    <span className="fw-semibold text-capitalize">{summary?.scope.role_scope || '—'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Contributing Communities</span>
                    <span className="fw-semibold">{summary?.counts.contributing_communities ?? 0}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Destinations</span>
                    <span className="fw-semibold">{summary?.counts.destinations ?? 0}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Rules</span>
                    <span className="fw-semibold">{summary?.counts.rules ?? 0}</span>
                  </div>
                  <hr className="my-1" />
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Total Eligible Revenue</span>
                    <span className="fw-semibold">
                      {summary ? formatMoney(summary.balances.eligible_revenue_amount, summary.balances.currency_symbol) : '—'}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === 'requests' && (
        <Row className="g-3">
          <Col xxl={4}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-1">Create Payout Request</h5>
                <small className="text-muted">Reserve available agency balance for withdrawal.</small>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleCreateRequest}>
                  <Form.Group className="mb-3">
                    <Form.Label>Destination</Form.Label>
                    <Form.Select
                      value={selectedDestinationId}
                      onChange={(event) => setSelectedDestinationId(event.target.value)}
                    >
                      <option value="">Select payout destination</option>
                      {destinations
                        .filter((destination) => destination.status === 'active')
                        .map((destination) => (
                          <option key={destination.id} value={destination.id}>
                            {destination.label}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Requested Amount (GH₵)</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      step="0.01"
                      value={requestAmount}
                      onChange={(event) => setRequestAmount(event.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={requestNotes}
                      onChange={(event) => setRequestNotes(event.target.value)}
                      placeholder="Optional payout notes"
                    />
                  </Form.Group>
                  <Button type="submit" className="w-100" disabled={!canSubmitRequest}>
                    {createRequest.isPending ? 'Submitting...' : 'Submit Payout Request'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col xxl={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-1">Payout Requests</h5>
                <small className="text-muted">Agency withdrawal requests and approval states.</small>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Scope</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            No payout requests have been created yet.
                          </td>
                        </tr>
                      ) : (
                        requests.map((request) => (
                          <tr key={request.id}>
                            <td>
                              <div className="fw-semibold">{request.reference_number || request.id.slice(0, 8)}</div>
                              <small className="text-muted">{formatDateTime(request.created_at)}</small>
                            </td>
                            <td>{request.community?.name || request.agency?.name || 'Agency'}</td>
                            <td>{request.requested_amount_formatted}</td>
                            <td>
                              <Badge bg={getStatusVariant(request.status)}>{request.status}</Badge>
                            </td>
                            <td>{request.item_count}</td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end flex-wrap gap-2">
                                {request.status === 'pending_review' && (
                                  <>
                                    <Button size="sm" variant="outline-success" onClick={() => handleRequestAction(request.id, 'approve')}>
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="outline-danger" onClick={() => handleRequestAction(request.id, 'reject')}>
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status === 'approved' && (
                                  <Button size="sm" variant="outline-warning" onClick={() => handleRequestAction(request.id, 'mark_processing')}>
                                    Mark Processing
                                  </Button>
                                )}
                                {request.status === 'processing' && (
                                  <>
                                    <Button size="sm" variant="outline-success" onClick={() => handleRequestAction(request.id, 'mark_paid')}>
                                      Mark Paid
                                    </Button>
                                    <Button size="sm" variant="outline-danger" onClick={() => handleRequestAction(request.id, 'fail')}>
                                      Fail
                                    </Button>
                                  </>
                                )}
                                {(request.status === 'pending_review' || request.status === 'approved') && (
                                  <Button size="sm" variant="outline-secondary" onClick={() => handleRequestAction(request.id, 'cancel')}>
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === 'destinations' && (
        <Row className="g-3">
          <Col xxl={4}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-1">Add Payout Destination</h5>
                <small className="text-muted">Register an agency-owned bank or mobile money target.</small>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleCreateDestination}>
                  <Form.Group className="mb-3">
                    <Form.Label>Destination Type</Form.Label>
                    <Form.Select
                      value={destinationForm.destination_type}
                      onChange={(event) =>
                        setDestinationForm((current) => ({
                          ...current,
                          destination_type: event.target.value,
                        }))
                      }
                    >
                      <option value="bank_account">Bank Account</option>
                      <option value="mobile_money">Mobile Money</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Label</Form.Label>
                    <Form.Control
                      value={destinationForm.label}
                      onChange={(event) => setDestinationForm((current) => ({ ...current, label: event.target.value }))}
                      placeholder="Primary Agency Settlement"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Account Name</Form.Label>
                    <Form.Control
                      value={destinationForm.account_name}
                      onChange={(event) => setDestinationForm((current) => ({ ...current, account_name: event.target.value }))}
                    />
                  </Form.Group>
                  {destinationForm.destination_type === 'bank_account' ? (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Bank Name</Form.Label>
                        <Form.Control
                          value={destinationForm.bank_name}
                          onChange={(event) => setDestinationForm((current) => ({ ...current, bank_name: event.target.value }))}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Account Number</Form.Label>
                        <Form.Control
                          value={destinationForm.account_number}
                          onChange={(event) => setDestinationForm((current) => ({ ...current, account_number: event.target.value }))}
                        />
                      </Form.Group>
                    </>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Mobile Network</Form.Label>
                        <Form.Control
                          value={destinationForm.mobile_network}
                          onChange={(event) => setDestinationForm((current) => ({ ...current, mobile_network: event.target.value }))}
                          placeholder="MTN"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Mobile Number</Form.Label>
                        <Form.Control
                          value={destinationForm.mobile_number}
                          onChange={(event) => setDestinationForm((current) => ({ ...current, mobile_number: event.target.value }))}
                        />
                      </Form.Group>
                    </>
                  )}
                  <Form.Check
                    id="default-destination"
                    className="mb-3"
                    type="checkbox"
                    label="Set as default destination"
                    checked={destinationForm.is_default}
                    onChange={(event) => setDestinationForm((current) => ({ ...current, is_default: event.target.checked }))}
                  />
                  <Button type="submit" className="w-100" disabled={createDestination.isPending}>
                    {createDestination.isPending ? 'Saving...' : 'Save Destination'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col xxl={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-1">Payout Destinations</h5>
                <small className="text-muted">Verified agency-owned withdrawal destinations.</small>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Label</th>
                        <th>Type</th>
                        <th>Target</th>
                        <th>Status</th>
                        <th>Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {destinations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-4">
                            No payout destinations have been registered yet.
                          </td>
                        </tr>
                      ) : (
                        destinations.map((destination) => (
                          <tr key={destination.id}>
                            <td>
                              <div className="fw-semibold">{destination.label}</div>
                              <small className="text-muted">{destination.agency?.name || 'Agency'}</small>
                            </td>
                            <td className="text-capitalize">{destination.destination_type.replace('_', ' ')}</td>
                            <td>
                              {destination.destination_type === 'bank_account'
                                ? `${destination.bank_name || 'Bank'} • ${destination.account_number_masked || '—'}`
                                : `${destination.mobile_network || 'Mobile Money'} • ${destination.mobile_number_masked || '—'}`}
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(destination.status)}>{destination.status || 'active'}</Badge>
                            </td>
                            <td>{destination.is_default ? 'Yes' : 'No'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === 'rules' && (
        <Row className="g-3">
          <Col xxl={4}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-1">Distribution Rule</h5>
                <small className="text-muted">Control how Community Hub revenue is distributed.</small>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSaveRule}>
                  <Form.Group className="mb-3">
                    <Form.Label>Community Share Mode</Form.Label>
                    <Form.Select
                      value={ruleForm.community_share_mode}
                      onChange={(event) => setRuleForm((current) => ({ ...current, community_share_mode: event.target.value }))}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Community Share Value</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      step="0.01"
                      value={ruleForm.community_share_value}
                      onChange={(event) => setRuleForm((current) => ({ ...current, community_share_value: event.target.value }))}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Agency Share Mode</Form.Label>
                    <Form.Select
                      value={ruleForm.agency_share_mode}
                      onChange={(event) => setRuleForm((current) => ({ ...current, agency_share_mode: event.target.value }))}
                    >
                      <option value="remainder">Remainder</option>
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Agency Share Value</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      step="0.01"
                      value={ruleForm.agency_share_value}
                      onChange={(event) => setRuleForm((current) => ({ ...current, agency_share_value: event.target.value }))}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Platform Fee Mode</Form.Label>
                    <Form.Select
                      value={ruleForm.platform_fee_mode}
                      onChange={(event) => setRuleForm((current) => ({ ...current, platform_fee_mode: event.target.value }))}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Platform Fee Value</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      step="0.01"
                      value={ruleForm.platform_fee_value}
                      onChange={(event) => setRuleForm((current) => ({ ...current, platform_fee_value: event.target.value }))}
                    />
                  </Form.Group>
                  <Button type="submit" className="w-100" disabled={upsertRule.isPending}>
                    {upsertRule.isPending ? 'Saving...' : 'Save Rule'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col xxl={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-1">Active Rules</h5>
                <small className="text-muted">Only active rules are used when classifying newly completed Community Hub settlements.</small>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Scope</th>
                        <th>Community Share</th>
                        <th>Agency Share</th>
                        <th>Platform Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-4">
                            No payout rules configured yet. New distributable settlements will default to 100% agency share.
                          </td>
                        </tr>
                      ) : (
                        rules.map((rule) => (
                          <tr key={rule.id}>
                            <td>{rule.community?.name || rule.agency?.name || 'Global Agency Rule'}</td>
                            <td>{`${rule.community_share_mode} ${rule.community_share_value}`}</td>
                            <td>{`${rule.agency_share_mode} ${rule.agency_share_value}`}</td>
                            <td>{`${rule.platform_fee_mode} ${rule.platform_fee_value}`}</td>
                            <td>
                              <Badge bg={rule.is_active ? 'success' : 'secondary'}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default PayoutsPage;
