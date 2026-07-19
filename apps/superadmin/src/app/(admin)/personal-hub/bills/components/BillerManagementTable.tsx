"use client";

import React from 'react';

import PersonalHubCatalogProvidersTable from '../../components/PersonalHubCatalogProvidersTable';

const BillerManagementTable = () => (
  <PersonalHubCatalogProvidersTable
    serviceType="bill_payment"
    entityLabel="Biller"
    includeCategoryColumn={true}
    emptyMessage="No cached bill-payment providers are available yet. Run ExpressPay catalog sync to populate the live biller cache for this workspace."
  />
);

export default BillerManagementTable;
