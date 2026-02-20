"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Dropdown, 
  Row,
  Col,
  Card,
  Modal
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TransactionApprovalModal from './TransactionApprovalModal';
import FlagTransactionModal from './FlagTransactionModal';

interface TransferTransaction {
  id: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  service: {
    name: string;
    logo: string;
    type: 'domestic' | 'international';
  };
  recipient: {
    name: string;
    phone?: string;
    accountNumber?: string;
    bankName?: string;
    country: string;
  };
  amount: string;
  fee: string;
  total: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'flagged';
  reference: string;
  payment_method: string;
  date: string;
  time: string;
  compliance: {
    kyc_verified: boolean;
    risk_level: 'low' | 'medium' | 'high';
    flagged_reason?: string;
  };
}

interface TransferTransactionsTableProps {
  showFilters?: boolean;
  limit?: number;
}

const TransferTransactionsTable = ({ showFilters = false, limit }: TransferTransactionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<TransferTransaction | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  
  // Sample data - would be fetched from API in production
  const transactions: TransferTransaction[] = [
    {
      id: 'TRX-9001',
      user: {
        id: 'USR-001',
        name: 'John Smith',
        phone: '+233 55 123 4567',
        avatar: '/assets/images/users/avatar-1.jpg',
      },
      service: {
        name: 'Mobile Money Transfer',
        logo: '/assets/images/mobile-money-logo.png',
        type: 'domestic',
      },
      recipient: {
        name: 'Michael Johnson',
        phone: '+233 24 765 4321',
        country: 'Ghana',
      },
      amount: '$100.00',
      fee: '$1.50',
      total: '$101.50',
      status: 'completed',
      reference: 'REF-12345',
      payment_method: 'Mobile Money',
      date: '24 Sep 2023',
      time: '14:32',
      compliance: {
        kyc_verified: true,
        risk_level: 'low',
      },
    },
    {
      id: 'TRX-9002',
      user: {
        id: 'USR-002',
        name: 'Sarah Johnson',
        phone: '+233 50 987 6543',
      },
      service: {
        name: 'Bank Transfer',
        logo: '/assets/images/bank-transfer-logo.png',
        type: 'domestic',
      },
      recipient: {
        name: 'Ghana Commercial Bank',
        accountNumber: '1234567890',
        bankName: 'GCB Bank',
        country: 'Ghana',
      },
      amount: '$500.00',
      fee: '$3.00',
      total: '$503.00',
      status: 'completed',
      reference: 'REF-12346',
      payment_method: 'Credit Card',
      date: '24 Sep 2023',
      time: '13:15',
      compliance: {
        kyc_verified: true,
        risk_level: 'low',
      },
    },
    {
      id: 'TRX-9003',
      user: {
        id: 'USR-003',
        name: 'Michael Brown',
        phone: '+233 54 246 8135',
        avatar: '/assets/images/users/avatar-2.jpg',
      },
      service: {
        name: 'International Wire',
        logo: '/assets/images/international-wire-logo.png',
        type: 'international',
      },
      recipient: {
        name: 'Chase Bank',
        accountNumber: '9876543210',
        bankName: 'Chase Bank USA',
        country: 'USA',
      },
      amount: '$1,500.00',
      fee: '$37.50',
      total: '$1,537.50',
      status: 'pending',
      reference: 'REF-12347',
      payment_method: 'Bank Account',
      date: '24 Sep 2023',
      time: '12:05',
      compliance: {
        kyc_verified: true,
        risk_level: 'medium',
      },
    },
    {
      id: 'TRX-9004',
      user: {
        id: 'USR-004',
        name: 'Emily Davis',
        phone: '+233 55 678 1234',
      },
      service: {
        name: 'Western Union',
        logo: '/assets/images/western-union-logo.png',
        type: 'international',
      },
      recipient: {
        name: 'David Williams',
        country: 'UK',
      },
      amount: '$750.00',
      fee: '$22.50',
      total: '$772.50',
      status: 'failed',
      reference: 'REF-12348',
      payment_method: 'Credit Card',
      date: '24 Sep 2023',
      time: '10:47',
      compliance: {
        kyc_verified: false,
        risk_level: 'medium',
      },
    },
    {
      id: 'TRX-9005',
      user: {
        id: 'USR-005',
        name: 'David Wilson',
        phone: '+233 50 345 6789',
        avatar: '/assets/images/users/avatar-3.jpg',
      },
      service: {
        name: 'MoneyGram',
        logo: '/assets/images/moneygram-logo.png',
        type: 'international',
      },
      recipient: {
        name: 'Sarah Johnson',
        country: 'South Africa',
      },
      amount: '$350.00',
      fee: '$9.80',
      total: '$359.80',
      status: 'flagged',
      reference: 'REF-12349',
      payment_method: 'Mobile Money',
      date: '24 Sep 2023',
      time: '09:22',
      compliance: {
        kyc_verified: true,
        risk_level: 'high',
        flagged_reason: 'Unusual destination country for this user',
      },
    },
  ];
  
  // Apply filters
  let filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.phone.includes(searchTerm) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesService = filterService === 'all' || transaction.service.name === filterService;
    
    // Date filters
    let matchesDateFrom = true;
    let matchesDateTo = true;
    
    if (filterDateFrom) {
      // This is a simplified check - in production, we would convert dates properly
      matchesDateFrom = transaction.date >= filterDateFrom;
    }
    
    if (filterDateTo) {
      // This is a simplified check - in production, we would convert dates properly
      matchesDateTo = transaction.date <= filterDateTo;
    }
    
    return matchesSearch && matchesStatus && matchesService && matchesDateFrom && matchesDateTo;
  });
  
  // Apply limit if provided
  if (limit && filteredTransactions.length > limit) {
    filteredTransactions = filteredTransactions.slice(0, limit);
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: TransferTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'info';
      case 'flagged':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  // Get risk level badge
  const getRiskBadgeVariant = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  // Handle transaction details view
  const handleViewDetails = (transaction: TransferTransaction) => {
    setCurrentTransaction(transaction);
    setShowDetailsModal(true);
  };

  // Handle approval/rejection
  const handleApprovalAction = (transaction: TransferTransaction, action: 'approve' | 'reject') => {
    setCurrentTransaction(transaction);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Handle flag transaction
  const handleFlagTransaction = (transaction: TransferTransaction) => {
    setCurrentTransaction(transaction);
    setShowFlagModal(true);
  };

  // Handle approval confirmation
  const handleApprovalConfirmation = async (transactionId: string, action: string, reason: string, additionalData?: any) => {
    console.log(`${action} transaction ${transactionId}:`, reason, additionalData);
    alert(`Successfully ${action}d transaction ${transactionId}`);
  };

  // Handle flag confirmation
  const handleFlagConfirmation = async (transactionId: string, flagType: string, reason: string, priority: string, additionalData?: any) => {
    console.log(`Flagged transaction ${transactionId}:`, flagType, reason, priority, additionalData);
    alert(`Successfully flagged transaction ${transactionId} for ${flagType}`);
  };

  return (
    <>
      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={3} className="mb-2">
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder="ID, name, reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="secondary">
                      <IconifyIcon icon="ri:search-line" />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="flagged">Flagged</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Service</Form.Label>
                  <Form.Select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="Mobile Money Transfer">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="International Wire">International Wire</option>
                    <option value="Western Union">Western Union</option>
                    <option value="MoneyGram">MoneyGram</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Date From</Form.Label>
                  <Form.Control
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Date To</Form.Label>
                  <Form.Control
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={1} className="mb-2 d-flex align-items-end">
                <Button variant="light" className="w-100" onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterService('all');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}>
                  Reset
                </Button>
              </Col>
            </Row>
            
            <Row className="mt-2">
              <Col xs={12} className="d-flex justify-content-between">
                <div>
                  <span className="text-muted me-2">Total: {filteredTransactions.length} transactions</span>
                </div>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    <IconifyIcon icon="ri:download-2-line" className="me-1" />
                    Export CSV
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <IconifyIcon icon="ri:printer-line" className="me-1" />
                    Print
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Transactions Table */}
      <div className="table-responsive">
        <Table className="table-centered table-nowrap mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Service</th>
              <th>Recipient</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className={transaction.status === 'flagged' ? 'table-warning' : ''}>
                <td>{transaction.id}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm rounded-circle bg-light me-2">
                      {transaction.user.avatar ? (
                        <img 
                          src={transaction.user.avatar} 
                          alt={transaction.user.name} 
                          className="img-fluid rounded-circle" 
                          height="32"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                          }}
                        />
                      ) : (
                        <span className="avatar-title rounded-circle">
                          {transaction.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h5 className="font-14 mb-0">{transaction.user.name}</h5>
                      <span className="text-muted font-13">{transaction.user.phone}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <img 
                      src={transaction.service.logo} 
                      alt={transaction.service.name} 
                      height="24" 
                      className="me-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                      }}
                    />
                    <div>
                      <span>{transaction.service.name}</span>
                      <Badge 
                        bg={transaction.service.type === 'domestic' ? 'info' : 'primary'} 
                        className="ms-1 badge-soft-info"
                        pill
                      >
                        {transaction.service.type}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <h5 className="font-14 mb-0">{transaction.recipient.name}</h5>
                    <span className="text-muted font-13">
                      {transaction.recipient.phone || transaction.recipient.accountNumber || ''}
                    </span>
                    <div className="mt-1">
                      <Badge bg="light" text="dark">
                        {transaction.recipient.country}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td>
                  <div>{transaction.amount}</div>
                  <small className="text-muted">Fee: {transaction.fee}</small>
                </td>
                <td>
                  <Badge bg={getStatusBadgeVariant(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                  {transaction.compliance.risk_level !== 'low' && (
                    <div className="mt-1">
                      <Badge bg={getRiskBadgeVariant(transaction.compliance.risk_level)}>
                        {transaction.compliance.risk_level} risk
                      </Badge>
                    </div>
                  )}
                </td>
                <td>
                  <div>{transaction.date}</div>
                  <div className="text-muted">{transaction.time}</div>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewDetails(transaction)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      {transaction.status === 'pending' && (
                        <>
                          <Dropdown.Item onClick={() => handleApprovalAction(transaction, 'approve')}>
                            <IconifyIcon icon="ri:check-double-line" className="me-1" />
                            Approve
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleApprovalAction(transaction, 'reject')}>
                            <IconifyIcon icon="ri:close-circle-line" className="me-1" />
                            Reject
                          </Dropdown.Item>
                        </>
                      )}
                      {transaction.status === 'flagged' && (
                        <>
                          <Dropdown.Item>
                            <IconifyIcon icon="ri:shield-check-line" className="me-1" />
                            Clear Flag
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <IconifyIcon icon="ri:alarm-warning-line" className="me-1 text-danger" />
                            Escalate
                          </Dropdown.Item>
                        </>
                      )}
                      {transaction.status === 'failed' && (
                        <Dropdown.Item>
                          <IconifyIcon icon="ri:repeat-line" className="me-1" />
                          Retry Transaction
                        </Dropdown.Item>
                      )}
                      {['completed', 'pending'].includes(transaction.status) && (
                        <Dropdown.Item>
                          <IconifyIcon icon="ri:refund-2-line" className="me-1" />
                          Process Refund
                        </Dropdown.Item>
                      )}
                      {!['flagged'].includes(transaction.status) && (
                        <Dropdown.Item onClick={() => handleFlagTransaction(transaction)}>
                          <IconifyIcon icon="ri:flag-line" className="me-1" />
                          Flag for Review
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                        View Receipt
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-4">
            <IconifyIcon icon="ri:search-line" className="font-36 text-muted" />
            <h5 className="mt-2">No transactions found</h5>
            <p className="text-muted">Try adjusting your search or filter parameters</p>
          </div>
        )}
      </div>
      
      {/* Transaction Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Money Transfer Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTransaction && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Transaction Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">ID:</td>
                        <td>{currentTransaction.id}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Reference:</td>
                        <td>{currentTransaction.reference}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Status:</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(currentTransaction.status)}>
                            {currentTransaction.status.charAt(0).toUpperCase() + currentTransaction.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Date & Time:</td>
                        <td>{currentTransaction.date} at {currentTransaction.time}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Amount:</td>
                        <td>{currentTransaction.amount}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Fee:</td>
                        <td>{currentTransaction.fee}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Total:</td>
                        <td><strong>{currentTransaction.total}</strong></td>
                      </tr>
                      <tr>
                        <td className="text-muted">Payment Method:</td>
                        <td>{currentTransaction.payment_method}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Recipient Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Name:</td>
                        <td>{currentTransaction.recipient.name}</td>
                      </tr>
                      {currentTransaction.recipient.phone && (
                        <tr>
                          <td className="text-muted">Phone:</td>
                          <td>{currentTransaction.recipient.phone}</td>
                        </tr>
                      )}
                      {currentTransaction.recipient.accountNumber && (
                        <tr>
                          <td className="text-muted">Account Number:</td>
                          <td>{currentTransaction.recipient.accountNumber}</td>
                        </tr>
                      )}
                      {currentTransaction.recipient.bankName && (
                        <tr>
                          <td className="text-muted">Bank Name:</td>
                          <td>{currentTransaction.recipient.bankName}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="text-muted">Country:</td>
                        <td>{currentTransaction.recipient.country}</td>
                      </tr>
                    </tbody>
                  </Table>
                  
                  <h5 className="mt-3">Sender Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Name:</td>
                        <td>{currentTransaction.user.name}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">User ID:</td>
                        <td>{currentTransaction.user.id}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Phone:</td>
                        <td>{currentTransaction.user.phone}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <Row className="mt-3">
                <Col xs={12}>
                  <h5>Compliance Information</h5>
                  <div className="p-3 border rounded">
                    <div className="mb-2">
                      <strong>KYC Status:</strong>{' '}
                      {currentTransaction.compliance.kyc_verified ? (
                        <Badge bg="success">Verified</Badge>
                      ) : (
                        <Badge bg="warning">Not Verified</Badge>
                      )}
                    </div>
                    <div className="mb-2">
                      <strong>Risk Level:</strong>{' '}
                      <Badge bg={getRiskBadgeVariant(currentTransaction.compliance.risk_level)}>
                        {currentTransaction.compliance.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                    {currentTransaction.compliance.flagged_reason && (
                      <div className="mb-2">
                        <strong>Flag Reason:</strong>{' '}
                        <span className="text-danger">{currentTransaction.compliance.flagged_reason}</span>
                      </div>
                    )}
                    {currentTransaction.status === 'flagged' && (
                      <div className="alert alert-warning mb-0">
                        <IconifyIcon icon="ri:alert-line" className="me-1" />
                        This transaction requires additional review due to compliance concerns.
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
              
              <Row className="mt-3">
                <Col xs={12}>
                  <h5>Transaction Timeline</h5>
                  <div className="border-start border-2 ps-3 ms-3">
                    <div className="mb-3">
                      <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                      <h6 className="mb-0">Transaction Initiated</h6>
                      <p className="text-muted mb-0">User initiated money transfer</p>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                      <h6 className="mb-0">Payment Processed</h6>
                      <p className="text-muted mb-0">Payment completed via {currentTransaction.payment_method}</p>
                    </div>
                    {currentTransaction.status === 'completed' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Transfer Completed</h6>
                        <p className="text-muted mb-0">Funds successfully transferred to recipient</p>
                      </div>
                    )}
                    {currentTransaction.status === 'pending' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Waiting for Confirmation</h6>
                        <p className="text-muted mb-0">Transaction is being processed</p>
                      </div>
                    )}
                    {currentTransaction.status === 'failed' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Transaction Failed</h6>
                        <p className="text-muted mb-0">Transfer could not be completed</p>
                      </div>
                    )}
                    {currentTransaction.status === 'flagged' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Transaction Flagged</h6>
                        <p className="text-muted mb-0">Flagged for compliance review: {currentTransaction.compliance.flagged_reason}</p>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {currentTransaction && currentTransaction.status === 'flagged' && (
            <>
              <Button variant="success">
                <IconifyIcon icon="ri:shield-check-line" className="me-1" />
                Clear Flag
              </Button>
              <Button variant="danger">
                <IconifyIcon icon="ri:alarm-warning-line" className="me-1" />
                Escalate
              </Button>
            </>
          )}
          {currentTransaction && currentTransaction.status === 'pending' && (
            <>
              <Button variant="success" onClick={() => handleApprovalAction(currentTransaction, 'approve')}>
                <IconifyIcon icon="ri:check-double-line" className="me-1" />
                Approve
              </Button>
              <Button variant="danger" onClick={() => handleApprovalAction(currentTransaction, 'reject')}>
                <IconifyIcon icon="ri:close-circle-line" className="me-1" />
                Reject
              </Button>
            </>
          )}
          {currentTransaction && currentTransaction.status === 'failed' && (
            <Button variant="primary">
              <IconifyIcon icon="ri:repeat-line" className="me-1" />
              Retry Transaction
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Transaction Approval Modal */}
      <TransactionApprovalModal
        show={showApprovalModal}
        onHide={() => setShowApprovalModal(false)}
        transaction={currentTransaction}
        action={approvalAction}
        onConfirm={handleApprovalConfirmation}
      />

      {/* Flag Transaction Modal */}
      <FlagTransactionModal
        show={showFlagModal}
        onHide={() => setShowFlagModal(false)}
        transaction={currentTransaction}
        onFlag={handleFlagConfirmation}
      />
    </>
  );
};

export default TransferTransactionsTable;
