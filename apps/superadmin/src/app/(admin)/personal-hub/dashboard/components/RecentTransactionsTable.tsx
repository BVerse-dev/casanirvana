"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardBody, CardHeader, CardTitle, Table, Badge } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TransactionDetailsModal from './TransactionDetailsModal';
import type { PersonalHubDashboardTransaction } from '@/hooks/usePersonalHubDashboard';

interface RecentTransactionsTableProps {
  transactions: PersonalHubDashboardTransaction[];
}

const statusVariant = (status: PersonalHubDashboardTransaction['status']) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'warning';
  }
};

const serviceIcon = (service: string) => {
  switch (service) {
    case 'Airtime':
      return 'ri:smartphone-line';
    case 'Data':
      return 'ri:wifi-line';
    case 'Money Transfer':
      return 'ri:exchange-dollar-line';
    case 'Bill Payment':
      return 'ri:bill-line';
    case 'Insurance':
      return 'ri:shield-check-line';
    case 'Marketplace':
      return 'ri:store-2-line';
    default:
      return 'ri:question-line';
  }
};

const formatTimestamp = (value: string | null) => {
  if (!value) return 'Unknown';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';

  return parsed.toLocaleString('en-GH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<PersonalHubDashboardTransaction | null>(null);

  return (
    <>
      <TransactionDetailsModal
        show={Boolean(selectedTransaction)}
        onHide={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />

      <Card className="mb-3">
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle className="mb-0">Recent Transactions</CardTitle>
          <Link href="/personal-hub/reports" className="btn btn-link p-0 text-decoration-none">
            View Reports <IconifyIcon icon="ri:arrow-right-line" />
          </Link>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="table-responsive">
            <Table className="table-centered table-nowrap mb-0">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Resident</th>
                  <th>Service</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-5">
                      No Personal Hub transactions in the selected period.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="fw-semibold">{transaction.transaction_id || transaction.payment_id || transaction.id}</div>
                        <div className="text-muted small">{transaction.recipient_name || transaction.recipient_identifier || 'Resident initiated flow'}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm rounded-circle bg-light me-2">
                            {transaction.user.avatar_url ? (
                              <img
                                src={transaction.user.avatar_url}
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
                            <h6 className="mb-0 font-14">{transaction.user.name}</h6>
                            <small className="text-muted">
                              {transaction.unit?.block && transaction.unit?.number
                                ? `${transaction.unit.block}-${transaction.unit.number}`
                                : transaction.community?.name || 'Unassigned'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon={serviceIcon(transaction.service)} className="me-2" />
                          {transaction.service}
                        </div>
                      </td>
                      <td>{transaction.provider || 'Direct service'}</td>
                      <td className="fw-semibold">{transaction.amount_formatted}</td>
                      <td>
                        <Badge bg={statusVariant(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </td>
                      <td>{formatTimestamp(transaction.created_at)}</td>
                      <td>
                        <Button variant="light" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                          <IconifyIcon icon="ri:eye-line" className="me-1" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default RecentTransactionsTable;
