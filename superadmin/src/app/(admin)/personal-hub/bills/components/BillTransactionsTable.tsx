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
import BillTransactionApprovalModal from './BillTransactionApprovalModal';

interface BillTransaction {
  id: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  biller: {
    name: string;
    logo: string;
    category: string;
  };
  account_number: string;
  amount: string;
  fee: string;
  total: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  reference: string;
  payment_method: string;
  date: string;
  time: string;
  receipt_number?: string;
}

interface BillTransactionsTableProps {
  showFilters?: boolean;
  limit?: number;
}

const BillTransactionsTable = ({ showFilters = false, limit }: BillTransactionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<BillTransaction | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  
  // Sample data - would be fetched from API in production
  const transactions: BillTransaction[] = [
    {
      id: 'BPT-10001',
      user: {
        id: 'USR-001',
        name: 'John Smith',
        phone: '+233 55 123 4567',
        avatar: '/assets/images/users/avatar-1.jpg',
      },
      biller: {
        name: 'Electricity Company of Ghana',
        logo: '/assets/images/billers/ecg-logo.png',
        category: 'utilities',
      },
      account_number: '01234567890',
      amount: '$85.50',
      fee: '$1.50',
      total: '$87.00',
      status: 'completed',
      reference: 'REF-ECG-12345',
      payment_method: 'Mobile Money',
      date: '24 Sep 2023',
      time: '14:32',
      receipt_number: 'ECG-RCT-78901',
    },
    {
      id: 'BPT-10002',
      user: {
        id: 'USR-002',
        name: 'Sarah Johnson',
        phone: '+233 50 987 6543',
      },
      biller: {
        name: 'Ghana Water Company',
        logo: '/assets/images/billers/gwcl-logo.png',
        category: 'utilities',
      },
      account_number: 'GW-9876543',
      amount: '$42.75',
      fee: '$1.00',
      total: '$43.75',
      status: 'completed',
      reference: 'REF-GW-67890',
      payment_method: 'Credit Card',
      date: '24 Sep 2023',
      time: '13:15',
      receipt_number: 'GW-RCT-45678',
    },
    {
      id: 'BPT-10003',
      user: {
        id: 'USR-003',
        name: 'Michael Brown',
        phone: '+233 54 246 8135',
        avatar: '/assets/images/users/avatar-2.jpg',
      },
      biller: {
        name: 'MTN Ghana',
        logo: '/assets/images/billers/mtn-logo.png',
        category: 'telecom',
      },
      account_number: '0244123456',
      amount: '$25.00',
      fee: '$0.50',
      total: '$25.50',
      status: 'pending',
      reference: 'REF-MTN-23456',
      payment_method: 'Mobile Money',
      date: '24 Sep 2023',
      time: '12:05',
    },
    {
      id: 'BPT-10004',
      user: {
        id: 'USR-004',
        name: 'Emily Davis',
        phone: '+233 55 678 1234',
      },
      biller: {
        name: 'DSTV',
        logo: '/assets/images/billers/dstv-logo.png',
        category: 'tv',
      },
      account_number: '5678901234',
      amount: '$65.00',
      fee: '$1.25',
      total: '$66.25',
      status: 'failed',
      reference: 'REF-DSTV-34567',
      payment_method: 'Credit Card',
      date: '24 Sep 2023',
      time: '10:47',
    },
    {
      id: 'BPT-10005',
      user: {
        id: 'USR-005',
        name: 'David Wilson',
        phone: '+233 50 345 6789',
        avatar: '/assets/images/users/avatar-3.jpg',
      },
      biller: {
        name: 'University of Ghana',
        logo: '/assets/images/billers/uog-logo.png',
        category: 'education',
      },
      account_number: 'UG-20230001',
      amount: '$750.00',
      fee: '$5.00',
      total: '$755.00',
      status: 'completed',
      reference: 'REF-UG-45678',
      payment_method: 'Bank Transfer',
      date: '23 Sep 2023',
      time: '16:22',
      receipt_number: 'UG-RCT-12345',
    },
    {
      id: 'BPT-10006',
      user: {
        id: 'USR-006',
        name: 'Jennifer Adams',
        phone: '+233 24 789 0123',
      },
      biller: {
        name: 'Vodafone Ghana',
        logo: '/assets/images/billers/vodafone-logo.png',
        category: 'telecom',
      },
      account_number: '0207890123',
      amount: '$18.50',
      fee: '$0.50',
      total: '$19.00',
      status: 'refunded',
      reference: 'REF-VOD-56789',
      payment_method: 'Mobile Money',
      date: '23 Sep 2023',
      time: '14:08',
    },
  ];
  
  // Apply filters
  let filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.phone.includes(searchTerm) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account_number.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || transaction.biller.category === filterCategory;
    
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
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDateFrom && matchesDateTo;
  });
  
  // Apply limit if provided
  if (limit && filteredTransactions.length > limit) {
    filteredTransactions = filteredTransactions.slice(0, limit);
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: BillTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Get category badge variant
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'utilities':
        return 'primary';
      case 'telecom':
        return 'info';
      case 'internet':
        return 'purple';
      case 'tv':
        return 'pink';
      case 'education':
        return 'success';
      case 'government':
        return 'dark';
      case 'insurance':
        return 'warning';
      case 'other':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  // Handle transaction details view
  const handleViewDetails = (transaction: BillTransaction) => {
    setCurrentTransaction(transaction);
    setShowDetailsModal(true);
  };

  // Handle approval/rejection
  const handleApprovalAction = (transaction: BillTransaction, action: 'approve' | 'reject') => {
    setCurrentTransaction(transaction);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Handle approval confirmation
  const handleApprovalConfirmation = async (transactionId: string, action: string, reason: string, additionalData?: any) => {
    console.log(`${action} bill payment ${transactionId}:`, reason, additionalData);
    alert(`Successfully ${action}d bill payment ${transactionId}`);
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
                      placeholder="ID, name, account number..."
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
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="utilities">Utilities</option>
                    <option value="telecom">Telecom</option>
                    <option value="internet">Internet</option>
                    <option value="tv">TV</option>
                    <option value="education">Education</option>
                    <option value="government">Government</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
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
                  setFilterCategory('all');
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
              <th>Biller</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
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
                      src={transaction.biller.logo} 
                      alt={transaction.biller.name} 
                      height="24" 
                      className="me-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                      }}
                    />
                    <div>
                      <span>{transaction.biller.name}</span>
                      <Badge 
                        bg={getCategoryBadgeVariant(transaction.biller.category)} 
                        className="ms-1 badge-soft-info"
                        pill
                      >
                        {transaction.biller.category}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td>
                  <div>{transaction.account_number}</div>
                </td>
                <td>
                  <div>{transaction.amount}</div>
                  <small className="text-muted">Fee: {transaction.fee}</small>
                </td>
                <td>
                  <Badge bg={getStatusBadgeVariant(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
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
                      {transaction.status === 'completed' && (
                        <Dropdown.Item>
                          <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                          View Receipt
                        </Dropdown.Item>
                      )}
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
            Bill Payment Details
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
                      {currentTransaction.receipt_number && (
                        <tr>
                          <td className="text-muted">Receipt Number:</td>
                          <td>{currentTransaction.receipt_number}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Biller Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Name:</td>
                        <td>{currentTransaction.biller.name}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Category:</td>
                        <td>
                          <Badge bg={getCategoryBadgeVariant(currentTransaction.biller.category)}>
                            {currentTransaction.biller.category.charAt(0).toUpperCase() + currentTransaction.biller.category.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Account Number:</td>
                        <td>{currentTransaction.account_number}</td>
                      </tr>
                    </tbody>
                  </Table>
                  
                  <h5 className="mt-3">User Information</h5>
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
                  <h5>Transaction Timeline</h5>
                  <div className="border-start border-2 ps-3 ms-3">
                    <div className="mb-3">
                      <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                      <h6 className="mb-0">Transaction Initiated</h6>
                      <p className="text-muted mb-0">User initiated bill payment</p>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                      <h6 className="mb-0">Payment Processed</h6>
                      <p className="text-muted mb-0">Payment completed via {currentTransaction.payment_method}</p>
                    </div>
                    {currentTransaction.status === 'completed' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Payment Confirmed</h6>
                        <p className="text-muted mb-0">Bill payment successfully processed</p>
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
                        <p className="text-muted mb-0">Payment could not be completed</p>
                      </div>
                    )}
                    {currentTransaction.status === 'refunded' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Payment Refunded</h6>
                        <p className="text-muted mb-0">Amount has been refunded to the user</p>
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
          {currentTransaction && currentTransaction.status === 'completed' && (
            <Button variant="primary">
              <IconifyIcon icon="ri:printer-line" className="me-1" />
              Print Receipt
            </Button>
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

      {/* Bill Transaction Approval Modal */}
      <BillTransactionApprovalModal
        show={showApprovalModal}
        onHide={() => setShowApprovalModal(false)}
        transaction={currentTransaction}
        action={approvalAction}
        onConfirm={handleApprovalConfirmation}
      />
    </>
  );
};

export default BillTransactionsTable;
