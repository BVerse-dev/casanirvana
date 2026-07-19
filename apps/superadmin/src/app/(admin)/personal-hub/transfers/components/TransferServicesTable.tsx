"use client";

import React from 'react';

import PersonalHubCatalogProvidersTable from '../../components/PersonalHubCatalogProvidersTable';

const TransferServicesTable = () => (
  <PersonalHubCatalogProvidersTable
    serviceType="money_transfer"
    entityLabel="Service"
    emptyMessage="No cached money-transfer services are available yet. Run ExpressPay catalog sync to populate the live transfer-service cache for this workspace."
  />
);

export default TransferServicesTable;
