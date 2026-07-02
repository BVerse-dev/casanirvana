'use client';

import React from 'react';

import PersonalHubServiceTransactionsTable from '../../components/PersonalHubServiceTransactionsTable';

interface AirtimeTransactionsTableProps {
  showFilters?: boolean;
  limit?: number;
}

const AirtimeTransactionsTable = ({ showFilters = false, limit }: AirtimeTransactionsTableProps) => (
  <PersonalHubServiceTransactionsTable
    serviceType="airtime"
    showFilters={showFilters}
    limit={limit}
    description="These rows come from live airtime purchase records created through the Personal Hub transaction flow. Amounts, providers, and statuses reflect the actual provider and gateway state recorded for each purchase."
  />
);

export default AirtimeTransactionsTable;
