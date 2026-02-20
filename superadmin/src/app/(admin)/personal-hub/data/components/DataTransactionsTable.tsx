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

// This component is similar to the AirtimeTransactionsTable but for data packages

interface DataTransaction {
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
  package: {
    name: string;
    dataAmount: string;
    validityDays: number;
  };
  amount: string;
  fee: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  date: string;
  time: string;
}

interface DataTransactionsTableProps {
  showFilters?: boolean;
  limit?: number;
}

const DataTransactionsTable = ({ showFilters = false, limit }: DataTransactionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');

  // Sample data - would be fetched from API in production
  const transactions: DataTransaction[] = [
    {
      id: 'TRX-2001',
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
      package: {
        name: 'Daily 1GB',
        dataAmount: '1GB',
        validityDays: 1,
      },
      amount: '$1.99',
      fee: '$0.05',
      status: 'completed',
      payment_method: 'Mobile Money',
      date: '24 Sep 2023',
      time: '14:32',
    },
    // More sample transactions would be added here
  ];
  
  // Apply filters
  let filteredTransactions = transactions;
  if (limit && filteredTransactions.length > limit) {
    filteredTransactions = filteredTransactions.slice(0, limit);
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: DataTransaction['status']) => {
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

  return (
    <>
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
              
              <Col md={3} className="mb-2">
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
              
              <Col md={3} className="mb-2">
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
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3} className="mb-2 d-flex align-items-end">
                <Button variant="outline-secondary" className="me-2">
                  <IconifyIcon icon="ri:download-2-line" className="me-1" />
                  Export
                </Button>
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
              <th>Package</th>
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
                    <h5 className="font-14 mb-0">{transaction.package.name}</h5>
                    <span className="text-muted font-13">
                      {transaction.package.dataAmount}, {transaction.package.validityDays} day{transaction.package.validityDays > 1 ? 's' : ''}
                    </span>
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
                  <Button variant="link" className="p-0 text-secondary">
                    <IconifyIcon icon="ri:more-2-fill" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  <IconifyIcon icon="ri:search-line" className="font-36 text-muted" />
                  <h5 className="mt-2">No transactions found</h5>
                  <p className="text-muted">Try adjusting your search or filter parameters</p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default DataTransactionsTable;
