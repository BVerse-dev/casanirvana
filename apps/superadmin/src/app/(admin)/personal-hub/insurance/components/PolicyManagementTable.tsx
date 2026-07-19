'use client';

import React from 'react';

import PersonalHubServiceTransactionsTable from '../../components/PersonalHubServiceTransactionsTable';

interface PolicyManagementTableProps {
  showFilters?: boolean;
  limit?: number;
}

const PolicyManagementTable = ({ showFilters = false, limit }: PolicyManagementTableProps) => (
  <PersonalHubServiceTransactionsTable
    serviceType="insurance"
    showFilters={showFilters}
    limit={limit}
    description="Casa Nirvana currently records live insurance premium payments, not a standalone in-platform policy registry. Use this workspace to review the policy-linked payment records that were created after provider query validation and sent through ExpressPay."
  />
);

export default PolicyManagementTable;
