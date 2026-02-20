"use client";

import React, { useState } from 'react';
import { Table, Badge, Button, Pagination } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TransactionDetailsModal from './TransactionDetailsModal';

interface TransactionReportTableProps {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// Transaction status types and their corresponding styles
const TRANSACTION_STATUS = {
  completed: { variant: 'success', icon: 'ri:check-double-line' },
  pending: { variant: 'warning', icon: 'ri:time-line' },
  failed: { variant: 'danger', icon: 'ri:close-circle-line' },
  refunded: { variant: 'info', icon: 'ri:arrow-go-back-line' },
};

type TransactionStatusType = keyof typeof TRANSACTION_STATUS;

// Transaction service types and their corresponding styles
const TRANSACTION_SERVICES = {
  airtime: { variant: 'primary', icon: 'ri:phone-line' },
  data: { variant: 'info', icon: 'ri:wifi-line' },
  transfer: { variant: 'success', icon: 'ri:exchange-dollar-line' },
  bills: { variant: 'warning', icon: 'ri:bill-line' },
  insurance: { variant: 'danger', icon: 'ri:shield-check-line' },
  marketplace: { variant: 'secondary', icon: 'ri:shopping-cart-2-line' },
};

type TransactionServiceType = keyof typeof TRANSACTION_SERVICES;

interface Transaction {
  id: string;
  date: string;
  time: string;
  reference: string;
  service: TransactionServiceType;
  details: string;
  amount: string;
  user: string;
  status: TransactionStatusType;
}

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2023-09-15',
    time: '08:42:21',
    reference: 'TRX-583912',
    service: 'airtime',
    details: 'Airtime Purchase - 080012345678',
    amount: '$10.00',
    user: 'John Doe',
    status: 'completed'
  },
  {
    id: '2',
    date: '2023-09-15',
    time: '09:15:33',
    reference: 'TRX-583913',
    service: 'data',
    details: 'Data Bundle - 2GB - 080087654321',
    amount: '$5.00',
    user: 'Sarah Johnson',
    status: 'completed'
  },
  {
    id: '3',
    date: '2023-09-15',
    time: '10:03:45',
    reference: 'TRX-583914',
    service: 'transfer',
    details: 'Money Transfer to Michael Brown',
    amount: '$100.00',
    user: 'David Wilson',
    status: 'pending'
  },
  {
    id: '4',
    date: '2023-09-15',
    time: '11:22:17',
    reference: 'TRX-583915',
    service: 'bills',
    details: 'Electricity Bill - Account #12345',
    amount: '$45.50',
    user: 'Emily Wilson',
    status: 'completed'
  },
  {
    id: '5',
    date: '2023-09-15',
    time: '13:45:02',
    reference: 'TRX-583916',
    service: 'insurance',
    details: 'Health Insurance - Monthly Premium',
    amount: '$75.00',
    user: 'Robert Johnson',
    status: 'failed'
  },
  {
    id: '6',
    date: '2023-09-15',
    time: '14:33:22',
    reference: 'TRX-583917',
    service: 'marketplace',
    details: 'Order #ORD-2023-0004 - Wireless Headphones',
    amount: '$89.99',
    user: 'Lisa Martinez',
    status: 'completed'
  },
  {
    id: '7',
    date: '2023-09-15',
    time: '15:12:54',
    reference: 'TRX-583918',
    service: 'airtime',
    details: 'Airtime Purchase - 080011223344',
    amount: '$20.00',
    user: 'Michael Thompson',
    status: 'refunded'
  },
  {
    id: '8',
    date: '2023-09-15',
    time: '16:05:33',
    reference: 'TRX-583919',
    service: 'transfer',
    details: 'Money Transfer to Sarah Wilson',
    amount: '$250.00',
    user: 'James Anderson',
    status: 'completed'
  },
  {
    id: '9',
    date: '2023-09-15',
    time: '17:18:42',
    reference: 'TRX-583920',
    service: 'data',
    details: 'Data Bundle - 5GB - 080012345678',
    amount: '$10.00',
    user: 'Patricia Taylor',
    status: 'completed'
  },
  {
    id: '10',
    date: '2023-09-15',
    time: '18:32:11',
    reference: 'TRX-583921',
    service: 'bills',
    details: 'Water Bill - Account #54321',
    amount: '$35.25',
    user: 'Robert Smith',
    status: 'pending'
  },
];

const TransactionReportTable: React.FC<TransactionReportTableProps> = ({ dateRange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = DEMO_TRANSACTIONS.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(DEMO_TRANSACTIONS.length / itemsPerPage);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    console.log('Download receipt for:', transaction.reference);
    // Implement download functionality
  };

  const handleRefund = (transaction: Transaction) => {
    console.log('Initiate refund for:', transaction.reference);
    // Implement refund functionality
  };

  const handleResend = (transaction: Transaction) => {
    console.log('Retry transaction:', transaction.reference);
    // Implement retry functionality
  };

  return (
    <>
      <div className="table-responsive">
        <Table className="table-centered table-nowrap mb-0">
          <thead className="table-light">
            <tr>
              <th>Date & Time</th>
              <th>Reference</th>
              <th>Service</th>
              <th>Details</th>
              <th>Amount</th>
              <th>User</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <div className="d-flex flex-column">
                    <span>{transaction.date}</span>
                    <small className="text-muted">{transaction.time}</small>
                  </div>
                </td>
                <td>{transaction.reference}</td>
                <td>
                  <Badge bg={TRANSACTION_SERVICES[transaction.service].variant} className="px-2 py-1">
                    <IconifyIcon icon={TRANSACTION_SERVICES[transaction.service].icon} className="me-1" />
                    {transaction.service.charAt(0).toUpperCase() + transaction.service.slice(1)}
                  </Badge>
                </td>
                <td>{transaction.details}</td>
                <td><strong>{transaction.amount}</strong></td>
                <td>{transaction.user}</td>
                <td>
                  <Badge bg={TRANSACTION_STATUS[transaction.status].variant} className="px-2 py-1">
                    <IconifyIcon icon={TRANSACTION_STATUS[transaction.status].icon} className="me-1" />
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="link" 
                    className="p-0 me-2" 
                    title="View Details"
                    onClick={() => handleViewDetails(transaction)}
                  >
                    <IconifyIcon icon="ri:eye-line" />
                  </Button>
                  <Button 
                    variant="link" 
                    className="p-0 text-secondary" 
                    title="Download Receipt"
                    onClick={() => handleDownloadReceipt(transaction)}
                  >
                    <IconifyIcon icon="ri:download-2-line" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, DEMO_TRANSACTIONS.length)} of {DEMO_TRANSACTIONS.length} entries
          </div>
          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <Pagination.Item
                key={number}
                active={number === currentPage}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </Pagination.Item>
            ))}
            
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        transaction={currentTransaction}
        onDownloadReceipt={handleDownloadReceipt}
        onRefund={handleRefund}
        onResend={handleResend}
      />
    </>
  );
};

export default TransactionReportTable;
