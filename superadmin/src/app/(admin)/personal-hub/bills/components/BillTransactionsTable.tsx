'use client';

import React from 'react';

import PersonalHubServiceTransactionsTable from '../../components/PersonalHubServiceTransactionsTable';

interface BillTransactionsTableProps {
  showFilters?: boolean;
  limit?: number;
}

const BillTransactionsTable = ({ showFilters = false, limit }: BillTransactionsTableProps) => (
  <PersonalHubServiceTransactionsTable
    serviceType="bill_payment"
    showFilters={showFilters}
    limit={limit}
    description="These rows come from live utility and subscription bill-payment records. Validation happens through the ExpressPay query flow, and the resulting provider, resident, and status values shown here are the operational source of truth."
  />
);

export default BillTransactionsTable;
