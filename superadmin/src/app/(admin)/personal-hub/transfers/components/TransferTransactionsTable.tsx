'use client';

import React from 'react';

import PersonalHubServiceTransactionsTable from '../../components/PersonalHubServiceTransactionsTable';

interface TransferTransactionsTableProps {
  showFilters?: boolean;
  limit?: number;
}

const TransferTransactionsTable = ({ showFilters = false, limit }: TransferTransactionsTableProps) => (
  <PersonalHubServiceTransactionsTable
    serviceType="money_transfer"
    showFilters={showFilters}
    limit={limit}
    description="These rows come from live money-transfer records created through the Personal Hub checkout flow. The workspace is read-only: provider settlement status is tracked here, while upstream KYC and transfer validation remain enforced by the provider rail."
  />
);

export default TransferTransactionsTable;
