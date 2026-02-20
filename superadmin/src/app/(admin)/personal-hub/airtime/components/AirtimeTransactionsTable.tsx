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

interface AirtimeTransaction {
  id: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  provider: {
    name: string;
    logo: string;
  };
  recipient: {
    phone: string;
    name?: string;
  };
  amount: string;
  fee: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  date: string;
  time: string;
}

interface AirtimeTransactionsTableProps {
  showFilters?: boolean;
  limit?: number;
}

const AirtimeTransactionsTable = ({ showFilters = false, limit }: AirtimeTransactionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<AirtimeTransaction | null>(null);
  
  // Sample data - would be fetched from API in production
  const transactions: AirtimeTransaction[] = [
    {
      id: 'TRX-1001',
      user: {
        id: 'USR-001',
        name: 'John Smith',
        phone: '+233 55 123 4567',
        avatar: '/assets/images/users/avatar-1.jpg',
      },
      provider: {
        name: 'MTN',
        logo: '/assets/images/mtn-logo.png',
      },
      recipient: {
        phone: '+233 24 765 4321',
        name: 'Self',
      },
      amount: '$10.00',
      fee: '$0.25',
      status: 'completed',
      payment_method: 'Mobile Money',
      date: '24 Sep 2023',
      time: '14:32',
    },
    {
      id: 'TRX-1002',
      user: {
        id: 'USR-002',
        name: 'Sarah Johnson',
        phone: '+233 50 987 6543',
      },
      provider: {
        name: 'Telecel',
        logo: '/assets/images/telecel-logo.png',
      },
      recipient: {
        phone: '+233 26 432 1098',
        name: 'Mom',
      },
      amount: '$5.00',
      fee: '$0.13',
      status: 'completed',
      payment_method: 'Credit Card',
      date: '24 Sep 2023',
      time: '13:15',
    },
    {
      id: 'TRX-1003',
      user: {
        id: 'USR-003',
        name: 'Michael Brown',
        phone: '+233 54 246 8135',
        avatar: '/assets/images/users/avatar-2.jpg',
      },
      provider: {
        name: 'AirtelTigo',
        logo: '/assets/images/airteltigo-logo.png',
      },
      recipient: {
        phone: '+233 27 531 7986',
      },
      amount: '$15.00',
      fee: '$0.38',
      status: 'pending',
      payment_method: 'Mobile Money',
      date: '24 Sep 2023',
      time: '12:05',
    },
    {
      id: 'TRX-1004',
      user: {
        id: 'USR-004',
        name: 'Emily Davis',
        phone: '+233 55 678 1234',
      },
      provider: {
        name: 'MTN',
        logo: '/assets/images/mtn-logo.png',
      },
      recipient: {
        phone: '+233 24 891 2345',
        name: 'Dad',
      },
      amount: '$20.00',
      fee: '$0.50',
      status: 'failed',
      payment_method: 'Bank Transfer',
      date: '24 Sep 2023',
      time: '10:47',
    },
    {
      id: 'TRX-1005',
      user: {
        id: 'USR-005',
        name: 'David Wilson',
        phone: '+233 50 345 6789',
        avatar: '/assets/images/users/avatar-3.jpg',
      },
      provider: {
        name: 'Telecel',
        logo: '/assets/images/telecel-logo.png',
      },
      recipient: {
        phone: '+233 26 432 1098',
      },
      amount: '$8.00',
      fee: '$0.20',
      status: 'refunded',
      payment_method: 'Mobile Money',
      date: '24 Sep 2023',
      time: '09:22',
    },
    {
      id: 'TRX-1006',
      user: {
        id: 'USR-006',
        name: 'Jennifer Lee',
        phone: '+233 54 890 1234',
      },
      provider: {
        name: 'Orange',
        logo: '/assets/images/orange-logo.png',
      },
      recipient: {
        phone: '+233 25 123 4567',
        name: 'Sister',
      },
      amount: '$12.00',
      fee: '$0.30',
      status: 'completed',
      payment_method: 'Credit Card',
      date: '23 Sep 2023',
      time: '17:43',
    },
  ];
  
  // Apply filters
  let filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.phone.includes(searchTerm) ||
      transaction.recipient.phone.includes(searchTerm);
      
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesProvider = filterProvider === 'all' || transaction.provider.name === filterProvider;
    
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
    
    return matchesSearch && matchesStatus && matchesProvider && matchesDateFrom && matchesDateTo;
  });
  
  // Apply limit if provided
  if (limit && filteredTransactions.length > limit) {
    filteredTransactions = filteredTransactions.slice(0, limit);
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: AirtimeTransaction['status']) => {
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
  
  // Handle transaction details view
  const handleViewDetails = (transaction: AirtimeTransaction) => {
    setCurrentTransaction(transaction);
    setShowDetailsModal(true);
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
                      placeholder="ID, name, phone..."
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
                  <Form.Label>Provider</Form.Label>
                  <Form.Select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="MTN">MTN</option>
                    <option value="Telecel">Telecel</option>
                    <option value="AirtelTigo">AirtelTigo</option>
                    <option value="Orange">Orange</option>
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
                  setFilterProvider('all');
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
              <th>Provider</th>
              <th>Recipient</th>
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
                      src={transaction.provider.logo} 
                      alt={transaction.provider.name} 
                      height="24" 
                      className="me-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                      }}
                    />
                    {transaction.provider.name}
                  </div>
                </td>
                <td>
                  <div>
                    <h5 className="font-14 mb-0">{transaction.recipient.phone}</h5>
                    {transaction.recipient.name && (
                      <span className="text-muted font-13">{transaction.recipient.name}</span>
                    )}
                  </div>
                </td>
                <td>{transaction.amount}</td>
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
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:repeat-line" className="me-1" />
                        Retry Transaction
                      </Dropdown.Item>
                      {transaction.status !== 'refunded' && (
                        <Dropdown.Item>
                          <IconifyIcon icon="ri:refund-2-line" className="me-1" />
                          Process Refund
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
            Transaction Details
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
                        <td className="text-muted">Payment Method:</td>
                        <td>{currentTransaction.payment_method}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Provider Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Provider:</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={currentTransaction.provider.logo} 
                              alt={currentTransaction.provider.name} 
                              height="24" 
                              className="me-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                              }}
                            />
                            {currentTransaction.provider.name}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Recipient Phone:</td>
                        <td>{currentTransaction.recipient.phone}</td>
                      </tr>
                      {currentTransaction.recipient.name && (
                        <tr>
                          <td className="text-muted">Recipient Name:</td>
                          <td>{currentTransaction.recipient.name}</td>
                        </tr>
                      )}
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
                      <p className="text-muted mb-0">User requested airtime purchase</p>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                      <h6 className="mb-0">Payment Processed</h6>
                      <p className="text-muted mb-0">Payment completed via {currentTransaction.payment_method}</p>
                    </div>
                    {currentTransaction.status === 'completed' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Airtime Credited</h6>
                        <p className="text-muted mb-0">Airtime successfully credited to recipient</p>
                      </div>
                    )}
                    {currentTransaction.status === 'pending' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Waiting for Confirmation</h6>
                        <p className="text-muted mb-0">Transaction is being processed by provider</p>
                      </div>
                    )}
                    {currentTransaction.status === 'failed' && (
                      <div className="mb-3">
                        <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                        <h6 className="mb-0">Transaction Failed</h6>
                        <p className="text-muted mb-0">Error from provider: Invalid recipient number</p>
                      </div>
                    )}
                    {currentTransaction.status === 'refunded' && (
                      <>
                        <div className="mb-3">
                          <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                          <h6 className="mb-0">Transaction Failed</h6>
                          <p className="text-muted mb-0">Error from provider: Network timeout</p>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted">{currentTransaction.date} • {currentTransaction.time}</small>
                          <h6 className="mb-0">Refund Initiated</h6>
                          <p className="text-muted mb-0">Refund processed to original payment method</p>
                        </div>
                      </>
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
          {currentTransaction && currentTransaction.status === 'failed' && (
            <Button variant="primary">
              <IconifyIcon icon="ri:repeat-line" className="me-1" />
              Retry Transaction
            </Button>
          )}
          {currentTransaction && currentTransaction.status === 'pending' && (
            <Button variant="warning">
              <IconifyIcon icon="ri:check-double-line" className="me-1" />
              Force Completion
            </Button>
          )}
          {currentTransaction && currentTransaction.status !== 'refunded' && (
            <Button variant="danger">
              <IconifyIcon icon="ri:refund-2-line" className="me-1" />
              Process Refund
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AirtimeTransactionsTable;
