"use client";

import React from 'react';

import PersonalHubCatalogProvidersTable from '../../components/PersonalHubCatalogProvidersTable';

const InsuranceProviderTable = () => (
  <PersonalHubCatalogProvidersTable
    serviceType="insurance"
    entityLabel="Provider"
    emptyMessage="No cached insurance providers are available yet. Run ExpressPay catalog sync to populate the live insurance-provider cache for this workspace."
  />
);

export default InsuranceProviderTable;
