'use client';

import React from 'react';

import PersonalHubServiceTransactionsTable from '../../components/PersonalHubServiceTransactionsTable';

interface DataTransactionsTableProps {
  showFilters?: boolean;
  limit?: number;
}

const DataTransactionsTable = ({ showFilters = false, limit }: DataTransactionsTableProps) => (
  <PersonalHubServiceTransactionsTable
    serviceType="data"
    showFilters={showFilters}
    limit={limit}
    description="These rows come from live data-bundle purchase records. Package selection, provider attribution, resident context, and payment status are all sourced from the normalized Personal Hub transaction ledger."
  />
);

export default DataTransactionsTable;
