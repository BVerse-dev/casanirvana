"use client";

import React from 'react';

import PersonalHubCatalogProvidersTable from '../../components/PersonalHubCatalogProvidersTable';

const ProviderManagementTable = () => (
  <PersonalHubCatalogProvidersTable
    serviceType="airtime"
    entityLabel="Provider"
    emptyMessage="No cached airtime providers are available yet. Run ExpressPay catalog sync to populate the live provider cache for this workspace."
  />
);

export default ProviderManagementTable;
