"use client";

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Table, Badge, Button, Dropdown } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TransactionDetailsModal from './TransactionDetailsModal';

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  total_amount: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  service_type?: string;
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions: propTransactions }) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Process real data or use fallback
  const processTransactions = () => {
    if (!propTransactions || propTransactions.length === 0) {
      return [
        {
          id: 'TRX-2938',
          user: { 
            name: 'David Wilson', 
            avatar: '/assets/images/users/avatar-1.jpg' 
          },
          service: 'Airtime',
          amount: '₦1,000',
          status: 'completed' as const,
          date: '24 Sep 2023',
          time: '14:32',
            },
      ];
    }

    return propTransactions.map(transaction => ({
      id: transaction.id,
      user: { 
        name: `User ${transaction.user_id.slice(-4)}`, // Placeholder user name
        avatar: undefined
      },
      service: getServiceDisplayName(transaction.transaction_type || transaction.service_type || 'unknown'),
      amount: `₦${transaction.total_amount?.toLocaleString() || '0'}`,
      status: transaction.status,
      date: new Date(transaction.created_at).toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: new Date(transaction.created_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
    }));
  };

  const getServiceDisplayName = (serviceType: string) => {
    switch (serviceType) {
      case 'airtime': return 'Airtime';
      case 'data': return 'Data';
      case 'money_transfer': return 'Money Transfer';
      case 'bill_payment': return 'Bill Payment';
      case 'insurance': return 'Insurance';
      case 'marketplace': return 'Marketplace';
      default: return 'Unknown';
    }
  };

  const transactions = processTransactions();
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  // Get service icon
  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Airtime':
        return 'ri:smartphone-line';
      case 'Data':
        return 'ri:wifi-line';
      case 'Money Transfer':
        return 'ri:exchange-dollar-line';
      case 'Bill Payment':
        return 'ri:bill-line';
      case 'Marketplace':
        return 'ri:store-2-line';
      default:
        return 'ri:question-line';
    }
  };

  // Handle view transaction details
  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  return (
    <>
      <TransactionDetailsModal
        show={showTransactionModal}
        onHide={() => setShowTransactionModal(false)}
        transaction={selectedTransaction}
      />
    <Card className="mb-3">
      <CardHeader className="d-flex align-items-center justify-content-between">
        <CardTitle className="mb-0">Recent Transactions</CardTitle>
        <Button variant="link" className="p-0 text-decoration-none">
          View All <IconifyIcon icon="ri:arrow-right-line" />
        </Button>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="table-responsive">
          <Table className="table-centered table-nowrap mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
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
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-1">
                        <IconifyIcon icon={getServiceIcon(transaction.service)} />
                      </div>
                      {transaction.service}
                    </div>
                  </td>
                  <td>{transaction.amount}</td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(transaction.status)} className="badge-soft-success">
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
                        <Dropdown.Item onClick={() => handleViewTransaction(transaction)}>
                          <IconifyIcon icon="ri:eye-line" className="me-1" />
                          View Details
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                          View Receipt
                        </Dropdown.Item>
                        {transaction.status === 'failed' && (
                          <Dropdown.Item>
                            <IconifyIcon icon="ri:repeat-line" className="me-1" />
                            Retry Transaction
                          </Dropdown.Item>
                        )}
                        {transaction.status === 'completed' && (
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
        </div>
      </CardBody>
    </Card>
    </>
  );
};

export default RecentTransactionsTable;
