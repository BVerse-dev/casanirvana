'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Badge, Button, Pagination, Table } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  PersonalHubReportTransaction,
} from '@/hooks/usePersonalHubReports';
import TransactionDetailsModal from './TransactionDetailsModal';

interface TransactionReportTableProps {
  transactions: PersonalHubReportTransaction[];
  transactionsTotal: number;
  transactionsReturned: number;
  transactionsTruncated: boolean;
  showServiceColumn?: boolean;
}

const ITEMS_PER_PAGE = 12;

const STATUS_META: Record<PersonalHubReportTransaction['status'], { bg: string; icon: string }> = {
  completed: { bg: 'success', icon: 'ri:checkbox-circle-line' },
  pending: { bg: 'warning', icon: 'ri:time-line' },
  failed: { bg: 'danger', icon: 'ri:error-warning-line' },
};

const SERVICE_META: Record<string, { bg: string; icon: string }> = {
  airtime: { bg: 'primary', icon: 'ri:phone-line' },
  data: { bg: 'info', icon: 'ri:wifi-line' },
  money_transfer: { bg: 'success', icon: 'ri:exchange-funds-line' },
  bill_payment: { bg: 'warning', icon: 'ri:bill-line' },
  insurance: { bg: 'danger', icon: 'ri:shield-check-line' },
  marketplace: { bg: 'secondary', icon: 'ri:shopping-bag-3-line' },
};

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const TransactionReportTable = ({
  transactions,
  transactionsTotal,
  transactionsReturned,
  transactionsTruncated,
  showServiceColumn = true,
}: TransactionReportTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<PersonalHubReportTransaction | null>(null);

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, transactions]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  if (transactions.length === 0) {
    return (
      <div className="py-5 text-center text-muted">
        <IconifyIcon icon="ri:file-search-line" className="fs-2 d-block mb-2" />
        No Personal Hub transactions match the current filters.
      </div>
    );
  }

  return (
    <>
      {transactionsTruncated && (
        <Alert variant="warning" className="mb-3">
          Showing the newest {transactionsReturned.toLocaleString('en-GH')} transaction rows out of {transactionsTotal.toLocaleString('en-GH')} filtered results. Narrow the filters before exporting if you need a smaller exact set.
        </Alert>
      )}

      <div className="table-responsive">
        <Table className="table-centered align-middle table-nowrap mb-0">
          <thead className="table-light">
            <tr>
              <th>Created</th>
              <th>Reference</th>
              {showServiceColumn ? <th>Service</th> : null}
              <th>Resident</th>
              <th>Provider</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((transaction) => {
              const serviceMeta = SERVICE_META[transaction.transaction_type] || {
                bg: 'secondary',
                icon: 'ri:apps-2-line',
              };
              const statusMeta = STATUS_META[transaction.status];

              return (
                <tr key={transaction.id}>
                  <td>{formatDateTime(transaction.created_at)}</td>
                  <td>
                    <div className="fw-semibold">{transaction.transaction_id || transaction.payment_id || transaction.id}</div>
                    <div className="text-muted small">{transaction.recipient_name || transaction.recipient_identifier || 'No recipient detail'}</div>
                  </td>
                  {showServiceColumn ? (
                    <td>
                      <Badge bg={serviceMeta.bg} className="d-inline-flex align-items-center gap-1">
                        <IconifyIcon icon={serviceMeta.icon} />
                        {transaction.service}
                      </Badge>
                    </td>
                  ) : null}
                  <td>
                    <div className="fw-semibold">{transaction.user.name}</div>
                    <div className="text-muted small">{transaction.community?.name || 'No community'}</div>
                  </td>
                  <td>{transaction.provider || '—'}</td>
                  <td className="fw-semibold">{transaction.amount_formatted}</td>
                  <td>
                    <Badge bg={statusMeta.bg} className="text-capitalize d-inline-flex align-items-center gap-1">
                      <IconifyIcon icon={statusMeta.icon} />
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button variant="light" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                      <IconifyIcon icon="ri:eye-line" className="me-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
          <div className="text-muted small">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} of {transactions.length.toLocaleString('en-GH')} loaded rows
          </div>
          <Pagination className="mb-0">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(Math.max(currentPage - 3, 0), Math.max(currentPage - 3, 0) + 5)
              .map((page) => (
                <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                  {page}
                </Pagination.Item>
              ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      )}

      <TransactionDetailsModal
        show={Boolean(selectedTransaction)}
        onHide={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default TransactionReportTable;
